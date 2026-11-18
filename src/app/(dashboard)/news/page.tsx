import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/time";
import { newsCategoryLabel } from "@/lib/labels";

export default async function NewsPage() {
  // Доступ проверяет layout кабинета; здесь только опубликованные посты
  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    include: { author: { select: { fullName: true } }, _count: { select: { likes: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Новости</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Официальные объявления публикует только уполномоченный сотрудник. Демо-новости вымышлены.
        </p>
      </div>
      {posts.length === 0 && <p className="text-neutral-500">Новостей пока нет</p>}
      {posts.map((p) => (
        <article key={p.id} className="border rounded-lg p-4">
          <div className="flex gap-2 text-xs">
            <span className="border rounded px-1.5">{newsCategoryLabel[p.category]}</span>
            {p.isOfficial && <span className="rounded px-1.5 bg-blue-600 text-white">Официально</span>}
          </div>
          <h2 className="font-medium text-lg mt-2">{p.title}</h2>
          {/* Текст выводится как обычный текст — React экранирует HTML, XSS не пройдёт */}
          <p className="text-sm mt-1 whitespace-pre-line">{p.body}</p>
          <p className="text-xs text-neutral-500 mt-2">
            {p.author.fullName} · {formatDate(p.createdAt)} · ♥ {p._count.likes}
          </p>
        </article>
      ))}
    </div>
  );
}
