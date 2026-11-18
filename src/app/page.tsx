import { appName, university } from "@/lib/constants";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6">
      <p className="text-sm text-neutral-500">Концепт цифрового деканата будущего. Демонстрационный проект.</p>
      <h1 className="text-4xl font-semibold tracking-tight">{appName}</h1>
      <p className="text-lg text-neutral-700">
        {university.name} ({university.shortName}). Каркас + схема Prisma (PROMPT 2) готовы. Дальнейшие модули (auth, главная, расписание, заявки) — следующие шаги.
      </p>
    </main>
  );
}
