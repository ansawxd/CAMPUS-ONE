import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import crypto from "crypto";
import { z } from "zod";

// Одноразовая ссылка сброса (в демо — токен в памяти/БД)
const resetSchema = z.object({
  login: z.string().min(1),
});

export async function POST(req: Request) {
  const csrfError = csrfGuard(req as any);
  if (csrfError) return csrfError;

  const body = await req.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { login: { equals: parsed.data.login, mode: "insensitive" } },
  });

  // Всегда нейтральный ответ
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // В реальной реализации сохранить tokenHash + expires в таблицу PasswordReset
    console.log("[DEMO] Reset token for", user.login, ":", token);
  }

  return NextResponse.json({ ok: true, message: "If account exists, reset link was sent" });
}
