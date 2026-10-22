// Проверка готового HTML перед деплоем: на каждой странице один H1, title,
// description, canonical, и основной текст присутствует в HTML без JavaScript.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })('dist');

let errors = 0;
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const problems = [];
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`H1: ${h1}`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  if (!title) problems.push('нет title'); else if (title.length > 90) problems.push(`title длиннее 90 (${title.length})`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  if (!desc) problems.push('нет description'); else if (desc.length > 220) problems.push(`description длиннее 220 (${desc.length})`);
  if (!f.endsWith('404.html') && !html.includes('rel="canonical"')) problems.push('нет canonical');
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const words = text.split(' ').length;
  if (!f.endsWith('404.html') && words < 150) problems.push(`мало текста в HTML (${words} слов)`);
  for (const m of html.matchAll(/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { problems.push('битый JSON-LD'); } }
  const draft = html.includes('noindex');
  console.log(`${problems.length ? '✗' : '✓'} ${f.replace('dist', '')} — ${words} слов${draft ? ', noindex' : ''}${problems.length ? ' — ' + problems.join('; ') : ''}`);
  errors += problems.length;
}
process.exit(errors ? 1 : 0);
