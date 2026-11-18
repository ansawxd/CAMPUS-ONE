# Развёртывание CAMPUS ONE

## Требования

- Node.js 20+
- PostgreSQL 15+
- npm

## Docker Compose (рекомендуется)

PostgreSQL поднимается автоматически, данные сохраняются в томе `campus_pgdata`. Порт базы наружу не открыт.

```bash
cd campus-one

# Сборка и запуск
docker compose up -d --build

# Проверка логов
docker compose logs -f app

# Seed (один раз)
docker compose exec app npm run db:seed

# Остановка (данные сохраняются)
docker compose down

# Полная очистка вместе с данными
# docker compose down -v
```

Приложение: http://localhost:3000

Переменные можно переопределить через `.env` рядом с `docker-compose.yml`:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strong-password
POSTGRES_DB=campus_one
```

Тестовые логины после seed: `studentA`, `studentB`, `deanery`.  
Пароль выводится в терминал при первом запуске seed (по умолчанию `DemoPass1`).

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
