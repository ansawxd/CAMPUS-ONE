import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);

  // Студенты видят только фото, ФИО, курс, группу
  const students = await prisma.student.findMany({
    where: q ? { user: { fullName: { contains: q, mode: "insensitive" } } } : {},
    include: {
      user: { select: { fullName: true, photoUrl: true } },
      group: { select: { name: true } },
    },
    take: 50,
  });

  const safeStudents = students.map(s => ({
    id: s.id,
    fullName: s.user.fullName,
    photoUrl: s.user.photoUrl,
    course: s.course,
    group: s.group.name,
  }));

  // Преподаватели — больше полей (упрощённо)
  const teachers = await prisma.teacher.findMany({
    where: q ? { user: { fullName: { contains: q, mode: "insensitive" } } } : {},
    include: {
      user: { select: { fullName: true, photoUrl: true } },
      department: { select: { name: true } },
    },
    take: 20,
  });

  const safeTeachers = teachers.map(t => ({
    id: t.id,
    fullName: t.user.fullName,
    photoUrl: t.user.photoUrl,
    position: t.position,
    department: t.department.name,
  }));

  return NextResponse.json({ students: safeStudents, teachers: safeTeachers });
}
