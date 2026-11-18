import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appTimeZone } from "@/lib/constants";
import Link from "next/link";

function formatTime(d: Date) {
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: appTimeZone });
}

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) return <p>Необходимо войти</p>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let lessons: any[] = [];
  if (user.student) {
    lessons = await prisma.lesson.findMany({
      where: {
        groupId: user.student.groupId,
        start: { gte: today, lt: tomorrow },
      },
      include: { subject: true, room: { include: { building: true } }, teacher: { include: { user: true } } },
      orderBy: { start: "asc" },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Расписание на сегодня</h1>
        <Link href="/" className="text-sm underline">На главную</Link>
      </div>

      {lessons.length === 0 ? (
        <p className="text-neutral-500">На сегодня занятий нет</p>
      ) : (
        <ul className="space-y-3">
          {lessons.map((l) => (
            <li key={l.id} className={`border rounded-lg p-4 ${l.isCancelled ? "opacity-50 line-through" : ""}`}>
              <div className="flex justify-between">
                <span className="font-medium">{l.subject.name}</span>
                <span className="text-sm text-neutral-500">
                  {formatTime(l.start)}–{formatTime(l.end)}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                {l.type} · {l.teacher.user.fullName} · {l.room.building.name}, ауд. {l.room.number}
              </p>
              {l.isCancelled && <p className="text-xs text-red-500 mt-1">Отменено</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
