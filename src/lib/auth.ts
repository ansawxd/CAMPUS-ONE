import argon2 from "argon2";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Хеширование пароля Argon2id
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    // Повреждённый или не-argon2 хеш в базе — считаем пароль неверным, а не роняем сервер
    return false;
  }
}

// Создание сессии: случайный токен в cookie, в БД только его хеш
export async function createSession(userId: string) {
  const cookieStore = await cookies();

  // Защита от фиксации сессии: старая сессия из этого браузера отзывается
  const oldToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (oldToken) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(oldToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Уборка: удаляем протухшие сессии этого пользователя
  await prisma.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

// Текущий пользователь (без passwordHash) вместе с профилем студента/преподавателя
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { student: true, teacher: true } } },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;

  // passwordHash никогда не уходит дальше этого файла
  const { passwordHash: _hidden, ...user } = session.user;
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

// Выход: отзываем сессию в БД и удаляем cookie
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}
