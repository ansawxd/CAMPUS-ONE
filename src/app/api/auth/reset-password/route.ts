import { NextResponse } from "next/server";
import { csrfGuard } from "@/lib/csrf";

/**
 * Сброс пароля в демо НЕ реализован (нет почты и таблицы PasswordReset).
 * Раньше эндпоинт генерировал токен и печатал его в лог сервера —
 * любой, у кого есть доступ к логам, мог сбросить чужой пароль.
 * Теперь просто нейтральный ответ. Пароль сбрасывает деканат/админ.
 */
export async function POST(req: Request) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  return NextResponse.json({
    ok: true,
    message: "Если аккаунт существует, обратитесь в деканат для сброса пароля.",
  });
}
