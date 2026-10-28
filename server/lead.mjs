// Приёмник заявок с сайта itis.marketing.
// Принимает POST /api/lead от формы, отправляет заявку в Telegram-бот и на e-mail.
// Работает за Caddy в том же контейнере (Caddy проксирует /api/* на 127.0.0.1:3000).
//
// Настройки — через переменные окружения (задаются в Timeweb → Apps → Переменные):
//   TG_BOT_TOKEN   токен бота от @BotFather
//   TG_CHAT_ID     id чата или группы, куда слать заявки (можно несколько через запятую)
//   SMTP_HOST      например smtp.yandex.ru
//   SMTP_PORT      465 (SSL) или 587 (STARTTLS)
//   SMTP_USER      почтовый ящик-отправитель, например site@itis.marketing
//   SMTP_PASS      пароль приложения для этого ящика
//   LEAD_EMAIL_TO  куда слать заявки (можно несколько через запятую)
// Каналы независимы: если не задан Telegram — заявка уйдёт только на почту, и наоборот.

import http from 'node:http';
import nodemailer from 'nodemailer';

const env = process.env;
const PORT = Number(env.LEAD_PORT || 3000);
const TG_API = env.TG_API_BASE || 'https://api.telegram.org'; // подменяется в тестах
const tgChats = (env.TG_CHAT_ID || '').split(',').map((s) => s.trim()).filter(Boolean);
const mailTo = (env.LEAD_EMAIL_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
const smtpPort = Number(env.SMTP_PORT || 465);

const mailer = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && mailTo.length
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

const channels = [env.TG_BOT_TOKEN && tgChats.length ? 'telegram' : null, mailer ? 'email' : null].filter(Boolean);
console.log(`[lead] старт на :${PORT}, каналы: ${channels.join(', ') || 'НЕ НАСТРОЕНЫ'}`);

// --- защита от спама: не больше 5 заявок с одного IP за 10 минут ---
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const clean = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 20_000) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parse(raw, type) {
  if (type.includes('application/json')) return JSON.parse(raw || '{}');
  return Object.fromEntries(new URLSearchParams(raw));
}

async function sendTelegram(lead) {
  const lines = [
    `🔥 <b>Заявка с сайта</b> · ${esc(lead.topic || 'без темы')}`,
    '',
    `<b>Имя:</b> ${esc(lead.name)}`,
    `<b>Телефон:</b> ${esc(lead.phone)}`,
    lead.task && `<b>Задача:</b> ${esc(lead.task)}`,
    lead.page && `<b>Страница:</b> ${esc(lead.page)}`,
    lead.utm && `<b>Источник:</b> ${esc(lead.utm)}`,
    `<i>${esc(lead.time)}</i>`,
  ].filter(Boolean).join('\n');
  const results = await Promise.all(tgChats.map(async (chat) => {
    const r = await fetch(`${TG_API}/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: lines, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`);
  }));
  return results.length;
}

async function sendEmail(lead) {
  const rows = [['Тема', lead.topic], ['Имя', lead.name], ['Телефон', lead.phone], ['Задача', lead.task], ['Страница', lead.page], ['Источник', lead.utm], ['Время', lead.time]]
    .filter(([, v]) => v);
  await mailer.sendMail({
    from: `"Сайт itis.marketing" <${env.SMTP_USER}>`,
    to: mailTo,
    subject: `Заявка с сайта: ${lead.name}, ${lead.phone} (${lead.topic || 'без темы'})`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<h2 style="font-family:Arial">Заявка с сайта itis.marketing</h2><table style="font-family:Arial;font-size:15px;border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#666">${esc(k)}</td><td style="padding:6px 0"><b>${esc(String(v))}</b></td></tr>`)
      .join('')}</table>`,
  });
}

function reply(res, status, body, wantsHtml) {
  if (wantsHtml) {
    // Форма отправлена без JavaScript — возвращаем человека на страницу «Спасибо» или назад.
    res.writeHead(303, { location: status === 200 ? '/spasibo/' : '/kontakty/?error=1' });
    return res.end();
  }
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/health') return reply(res, 200, { ok: true, channels });
  if (url.pathname !== '/api/lead') return reply(res, 404, { ok: false, error: 'not found' });
  if (req.method !== 'POST') return reply(res, 405, { ok: false, error: 'method' });

  const type = req.headers['content-type'] || '';
  const wantsHtml = !type.includes('application/json');
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

  let data;
  try { data = parse(await readBody(req), type); } catch { return reply(res, 400, { ok: false, error: 'bad request' }, wantsHtml); }

  // Ловушка для ботов: скрытое поле website заполняют только роботы. Отвечаем «успешно», ничего не отправляя.
  if (clean(data.website)) return reply(res, 200, { ok: true }, wantsHtml);
  if (rateLimited(ip)) return reply(res, 429, { ok: false, error: 'Слишком много заявок, попробуйте позже' }, wantsHtml);

  const lead = {
    name: clean(data.name, 100),
    phone: clean(data.phone, 40),
    task: clean(data.task, 1000),
    topic: clean(data.topic, 100),
    page: clean(data.page, 300),
    utm: clean(data.utm, 300),
    time: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' МСК',
  };
  if (!lead.name || lead.phone.replace(/\D/g, '').length < 10) {
    return reply(res, 422, { ok: false, error: 'Укажите имя и телефон' }, wantsHtml);
  }
  if (!channels.length) {
    console.error('[lead] каналы не настроены, заявка не отправлена:', JSON.stringify(lead));
    return reply(res, 503, { ok: false, error: 'Приём заявок не настроен' }, wantsHtml);
  }

  const tasks = [];
  if (channels.includes('telegram')) tasks.push(sendTelegram(lead).then(() => 'telegram'));
  if (channels.includes('email')) tasks.push(sendEmail(lead).then(() => 'email'));
  const settled = await Promise.allSettled(tasks);
  const delivered = settled.filter((s) => s.status === 'fulfilled').map((s) => s.value);
  settled.filter((s) => s.status === 'rejected').forEach((s) => console.error('[lead] ошибка канала:', s.reason?.message));
  // Заявку дублируем в лог: если оба канала упадут, её можно достать из логов Timeweb.
  console.log(`[lead] ${delivered.length ? 'доставлено' : 'НЕ ДОСТАВЛЕНО'} (${delivered.join(', ') || '-'}):`, JSON.stringify(lead));

  if (!delivered.length) return reply(res, 502, { ok: false, error: 'Не удалось отправить, позвоните нам' }, wantsHtml);
  return reply(res, 200, { ok: true, delivered }, wantsHtml);
});

server.listen(PORT, '127.0.0.1');
