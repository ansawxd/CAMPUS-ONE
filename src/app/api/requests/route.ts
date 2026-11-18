import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { z } from "zod";

const createSchema = z.object({
  type: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000),
});

// Какие поля заявки отдаём клиенту. Раньше отдавался весь student.user — вместе с passwordHash!
const requestSelect = {
  id: true,
  type: true,
  description: true,
  status: true,
  createdAt: true,
  student: { select: { user: { select: { fullName: true } } } },
  history: {
    select: { id: true, status: true, comment: true, createdAt: true },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = user.role === "DEANERY_STAFF" || user.role === "ADMIN";

  // Студент — только свои заявки, деканат/админ — все, остальные роли — ничего
  if (user.role !== "STUDENT" && !isStaff) {
    return NextResponse.json([]);
  }

  const requests = await prisma.request.findMany({
    where: isStaff ? {} : { student: { userId: user.id } },
    select: requestSelect,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.student) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Заполните тип и описание (до 1000 символов)" }, { status: 400 });
  }

  const request = await prisma.request.create({
    data: {
      studentId: user.student.id,
      type: parsed.data.type,
      description: parsed.data.description,
      status: "SUBMITTED",
      history: { create: { status: "SUBMITTED", comment: "Создана студентом" } },
    },
    select: requestSelect,
  });

  return NextResponse.json(request);
}
