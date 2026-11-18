# CAMPUS ONE

Концепт цифрового деканата будущего. Демонстрационный проект. Вуз: Университет цифровых технологий и инноваций (УЦТИ).

## Текущее состояние

- Каркас Next.js 15 + Prisma 6 (схема раздела 7) создан.
- Реализованы заготовки и рабочие куски PROMPT 2–8: seed с двумя студентами и деканатом, auth + CSRF, layout, главная, расписание (хелпер конфликтов), дисциплины, профиль, заявки (API создания с проверкой сессии).

## Запуск (полноценный проект, PostgreSQL)

### Вариант A — Docker (рекомендуется)

```bash
docker compose up -d db
# дождитесь готовности базы
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Вариант B — локальный PostgreSQL

1. Установите PostgreSQL 16 и создайте базу `campus_one`.
2. Скопируйте `.env.example` в `.env` и поправьте `DATABASE_URL`.
3. Выполните:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

Логины после seed: `studentA`, `studentB`, `teacher`, `deanery`, `admin`.  
Пароль: `DemoPass1`.

Проект готов к сборке и хостингу (Node.js + PostgreSQL). После `npm install` + миграции + seed доступны:
- вход (`studentA` / `studentB` / `deanery`);
- кабинет с защитой middleware;
- заявки (создание + смена статуса деканатом);
- новости (API).

Дополнительные модули (заметки, карта, полный каталог) — вне обязательного ядра и могут быть добавлены позже.


логины и пароли для пробного входа 
| Роль | Логин | Пароль |
| --- | --- | --- |
| Студент | studentA | DemoPass1 |
| Студент | studentB | DemoPass1 |
| Преподаватель | teacher | DemoPass1 |
| Сотрудник деканата | deanery | DemoPass1 |
