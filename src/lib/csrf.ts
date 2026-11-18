/**
 * Защита от CSRF через заголовок Origin.
 * Для мутирующих запросов (POST, PATCH, DELETE) браузер всегда присылает Origin,
 * и он должен совпадать с адресом нашего сайта.
 *
 * Раньше запрос БЕЗ Origin (или с кривым Origin) пропускался — это была дыра.
 */
export function csrfGuard(request: Request): Response | null {
  const origin = request.headers.get("origin");
  // За прокси (nginx, хостинг) настоящий хост лежит в x-forwarded-host
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  let ok = false;
  if (origin && host) {
    try {
      ok = new URL(origin).host === host;
    } catch {
      ok = false;
    }
  }

  if (ok) return null;

  return new Response(JSON.stringify({ error: "Запрос отклонён (CSRF)" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
