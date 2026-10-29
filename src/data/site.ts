// Единый источник данных о компании: контакты, меню, услуги, отрасли.
// Меняете здесь — меняется во всех шапках, подвалах и разметке Schema.org.

export const site = {
  name: 'itis маркетинг',
  legalName: 'ООО «Рост-Решения»',
  url: 'https://itis.marketing',
  phone: '+7 (843) 258-04-45',
  phoneHref: 'tel:+78432580445',
  email: 'marat@itis.marketing',
  telegram: 'https://t.me/itismarketing',
  cities: ['Москва', 'Казань', 'Санкт-Петербург'],
  // Головной офис
  office: {
    city: 'Казань',
    street: 'ул. Спартаковская, 2, ИТ-парк им. Башира Рамеева, 2 этаж',
    postalCode: '420107',
    region: 'Республика Татарстан',
  },
  // Подтверждение прав в Яндекс Вебмастере и Google Search Console (перенесено со старого сайта)
  yandexVerification: 'e08440f1ec7882e8',
  googleVerification: 'vw-RCWwjrhJlD51b7lb1pNeNwAapoo9Qbmcr-BcAhGs',
  // Пиксель VK Рекламы (был на всех страницах старого сайта)
  vkPixel: 'VK-RTRG-1583081-aITqx',
  founded: 2015,
  // ID счётчика Яндекс Метрики. Пусто — счётчик не подключается.
  metrikaId: '74484220',
  // Куда отправляется форма заявки: приёмник server/lead.mjs шлёт её в Telegram-бот и на почту.
  leadEndpoint: '/api/lead',
};

export type NavItem = { href: string; title: string; short?: string; ready?: boolean; price?: string; text?: string };

export const flagship: NavItem[] = [
  { href: '/kompleksnyj-marketing/', title: 'Комплексный маркетинг', short: 'Комплексный маркетинг', price: 'от 90 000 ₽/мес', text: 'Внешний отдел маркетинга: стратегия, каналы, аналитика и отчёт в одних руках.' },
  { href: '/ii-marketolog/', title: 'ИИ-отдел маркетинга', short: 'ИИ-маркетолог', price: 'от 300 000 ₽/мес', text: 'Маркетолог и ИИ-агенты ведут SEO, контекст, контент и контроль звонков.' },
];

export const services: NavItem[] = [
  { href: '/uslugi/seo-prodvizhenie/', title: 'SEO-продвижение', ready: true, price: 'от 35 000 ₽/мес', text: 'Яндекс и Google, мультирегиональное и международное SEO, рост заявок из поиска.' },
  { href: '/uslugi/kontekstnaya-reklama/', title: 'Контекстная реклама', price: 'от 35 000 ₽/мес', text: 'Яндекс Директ с контролем стоимости заявки и сквозной аналитикой.' },
  { href: '/uslugi/razrabotka-sajtov/', title: 'Сайты и лендинги', price: 'от 200 000 ₽', text: 'Продающие сайты, которые видят поисковики, — с аналитикой с первого дня.' },
  { href: '/uslugi/marketingovye-issledovaniya/', title: 'Маркетинговые исследования', price: 'от 400 000 ₽', text: 'Рынок, конкуренты, бизнес-модели и финансовая модель под решение собственника.' },
  { href: '/uslugi/marketingovaya-strategiya/', title: 'Маркетинговая стратегия', price: 'от 150 000 ₽', text: 'Позиционирование, каналы, бюджет и план заявок на год.' },
  { href: '/uslugi/ii-analitika-zvonkov/', title: 'ИИ-аналитика звонков', price: 'по запросу', text: 'Оценка 100% звонков колл-центра и администраторов, рейтинги и обучение.' },
  { href: '/uslugi/tehpodderzhka-sajtov/', title: 'Техподдержка сайтов', price: 'от 25 000 ₽/мес', text: 'Мониторинг, обновления, безопасность и SEO-гигиена.' },
  { href: '/uslugi/reputaciya-i-geo/', title: 'Репутация и карты', price: 'от 10 000 ₽', text: 'Яндекс Карты, 2ГИС, Google Maps: карточки, отзывы, рейтинг филиалов.' },
];

export const industries: NavItem[] = [
  { href: '/otrasli/medicina/', title: 'Медицина и клиники', ready: true, text: 'Сети клиник, медцентры, узкопрофильные клиники.' },
  { href: '/otrasli/avtobiznes/', title: 'Автобизнес', text: 'Дилеры, автосервисы, прокат.' },
  { href: '/otrasli/promyshlennost-b2b/', title: 'Промышленность и B2B', text: 'Производство, ИТ, сложные продажи.' },
  { href: '/otrasli/nedvizhimost/', title: 'Недвижимость', text: 'Застройщики, склады, бизнес-центры.' },
  { href: '/otrasli/finansy/', title: 'Финансы', text: 'Инвесткомпании, банки, страхование.' },
  { href: '/otrasli/brendy-e-commerce/', title: 'Бренды и e-commerce', text: 'Интернет-магазины и выход на зарубежные рынки.' },
];

export const mainNav: NavItem[] = [
  { href: '/kompleksnyj-marketing/', title: 'Комплексный маркетинг' },
  { href: '/uslugi/', title: 'Услуги' },
  { href: '/otrasli/', title: 'Отрасли' },
  { href: '/keisy/', title: 'Кейсы' },
  { href: '/ceny/', title: 'Цены' },
  { href: '/blog/', title: 'Блог' },
  { href: '/kontakty/', title: 'Контакты' },
];

// Клиенты, которых разрешено упоминать.
export const clients = {
  'Промышленность и ИТ': ['КАМАЗ Digital', 'БАРС Груп', 'ОЭЗ «Иннополис»', 'Татнефть'],
  'Медицина': ['«Ариадна»', '«Ибис»', '«Корд»', 'Zen Clinic', 'Клиника Курпатова'],
  'Авто': ['ТТС', 'Major Expert', 'KozaPark', 'КанАвто'],
  'Финансы и недвижимость': ['Кама Капитал', 'Татсоцбанк', 'Q-Park', 'Корнер'],
  'Бренды и e-com': ['Гоша Рубчинский', 'Cvetov.ru', 'Авито', 'МегаФон', 'Yoola'],
};
