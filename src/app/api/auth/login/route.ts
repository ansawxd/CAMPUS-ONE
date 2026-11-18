import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import {
  logFailedLogin,
  isRateLimited,
  registerFailure,
  clearFailures,
  getClientIp,
} from "@/lib/security";
import { explainDbError } from "@/lib/db-errors";
import { z } from "zod";

const schema = z.object({
  login: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(128),
});

// Одно сообщение для "нет логина" и "не тот пароль" — чтобы нельзя было перебирать логины
const INVALID = "Неверный логин или пароль";

export async function POST(req: Request) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Введите логин и пароль" }, { status: 400 });
  }

  const { login, password } = parsed.data;
  const ip = getClientIp(req);
  const ipKey = `ip:${ip}`;
  const loginKey = `login:${login.toLowerCase()}`;

  if (isRateLimited(ipKey) || isRateLimited(loginKey)) {
    return NextResponse.json(
      { error: "Слишком много неудачных попыток. Подождите 15 минут." },
      { status: 429 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: { login: { equals: login, mode: "insensitive" } },
    });

    // Если пользователя нет — всё равно проверяем пароль (против фиктивного хеша),
    // чтобы по времени ответа нельзя было понять, существует ли логин
    const hash = user ? user.passwordHash : DUMMY_HASH;
    const passwordOk = await verifyPassword(hash, password);
    const valid = user !== null && passwordOk;

    if (!user || !valid) {
      registerFailure(ipKey);
      registerFailure(loginKey);
      await logFailedLogin(login, ip, user?.id ?? null);
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    clearFailures(ipKey);
    clearFailures(loginKey);
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Ошибка входа:", e);
    // В разработке показываем конкретную причину и как её исправить.
    // В production — только общий текст, чтобы не раскрывать устройство сервера.
    const message =
      process.env.NODE_ENV === "production"
        ? "Сервис временно недоступен. Попробуйте позже."
        : explainDbError(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Хеш случайной строки, нужен только для выравнивания времени ответа
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$/MQ44WjmpyHXoesvZtBnNg$exsd00fe8dQ3/PI9NU7YIFlWMbvIs/pEupQzUFTja+w";
