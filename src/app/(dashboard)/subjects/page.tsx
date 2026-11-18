import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assessmentLabel } from "@/lib/labels";

export default async function SubjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = user.student;
  if (!student) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Дисциплины и успеваемость</h1>
        <p className="text-neutral-500">Раздел доступен студентам.</p>
      </div>
    );
  }

  const groupSubjects = await prisma.groupSubject.findMany({
    where: { groupId: student.groupId },
    include: { subject: true },
    orderBy: { subject: { name: "asc" } },
  });

  const rows = [];
  for (const { subject } of groupSubjects) {
    // Преподаватель — по любой паре этой дисциплины у группы
    const lesson = await prisma.lesson.findFirst({
      where: { groupId: student.groupId, subjectId: subject.id },
      include: { teacher: { include: { user: { select: { fullName: true } } } } },
    });
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, subjectId: subject.id },
      orderBy: { createdAt: "asc" },
    });
    const total = await prisma.attendance.count({
      where: { studentId: student.id, lesson: { subjectId: subject.id } },
    });
    const attended = await prisma.attendance.count({
      where: { studentId: student.id, present: true, lesson: { subjectId: subject.id } },
    });
    rows.push({ subject, teacher: lesson?.teacher.user.fullName ?? "—", grades, total, attended });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Дисциплины и успеваемость</h1>
      {rows.length === 0 && <p className="text-neutral-500">Дисциплины не назначены</p>}
      <div className="grid gap-4">
        {rows.map((r) => (
          <div key={r.subject.id} className="border rounded-lg p-4">
            <div className="flex justify-between gap-4">
              <h2 className="font-medium">{r.subject.name}</h2>
              <span className="text-sm text-neutral-500">{assessmentLabel[r.subject.assessment]}</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {r.subject.hours} ч · {r.teacher}
            </p>
            <p className="text-sm mt-2">
              Посещаемость: {r.attended} / {r.total}
            </p>
            <p className="text-sm">
              Оценки:{" "}
              {r.grades.length === 0
                ? <span className="text-neutral-400">пока нет</span>
                : r.grades.map((g) => (
                    <span key={g.id} title={g.comment ?? ""} className="inline-block border rounded px-1.5 mr-1">
                      {g.value}
                    </span>
                  ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
