import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { z } from "zod";

const createSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Студент видит только свои, деканат — все
  const where =
    user.role === "STUDENT"
      ? { student: { userId: user.id } }
      : {};

  const requests = await prisma.request.findMany({
    where,
    include: { student: { include: { user: true } }, history: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const csrfError = csrfGuard(req as any);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) return NextResponse.json({ error: "No student profile" }, { status: 400 });

  const request = await prisma.request.create({
    data: {
      studentId: student.id,
      type: parsed.data.type,
      description: parsed.data.description,
      status: "SUBMITTED",
      history: {
        create: { status: "SUBMITTED", comment: "Создана студентом" },
      },
    },
  });

  return NextResponse.json(request);
}
