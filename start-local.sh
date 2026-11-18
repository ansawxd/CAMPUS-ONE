#!/bin/bash
# Быстрый локальный запуск CAMPUS ONE (PostgreSQL в Docker, приложение — локально)
set -e
cd "$(dirname "$0")"

echo "=== PostgreSQL ==="
docker compose up -d db

echo "=== Установка зависимостей ==="
npm install --no-audit --no-fund
cp -n .env.example .env 2>/dev/null || true

echo "=== Миграции + seed ==="
npx prisma generate
npx prisma migrate deploy
npm run db:seed

echo "=== Запуск ==="
echo "Откройте http://localhost:3000"
echo "Логины: studentA / studentB / teacher / deanery / admin, пароль DemoPass1"
npm run dev
