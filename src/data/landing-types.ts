// Структура посадочной страницы (услуга, продукт, отрасль).
// Тексты лежат в src/data/landings/*.ts, вёрстка — в src/components/Landing.astro.

export type Item = { title: string; text: string; href?: string; tag?: string };
export type Stat = { value: string; label: string };
export type Price = { name: string; value: string; unit?: string; points: string[]; hot?: boolean };
export type Stage = { title: string; points: string[]; time: string };
export type ExtraCase = { metric: string; title: string; desc: string; tags?: string[]; href?: string };

export type Landing = {
  slug: string;
  section: 'uslugi' | 'otrasli' | 'product';
  seoTitle: string;            // <title>, до ~80 символов
  description: string;         // meta description, до ~200 символов
  serviceName: string;         // для Schema.org Service
  priceFrom?: number;          // для Schema.org Offer
  h1: string;
  lead: string;
  eyebrow?: string;
  cta: string;
  pricePill?: string;
  heroStats: Stat[];           // 2–3 цифры справа от заголовка
  heroNote?: string;
  problems: { eyebrow: string; title: string; items: Item[] };
  includes: { eyebrow: string; title: string; lead?: string; items: Item[]; accentLast?: boolean };
  value: { title: string; items: { title: string; text: string }[] };
  compare?: { title: string; lead?: string; head: string[]; rows: string[][] };
  prices: { title: string; lead?: string; items: Price[] };
  stages: { title: string; lead?: string; items: Stage[] };
  cases: { ids?: string[]; industry?: string; service?: string; title?: string; extra?: ExtraCase[]; note?: string };
  notPromise: string[];
  related: { title: string; items: Item[] };
  faq: { q: string; a: string }[];
  faqTitle: string;
  form: { topic: string; title: string; lead: string };
};
