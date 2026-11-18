import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";

export async function POST(req: Request) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  await destroySession();
  return NextResponse.json({ ok: true });
}
