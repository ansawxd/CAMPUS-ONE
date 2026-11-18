import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { logFailedLogin, checkRateLimit } from "@/lib/security";
import { z } from "zod";

const schema = z.object({
  login: z.string().min(1).max(100),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  const csrfError = csrfGuard(req as any);
  if (csrfError) return csrfError;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRateLimit(`login:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const { login, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { login: { equals: login, mode: "insensitive" } },
  });

  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    await logFailedLogin(login, ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
