import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appTimeZone } from "@/lib/constants";
import Link from "next/link";

function formatTime(d: Date) {
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: appTimeZone });
}

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p>Необходимо войти</p>
        <Link href="/login" className="underline">Перейти ко входу</Link>
      </div>
    );
  }

  const now = new Date();
  let currentLesson = null;
  let nextLesson = null;

  if (user.student) {
    const lessons = await prisma.lesson.findMany({
      where: {
        groupId: user.student.groupId,
        isCancelled: false,
        start: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      include: { subject: true, room: true, teacher: { include: { user: true } } },
      orderBy: { start: "asc" },
      take: 20,
    });

    currentLesson = lessons.find(l => l.start <= now && now < l.end) ?? null;
    nextLesson = lessons.find(l => l.start > now) ?? null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Привет, {user.fullName}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: appTimeZone })}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium text-sm text-neutral-500">Посещаемость</h2>
          <p className="text-2xl mt-1">— / —</p>
          <p className="text-xs text-neutral-400">посещено / проведено</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium text-sm text-neutral-500">Текущая пара</h2>
          {currentLesson ? (
            <>
              <p className="text-lg mt-1">{currentLesson.subject.name}</p>
              <p className="text-sm text-neutral-500">
                {formatTime(currentLesson.start)}–{formatTime(currentLesson.end)} · {currentLesson.room.number}
              </p>
            </>
          ) : (
            <p className="text-lg mt-1 text-neutral-400">Нет текущей пары</p>
          )}
          {nextLesson && (
            <p className="text-sm text-neutral-400 mt-2">
              Следующая: {nextLesson.subject.name} ({formatTime(nextLesson.start)})
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Быстрые действия</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/schedule" className="border rounded px-3 py-1.5 text-sm">Расписание</Link>
          <Link href="/requests" className="border rounded px-3 py-1.5 text-sm">Справки</Link>
          <Link href="/notes" className="border rounded px-3 py-1.5 text-sm">Заметки</Link>
          <Link href="/profile" className="border rounded px-3 py-1.5 text-sm">Профиль</Link>
        </div>
      </section>
    </div>
  );
}
