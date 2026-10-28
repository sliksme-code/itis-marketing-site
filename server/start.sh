#!/bin/sh
# Запуск: приёмник заявок в фоне (с автоперезапуском при падении) и Caddy на переднем плане.
(while true; do node /lead/lead.mjs; echo "[lead] перезапуск через 2 с"; sleep 2; done) &
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
