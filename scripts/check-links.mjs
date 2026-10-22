// Проверка внутренних ссылок в собранном сайте: каждая ссылка вида /path/ должна вести на существующий файл.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })('dist');
const broken = new Map();
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const u = m[1];
    if (u.startsWith('//')) continue;
    const target = join('dist', u.endsWith('/') ? u + 'index.html' : u);
    if (!existsSync(target)) broken.set(u, (broken.get(u) || new Set()).add(f.replace('dist', '')));
  }
}
for (const [u, from] of broken) console.log(`✗ ${u}  ← ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? ` и ещё ${from.size - 3}` : ''}`);
console.log(broken.size ? `Битых ссылок: ${broken.size}` : '✓ Битых внутренних ссылок нет');
process.exit(broken.size ? 1 : 0);
