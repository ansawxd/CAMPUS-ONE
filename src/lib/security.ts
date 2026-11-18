import { prisma } from "./prisma";

/**
 * Запись подозрительного входа в AuditLog.
 * userId = null, если такого логина нет (раньше тут был фиктивный id,
 * запись падала на внешнем ключе и лог молча терялся).
 */
export async function logFailedLogin(login: string, ip: string, userId: string | null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "FAILED_LOGIN",
        details: JSON.stringify({ login: login.slice(0, 50), ip }),
      },
    });
  } catch (e) {
    console.error("Не удалось записать FAILED_LOGIN в AuditLog", e);
  }
}

/**
 * Простой in-memory лимит неудачных попыток (для демо; в проде — Redis).
 * Считаем только НЕУДАЧНЫЕ попытки, после успешного входа счётчик сбрасывается.
 */
const failures = new Map<string, { count: number; reset: number }>();

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function isRateLimited(key: string): boolean {
  const rec = failures.get(key);
  if (!rec) return false;
  if (Date.now() > rec.reset) {
    failures.delete(key);
    return false;
  }
  return rec.count >= MAX_FAILURES;
}

export function registerFailure(key: string) {
  const now = Date.now();

  // Защита памяти: при перебое с тысяч адресов чистим просроченные записи
  if (failures.size > 10000) {
    for (const [k, rec] of failures) {
      if (now > rec.reset) failures.delete(k);
    }
  }

  const rec = failures.get(key);
  if (!rec || now > rec.reset) {
    failures.set(key, { count: 1, reset: now + WINDOW_MS });
  } else {
    rec.count++;
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}

/** IP клиента. x-forwarded-for подделывается, поэтому лимит ставим ещё и по логину. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
