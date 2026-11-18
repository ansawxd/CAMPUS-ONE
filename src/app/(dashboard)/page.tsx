import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDay, formatTime, moscowDayStart } from "@/lib/time";
import { requestStatusLabel } from "@/lib/labels";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const student = user.student;

  // Пары на сегодня, посещаемость и последние заявки — только у студента
  let todayLessons: Awaited<ReturnType<typeof loadToday>> = [];
  let attended = 0;
  let total = 0;
  let lastRequests: { id: string; type: string; status: string }[] = [];

  if (student) {
    todayLessons = await loadToday(student.groupId, now);
    total = await prisma.attendance.count({ where: { studentId: student.id } });
    attended = await prisma.attendance.count({ where: { studentId: student.id, present: true } });
    lastRequests = await prisma.request.findMany({
      where: { studentId: student.id },
      select: { id: true, type: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  }

  const active = todayLessons.filter((l) => !l.isCancelled);
  const currentLesson = active.find((l) => l.start <= now && now < l.end);
  const nextLesson = active.find((l) => l.start > now);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Привет, {user.fullName}</h1>
        <p className="text-sm text-neutral-500 mt-1">{formatDay(now)}</p>
      </div>

      {student ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-sm text-neutral-500">Посещаемость</h2>
            <p className="text-2xl mt-1">
              {attended} / {total}
              {total > 0 && <span className="text-base text-neutral-500"> · {Math.round((attended / total) * 100)}%</span>}
            </p>
            <p className="text-xs text-neutral-400">посещено / проведено</p>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-sm text-neutral-500">Текущая пара</h2>
            {currentLesson ? (
              <>
                <p className="text-lg mt-1">{currentLesson.subject.name}</p>
                <p className="text-sm text-neutral-500">
                  {formatTime(currentLesson.start)}–{formatTime(currentLesson.end)} · ауд. {currentLesson.room.number}
                </p>
              </>
            ) : (
              <p className="text-lg mt-1 text-neutral-400">Сейчас пары нет</p>
            )}
            {nextLesson && (
              <p className="text-sm text-neutral-500 mt-2">
                Следующая: {nextLesson.subject.name} в {formatTime(nextLesson.start)}
              </p>
            )}
          </div>
        </section>
      ) : (
        <p className="text-neutral-500">
          Вы вошли как сотрудник. Заявки студентов — в разделе{" "}
          <Link href="/requests" className="underline">Справки</Link>.
        </p>
      )}

      {student && (
        <section>
          <h2 className="font-medium mb-2">Сегодня</h2>
          {todayLessons.length === 0 ? (
            <p className="text-sm text-neutral-500">Сегодня занятий нет</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {todayLessons.map((l) => (
                <li key={l.id} className={l.isCancelled ? "line-through text-neutral-400" : ""}>
                  {formatTime(l.start)} · {l.subject.name} · ауд. {l.room.number}
                  {l.isCancelled && " (отменена)"}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {lastRequests.length > 0 && (
        <section>
          <h2 className="font-medium mb-2">Мои заявки</h2>
          <ul className="space-y-1 text-sm">
            {lastRequests.map((r) => (
              <li key={r.id}>
                {r.type} — <span className="text-neutral-500">{requestStatusLabel[r.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {notifications.length > 0 && (
        <section>
          <h2 className="font-medium mb-2">Уведомления</h2>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="border rounded p-3 text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="text-neutral-600 dark:text-neutral-400">{n.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function loadToday(groupId: string, now: Date) {
  return prisma.lesson.findMany({
    where: { groupId, start: { gte: moscowDayStart(now), lt: moscowDayStart(now, 1) } },
    include: { subject: true, room: true },
    orderBy: { start: "asc" },
  });
}
