import { prisma } from "./prisma";

/**
 * Логирование подозрительных входов (неудачные попытки).
 */
export async function logFailedLogin(login: string, ip?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: "00000000-0000-0000-0000-000000000000", // системный
        action: "FAILED_LOGIN",
        details: JSON.stringify({ login: login.slice(0, 50), ip: ip ?? "unknown", at: new Date().toISOString() }),
      },
    });
  } catch {
    // не блокируем вход из-за ошибки лога
  }
}

/**
 * Простой in-memory rate limit для входа (для демо; в проде — Redis).
 */
const attempts = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(key: string, max = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.reset) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (rec.count >= max) return false;
  rec.count++;
  return true;
}
