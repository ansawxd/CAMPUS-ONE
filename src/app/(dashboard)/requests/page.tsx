"use client";

import { useEffect, useState } from "react";

type RequestItem = {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  student?: { user: { fullName: string } };
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Простая проверка роли через отдельный эндпоинт или из сессии — здесь заглушка
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((u) => setRole(u?.role ?? null))
      .catch(() => {});
  }, []);

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment: "Обновлено" }),
    });
    // Перезагрузить список
    const res = await fetch("/api/requests");
    setRequests(await res.json());
  }

  if (loading) return <p>Загрузка…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Заявки на справки</h1>

      {role === "STUDENT" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const data = new FormData(form);
            await fetch("/api/requests", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: data.get("type"),
                description: data.get("description"),
              }),
            });
            form.reset();
            const res = await fetch("/api/requests");
            setRequests(await res.json());
          }}
          className="flex flex-col gap-3 max-w-md"
        >
          <input name="type" placeholder="Тип справки" className="border rounded px-3 py-2" required />
          <textarea name="description" placeholder="Описание" className="border rounded px-3 py-2" required />
          <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-2">
            Отправить заявку
          </button>
        </form>
      )}

      <section className="space-y-3">
        <h2 className="font-medium">Список заявок</h2>
        {requests.length === 0 && <p className="text-sm text-neutral-500">Нет заявок</p>}
        {requests.map((r) => (
          <div key={r.id} className="border rounded p-3">
            <p className="font-medium">{r.type}</p>
            <p className="text-sm">{r.description}</p>
            <p className="text-xs text-neutral-500">
              Статус: {r.status} {r.student && `· ${r.student.user.fullName}`}
            </p>
            {(role === "DEANERY_STAFF" || role === "ADMIN") && (
              <div className="mt-2 flex gap-2">
                {["IN_PROGRESS", "READY", "REJECTED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(r.id, s)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
