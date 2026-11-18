import { Prisma } from "@prisma/client";

/**
 * Превращает ошибку Prisma в понятную подсказку на русском.
 * Коды ошибок: https://www.prisma.io/docs/orm/reference/error-reference
 */
export function explainDbError(e: unknown): string {
  // Ошибки подключения (база не запущена, неверный пароль, нет базы)
  if (e instanceof Prisma.PrismaClientInitializationError) {
    // Иногда errorCode пустой — тогда узнаём ошибку по тексту
    let code = e.errorCode;
    if (!code && e.message.includes("Can't reach database server")) code = "P1001";
    if (!code && e.message.includes("Authentication failed")) code = "P1000";
    switch (code) {
      case "P1001":
        return "PostgreSQL не отвечает по адресу из DATABASE_URL (localhost:5433). Запустите Docker Desktop и выполните: docker compose up -d db";
      case "P1000":
        return "PostgreSQL отклонил логин/пароль из DATABASE_URL в .env. Проверьте, что в .env порт 5433 (база из Docker), а не 5432 (PostgreSQL, установленный в Windows).";
      case "P1003":
        return "Базы campus_one нет на сервере PostgreSQL. Выполните: npm run db:reset";
      default:
        // Кода нет — показываем сам текст ошибки Prisma, он обычно всё объясняет
        return `Prisma не может подключиться к базе: ${shortMessage(e.message)}`;
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

  if (e instanceof Error) return "Ошибка сервера: " + shortMessage(e.message);
  return "Неизвестная ошибка сервера. Подробности — в терминале, где запущен npm run dev.";
}

// Убираем служебные строки Prisma ("Invalid `prisma.user.findFirst()` invocation") и обрезаем длину
function shortMessage(message: string): string {
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("Invalid `"));
  const text = lines.join(" ").slice(0, 300);
  return text || "без описания (см. терминал с npm run dev)";
}
