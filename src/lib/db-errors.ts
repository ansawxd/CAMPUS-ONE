import { Prisma } from "@prisma/client";

/**
 * Превращает ошибку Prisma в понятную подсказку на русском.
 * Коды ошибок: https://www.prisma.io/docs/orm/reference/error-reference
 */
export function explainDbError(e: unknown): string {
  // Ошибки подключения (база не запущена, неверный пароль, нет базы)
  if (e instanceof Prisma.PrismaClientInitializationError) {
    switch (e.errorCode) {
      case "P1001":
        return "PostgreSQL не отвечает по адресу из DATABASE_URL (localhost:5433). Запустите Docker Desktop и выполните: docker compose up -d db";
      case "P1000":
        return "PostgreSQL отклонил логин/пароль из DATABASE_URL в .env. Проверьте, что в .env порт 5433 (база из Docker), а не 5432 (PostgreSQL, установленный в Windows).";
      case "P1003":
        return "Базы campus_one нет на сервере PostgreSQL. Выполните: npm run db:reset";
      default:
        return `Prisma не может подключиться к базе (${e.errorCode ?? "без кода"}). Проверьте DATABASE_URL в .env.`;
    }
  }

  // Ошибки запросов (нет таблицы/колонки — не применены миграции)
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021" || e.code === "P2022") {
      return "В базе нет нужных таблиц или колонок — не применены миграции. Выполните: npm run db:reset";
    }
    return `Ошибка базы данных ${e.code}. Подробности — в терминале, где запущен npm run dev.`;
  }

  // Prisma-клиент не сгенерирован или устарел
  if (e instanceof Prisma.PrismaClientValidationError) {
    return "Prisma-клиент не совпадает со схемой. Выполните: npx prisma generate и перезапустите npm run dev";
  }

  return "Неизвестная ошибка сервера. Подробности — в терминале, где запущен npm run dev.";
}
