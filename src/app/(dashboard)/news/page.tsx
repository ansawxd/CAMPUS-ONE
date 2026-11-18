import { getCurrentUser } from "@/lib/auth";

export default async function NewsPage() {
  const user = await getCurrentUser();
  if (!user) return <p>Необходимо войти</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Новости</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Официальные объявления публикует только уполномоченный сотрудник.
        Демонстрационные примеры о матпомощи, стипендии и общежитии маркируются.
      </p>
      {/* Список подгружается с /api/news */}
    </div>
  );
}
