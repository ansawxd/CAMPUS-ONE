import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { z } from "zod";

const noteSchema = z.object({
  body: z.string().min(1),
  subjectId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
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
  const csrfError = csrfGuard(req as any);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) return NextResponse.json({ error: "No student" }, { status: 400 });

  const note = await prisma.note.create({
    data: {
      studentId: student.id,
      body: parsed.data.body,
      subjectId: parsed.data.subjectId,
      lessonId: parsed.data.lessonId,
      pinned: parsed.data.pinned ?? false,
    },
  });
  return NextResponse.json(note);
}
