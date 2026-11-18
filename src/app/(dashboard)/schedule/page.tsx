import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDay, formatTime, moscowDayStart } from "@/lib/time";
import { lessonTypeLabel } from "@/lib/labels";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const from = moscowDayStart(now);
  const to = moscowDayStart(now, 7);

  // Студент видит расписание своей группы, преподаватель — свои пары
  let where = {};
  if (user.student) where = { groupId: user.student.groupId };
  else if (user.teacher) where = { teacherId: user.teacher.id };
  else {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Расписание</h1>
        <p className="text-neutral-500">Расписание доступно студентам и преподавателям.</p>
      </div>
    );
  }

  const lessons = await prisma.lesson.findMany({
    where: { ...where, start: { gte: from, lt: to } },
    include: {
      subject: true,
      group: true,
      room: { include: { building: true } },
      teacher: { include: { user: { select: { fullName: true } } } },
    },
    orderBy: { start: "asc" },
  });

  // Группируем по дням
  const days: { title: string; items: typeof lessons }[] = [];
  for (const l of lessons) {
    const title = formatDay(l.start);
    const last = days[days.length - 1];
    if (last && last.title === title) last.items.push(l);
    else days.push({ title, items: [l] });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Расписание на неделю</h1>

      {days.length === 0 && <p className="text-neutral-500">На ближайшую неделю занятий нет</p>}

      {days.map((day) => (
        <section key={day.title}>
          <h2 className="font-medium mb-2 capitalize">{day.title}</h2>
          <ul className="space-y-2">
            {day.items.map((l) => {
              const isNow = !l.isCancelled && l.start <= now && now < l.end;
              return (
                <li
                  key={l.id}
                  className={`border rounded-lg p-3 ${l.isCancelled ? "opacity-50" : ""} ${isNow ? "border-green-600" : ""}`}
                >
                  <div className="flex justify-between gap-4">
                    <span className={`font-medium ${l.isCancelled ? "line-through" : ""}`}>{l.subject.name}</span>
                    <span className="text-sm text-neutral-500 whitespace-nowrap">
                      {formatTime(l.start)}–{formatTime(l.end)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {lessonTypeLabel[l.type]} · {user.student ? l.teacher.user.fullName : l.group.name} ·{" "}
                    {l.room.building.name}, ауд. {l.room.number}
                  </p>
                  {l.isCancelled && <p className="text-xs text-red-500 mt-1">Отменено</p>}
                  {isNow && <p className="text-xs text-green-700 mt-1">Идёт сейчас</p>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
