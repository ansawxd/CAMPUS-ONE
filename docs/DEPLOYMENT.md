# Развёртывание CAMPUS ONE

## Требования

- Node.js 20+
- PostgreSQL 15+
- npm

## Docker Compose (рекомендуется)

PostgreSQL поднимается автоматически, данные сохраняются в томе `campus_pgdata`.
Порт базы открыт только на `127.0.0.1` (из сети недоступен).

```bash
cd campus-one

# 1. База + приложение
docker compose up -d --build

# 2. Миграции и seed — с хоста (в образе приложения нет Prisma CLI и tsx)
npm install
npx prisma migrate deploy
npm run db:seed

# Логи
docker compose logs -f app

# Остановка (данные сохраняются) / полная очистка
docker compose down
# docker compose down -v
```

Приложение: http://localhost:3000

Переменные можно переопределить через `.env` рядом с `docker-compose.yml`
(обязательно задайте сильный пароль, если база будет не только на вашем ноутбуке):
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strong-password
POSTGRES_DB=campus_one
```

Демо-логины после seed: `studentA`, `studentB`, `teacher`, `teacher2`, `deanery`, `admin`, пароль `DemoPass1`.
Сбросить демо-базу полностью: `npm run db:reset`.

## Production (Node.js, не static export)

1. Установите зависимости и соберите:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
2. Примените миграции:
   ```bash
   npx prisma migrate deploy
   ```
3. Запустите:
   ```bash
   npm start
   ```
4. Переменные окружения:
   - `DATABASE_URL` — строка подключения PostgreSQL
   - `NODE_ENV=production`

## Хостинг-кандидаты (из ТЗ)

- Amvera Cloud
- Timeweb Cloud

Проверьте: HTTPS, SSR, доступность из российских сетей, сохранение данных после перезапуска.

## Важно

- `.env` не коммитить.
- Миграции должны быть в репозитории.
- Seed запускать только на демо-окружении.
