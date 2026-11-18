#!/bin/bash
# Быстрый локальный запуск CAMPUS ONE на SQLite (без Docker и PostgreSQL)
set -e
cd "$(dirname "$0")"

echo "=== Установка зависимостей ==="
npm install --no-audit --no-fund

echo "=== Генерация Prisma Client ==="
npx prisma generate

echo "=== Создание базы и миграция ==="
cp -n .env.example .env 2>/dev/null || true
npx prisma db push

echo "=== Seed ==="
npm run db:seed || echo "Seed завершён или уже выполнен"

echo "=== Запуск ==="
echo "Откройте http://localhost:3000"
echo "Логины: studentA / studentB / deanery"
npm run dev
