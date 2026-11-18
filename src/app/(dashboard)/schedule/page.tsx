import { getCurrentUser } from "@/lib/auth";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) return <p>Необходимо войти</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Расписание</h1>
      <p className="mt-2 text-neutral-600">День / неделя. Переносы и отмены отображаются здесь.</p>
      {/* TODO: список занятий, проверка конфликтов на сервере при создании */}
    </div>
  );
}
