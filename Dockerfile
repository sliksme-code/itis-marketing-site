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
# Настройки заявок. Timeweb может передать переменные и при сборке (build args), и при запуске —
# так они работают в обоих случаях; значения при запуске имеют приоритет.
ARG TG_BOT_TOKEN TG_CHAT_ID SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS LEAD_EMAIL_TO
ENV TG_BOT_TOKEN=$TG_BOT_TOKEN TG_CHAT_ID=$TG_CHAT_ID SMTP_HOST=$SMTP_HOST SMTP_PORT=$SMTP_PORT \
    SMTP_USER=$SMTP_USER SMTP_PASS=$SMTP_PASS LEAD_EMAIL_TO=$LEAD_EMAIL_TO
RUN chmod +x /start.sh
EXPOSE 80
CMD ["/start.sh"]
