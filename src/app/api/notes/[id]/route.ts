import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";

// Удалить можно только СВОЮ заметку: условие на владельца стоит прямо в запросе,
// поэтому чужой id (IDOR) просто ничего не удалит.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await prisma.note.deleteMany({
    where: { id, student: { userId: user.id } },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
