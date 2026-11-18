import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/labels";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const group = user.student
    ? await prisma.studyGroup.findUnique({ where: { id: user.student.groupId }, include: { faculty: true } })
    : null;
  const department = user.teacher
    ? await prisma.department.findUnique({ where: { id: user.teacher.departmentId } })
    : null;

  const rows: [string, string | null | undefined][] = [
    ["ФИО", user.fullName],
    ["Логин", user.login],
    ["Роль", roleLabel[user.role]],
  ];
  if (user.student) {
    rows.push(
      ["Факультет", group?.faculty.name],
      ["Группа", group?.name],
      ["Курс", String(user.student.course)],
      ["Направление", user.student.direction],
      ["Email", user.student.email],
      ["Телефон", user.student.phone]
    );
  }
  if (user.teacher) {
    rows.push(["Кафедра", department?.name], ["Должность", user.teacher.position]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm max-w-xl">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-neutral-500">{label}</dt>
            <dd>{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-neutral-500">
        Смена пароля в демо выполняется через деканат.
      </p>
    </div>
  );
}
