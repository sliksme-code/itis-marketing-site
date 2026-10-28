// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Кейсы с draft: true (данные уточняются) не попадают в sitemap и закрыты noindex.
const draftCases = readdirSync('./src/content/cases')
  .filter((f) => /^draft:\s*true/m.test(readFileSync(`./src/content/cases/${f}`, 'utf8')))
  .map((f) => `/keisy/${f.replace(/\.md$/, '')}/`);

// Сайт собирается в статический HTML: каждая страница — готовый файл,
// который поисковый робот читает без выполнения JavaScript.
export default defineConfig({
  site: 'https://itis.marketing',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/spasibo') && !draftCases.some((p) => page.endsWith(p)),
      changefreq: 'weekly',
    }),
  ],
});
