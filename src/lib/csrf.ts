import { NextRequest } from "next/server";

/**
 * Проверка CSRF через заголовок Origin.
 * Для мутирующих запросов (POST, PUT, PATCH, DELETE) Origin должен совпадать с хостом.
 * Не требует самодельной криптографии — соответствует ТЗ.
 */
export function assertSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Хелпер для Route Handlers.
 * Возвращает Response с 403, если проверка не прошла.
 */
export function csrfGuard(request: NextRequest): Response | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // В локальной разработке иногда Origin отсутствует — пропускаем
  if (!origin) return null;

  if (!host) return null;

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return new Response(JSON.stringify({ error: "CSRF check failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    return null;
  }
  return null;
}
