# itis.marketing — сайт агентства

Статический сайт на [Astro](https://astro.build): каждая страница собирается в готовый HTML, который поисковые роботы читают без JavaScript. Отдаёт сайт веб-сервер Caddy с 301-редиректами со старых адресов Tilda; заявки с форм принимает небольшой Node-сервис в том же контейнере и пересылает в Telegram и на почту.

## Как устроено

| Где | Что |
|---|---|
| `src/data/site.ts` | Контакты, меню, список услуг и отраслей с ценами «от», клиенты. Один источник для всех страниц |
| `src/content/cases/*.md` | Кейсы (21). Новый кейс — новый файл. `draft: true` — данные уточняются: страница закрыта от индексации и не попадает в sitemap |
| `src/content/blog/*.md` | Статьи блога. Новая статья — новый файл |
| `src/data/landings/*.ts` | Тексты страниц услуг, отраслей и продуктов (общий шаблон `src/components/Landing.astro`) |
| `src/pages/` | Страницы. Адрес = путь файла: `uslugi/seo-prodvizhenie.astro` → `/uslugi/seo-prodvizhenie/` |
| `src/components/` | Блоки дизайн-системы: кнопки, FAQ, этапы, кейсы, форма заявки, хлебные крошки |
| `src/styles/global.css` | Токены и стили дизайн-системы «itis— маркетинг» |
| `Caddyfile` | Редиректы 301 со старых URL, 410 для удалённых страниц, кэш, сжатие |
| `server/lead.mjs` | Приём заявок с формы → Telegram-бот и почта. Настройка: [docs/zayavki.md](docs/zayavki.md) |
| `scripts/check-html.mjs` | Проверка перед деплоем: один H1, title, description, canonical, текст в HTML, валидный JSON-LD |

SEO из коробки: ЧПУ со слэшем на конце, canonical, Open Graph, sitemap-index.xml, robots.txt, Schema.org (Organization, Service, BreadcrumbList, FAQPage, Article).

## Локально

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # сборка в dist/
npm run check:html # SEO-проверка собранных страниц
node scripts/check-links.mjs # битые внутренние ссылки
```

## Деплой в Timeweb Cloud Apps

Деплой из Dockerfile (нужен, чтобы работали настоящие 301-редиректы):

1. Timeweb Cloud → Apps → Создать → **Dockerfile** → подключить GitHub-репозиторий `sliksme-code/itis-marketing-site`, ветка `main`.
2. Порт — `80`. Автодеплой — включить.
3. Сначала проверить на техническом домене Timeweb; после проверки — привязать `itis.marketing` и `www.itis.marketing`.
4. После переключения домена: Яндекс Вебмастер → переобход sitemap `https://itis.marketing/sitemap-index.xml`; проверить редиректы со старых адресов.

Каждый пуш в `main` — новая сборка. Если `check:html` находит ошибку, сборка останавливается и сломанная версия не публикуется.

## Перед запуском

- [ ] Заполнить `metrikaId` в `src/data/site.ts`
- [ ] Подключить Telegram-бот и почту для заявок — инструкция [docs/zayavki.md](docs/zayavki.md)
- [ ] Заменить метки «данные уточняются» в кейсах и снять `draft: true`
- [ ] Перенести 47 статей старой базы знаний (выгрузка из Tilda) и прописать редиректы по одной
- [ ] Утвердить цены «от» (черновик прайса 2026)
- [ ] Юристу — проверить политику обработки персональных данных
