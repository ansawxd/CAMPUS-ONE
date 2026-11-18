// Диагностика базы для CAMPUS ONE.
// Запуск: npm run db:check
// Проверяет по шагам: подключение -> миграции -> пользователи -> пароль демо-пользователя.

import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import fs from "node:fs";

const prisma = new PrismaClient();

function ok(text) {
  console.log("  [OK]   " + text);
}
function fail(text, fix) {
  console.log("  [ОШИБКА] " + text);
  if (fix) console.log("  Что сделать: " + fix);
}

async function main() {
  console.log("\nПроверка базы CAMPUS ONE\n");

  // 1. Подключение
  const url = process.env.DATABASE_URL ?? "";
  console.log("DATABASE_URL: " + url.replace(/:[^:@/]+@/, ":***@"));
  try {
    const rows = await prisma.$queryRaw`SELECT version() AS v, current_database() AS db`;
    ok("Подключение есть: " + rows[0].db + " · " + String(rows[0].v).split(",")[0]);
  } catch (e) {
    const code = e.errorCode ?? e.code ?? "";
    if (code === "P1001") fail("PostgreSQL не отвечает (localhost:5433)", "docker compose up -d db");
    else if (code === "P1000")
      fail(
        "Неверный логин/пароль PostgreSQL",
        "проверьте, что в .env порт 5433 (база из Docker), а не 5432 (PostgreSQL из Windows)"
      );
    else if (code === "P1003") fail("Базы campus_one не существует", "npm run db:reset");
    else fail("Не удалось подключиться: " + (e.message ?? e), "проверьте DATABASE_URL в .env");
    return;
  }

  // 2. Миграции
  const folders = fs
    .readdirSync("prisma/migrations")
    .filter((name) => /^\d+_/.test(name))
    .sort();
  let applied = [];
  try {
    const rows = await prisma.$queryRaw`
      SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY migration_name`;
    applied = rows.map((r) => r.migration_name);
  } catch {
    fail("Таблицы _prisma_migrations нет — миграции ни разу не применялись", "npm run db:reset");
    return;
  }
  const missing = folders.filter((f) => !applied.includes(f));
  if (missing.length > 0) {
    fail("Не применены миграции: " + missing.join(", "), "npm run db:reset");
    return;
  }
  ok("Все миграции применены (" + applied.length + ")");

  // 3. Пользователи
  const count = await prisma.user.count();
  if (count === 0) {
    fail("В базе нет пользователей — seed не запускался", "npm run db:seed");
    return;
  }
  ok("Пользователей в базе: " + count);

  // 4. Пароль демо-пользователя
  const admin = await prisma.user.findFirst({ where: { login: { equals: "admin", mode: "insensitive" } } });
  if (!admin) {
    fail("Нет пользователя admin", "npm run db:seed");
    return;
  }
  const passwordOk = await argon2.verify(admin.passwordHash, "DemoPass1").catch(() => false);
  if (!passwordOk) {
    fail("У admin пароль не DemoPass1", "npm run db:seed (он заново выставит пароли)");
    return;
  }
  ok("admin / DemoPass1 — пароль подходит");

  console.log("\nВсё в порядке. Если вход всё равно не работает — перезапустите npm run dev.\n");
}

main()
  .catch((e) => {
    console.error("Неожиданная ошибка:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
