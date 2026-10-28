# 1. Сборка сайта: Astro генерирует статический HTML в dist/ и проверяет его
FROM node:22.22.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && npm run check:html && node scripts/check-links.mjs

# 2. Зависимости приёмника заявок
FROM node:22.22.0-alpine AS lead
WORKDIR /lead
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server/lead.mjs ./

# 3. Рабочий образ: Caddy отдаёт сайт, Node принимает заявки
FROM node:22.22.0-alpine
COPY --from=caddy:2.8.4-alpine /usr/bin/caddy /usr/bin/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
COPY --from=lead /lead /lead
COPY server/start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 80
CMD ["/start.sh"]
