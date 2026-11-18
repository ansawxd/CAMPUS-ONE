import Link from "next/link";
import { appName, university } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-neutral-50 p-4 dark:bg-neutral-900">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="font-semibold">{appName}</h2>
          <p className="text-xs text-neutral-500">{university.shortName}</p>
        </div>
        <LanguageSwitcher />
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        <Link href="/">Главная</Link>
        <Link href="/schedule">Расписание</Link>
        <Link href="/subjects">Дисциплины</Link>
        <Link href="/requests">Справки</Link>
        <Link href="/news">Новости</Link>
        <Link href="/notes">Заметки</Link>
        <Link href="/directory">Каталог</Link>
        <Link href="/campus-map">Карта</Link>
        <Link href="/profile">Профиль</Link>
      </nav>
    </aside>
  );
}