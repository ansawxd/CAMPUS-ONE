import argon2 from "argon2";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

// Хеширование пароля Argon2id
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

// Создание сессии: случайный токен, в БД только хеш
export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function revokeSession(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.session.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}
