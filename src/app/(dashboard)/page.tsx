import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appTimeZone } from "@/lib/constants";

// Логика текущей пары: start <= now < end
function getCurrentAndNext(lessons: { start: Date; end: Date; subject: { name: string } }[], now: Date) {
  const current = lessons.find((l) => l.start <= now && now < l.end);
  const upcoming = lessons.filter((l) => l.start > now).sort((a, b) => a.start.getTime() - b.start.getTime());
  const next = current ? upcoming[0] : upcoming[0];
  return { current, next };
}

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) return <p>Необходимо войти</p>;

  // Пример: получить занятия группы студента на сегодня
  // В реальном коде — через student.group.lessons
  const now = new Date();
  // TODO: запрос реальных lessons из БД
  const lessons: any[] = [];
  const { current, next } = getCurrentAndNext(lessons, now);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Привет, {user.fullName}</h1>
      <p className="text-sm text-neutral-500">Часовой пояс: {appTimeZone}</p>
      <section>
        <h2 className="font-medium">Посещаемость</h2>
        <p>60 / 80</p>
      </section>
      <section>
        <h2 className="font-medium">Текущая пара</h2>
        <p>{current ? current.subject.name : "Нет текущей пары"}</p>
        {next && <p className="text-sm text-neutral-500">Следующая: {next.subject.name}</p>}
      </section>
    </div>
  );
}
