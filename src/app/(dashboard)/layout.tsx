import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { roleLabel } from "@/lib/labels";

// Общая проверка входа для всего кабинета: нет живой сессии — на страницу входа
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar fullName={user.fullName} role={roleLabel[user.role]} />
      <main className="flex-1 p-6 max-w-4xl">{children}</main>
    </div>
  );
}
