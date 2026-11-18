import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <p>Необходимо войти</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <p className="mt-2">ФИО: {user.fullName}</p>
      <p>Роль: {user.role}</p>
      {/* TODO: учебные поля, смена логина/пароля с проверкой уникальности LOWER */}
    </div>
  );
}
