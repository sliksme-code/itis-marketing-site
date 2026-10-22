// Коллекция кейсов: каждый кейс — отдельный Markdown-файл в src/content/cases/.
// Новый кейс = новый файл; страница, карточки и sitemap обновятся при сборке.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),            // H1 кейса
    seoTitle: z.string(),         // <title>
    description: z.string(),      // meta description
    client: z.string(),
    industry: z.string(),         // slug отрасли: medicina, avtobiznes...
    services: z.array(z.string()), // slug услуг: seo-prodvizhenie...
    city: z.string(),
    period: z.string(),
    logo: z.string().optional(),
    metric: z.string(),           // главная цифра результата
    metricLabel: z.string(),
    summary: z.string(),          // одно предложение для карточки
    results: z.array(z.object({ value: z.string(), label: z.string() })),
    draft: z.boolean().default(false), // true — данные уточняются, страница закрыта от индексации
    order: z.number().default(100),
  }),
});

export const collections = { cases };
