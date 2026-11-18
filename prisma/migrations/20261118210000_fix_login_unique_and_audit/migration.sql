-- 1. Обычный уникальный индекс на login.
--    В схеме стоит @unique, а в init-миграции был только индекс по LOWER(login).
--    Из-за этого prisma.user.upsert({ where: { login } }) падал с ошибкой
--    "no unique or exclusion constraint matching the ON CONFLICT specification",
--    seed не доходил до конца и демо-пользователи не получали пароль.
CREATE UNIQUE INDEX IF NOT EXISTS "User_login_key" ON "User"("login");

-- 2. AuditLog.userId теперь необязательный: неудачный вход по несуществующему логину
--    раньше писался с фиктивным userId и падал на внешнем ключе (лог не сохранялся).
ALTER TABLE "AuditLog" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
