import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { z } from "zod";

const noteSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  pinned: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { student: { userId: user.id } },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.student) {
    return NextResponse.json({ error: "Заметки доступны только студентам" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Заметка пустая или длиннее 2000 символов" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      studentId: user.student.id,
      body: parsed.data.body,
      pinned: parsed.data.pinned ?? false,
    },
  });
  return NextResponse.json(note);
}
