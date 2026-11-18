"use client";

import { useEffect, useState } from "react";
import { requestStatusLabel } from "@/lib/labels";

type RequestItem = {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  student: { user: { fullName: string } };
  history: { id: string; status: string; comment: string | null; createdAt: string }[];
};

const requestTypes = [
  "Справка об обучении",
  "Справка для стипендии",
  "Справка в военкомат",
  "Академическая справка",
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/requests");
    const data = await res.json().catch(() => []);
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setRole(u?.role ?? null))
      .catch(() => {});
  }, []);

  async function changeStatus(id: string, status: string) {
    setError("");
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setError("Не удалось изменить статус");
    load();
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: data.get("type"), description: data.get("description") }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Не удалось отправить заявку");
      return;
    }
    form.reset();
    load();
  }

  const isStaff = role === "DEANERY_STAFF" || role === "ADMIN";

  if (loading) return <p>Загрузка…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Заявки на справки</h1>

      {role === "STUDENT" && (
        <form onSubmit={create} className="flex flex-col gap-3 max-w-md">
          <select name="type" className="border rounded px-3 py-2" required>
            {requestTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Для чего нужна справка"
            maxLength={1000}
            className="border rounded px-3 py-2"
            required
          />
          <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-2">
            Отправить заявку
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="space-y-3">
        <h2 className="font-medium">{isStaff ? "Все заявки студентов" : "Мои заявки"}</h2>
        {requests.length === 0 && <p className="text-sm text-neutral-500">Нет заявок</p>}
        {requests.map((r) => (
          <div key={r.id} className="border rounded p-3">
            <div className="flex justify-between gap-4">
              <p className="font-medium">{r.type}</p>
              <span className="text-xs border rounded px-1.5 py-0.5 h-fit">{requestStatusLabel[r.status]}</span>
            </div>
            <p className="text-sm">{r.description}</p>
            {isStaff && <p className="text-xs text-neutral-500 mt-1">Студент: {r.student.user.fullName}</p>}
            {r.history.length > 0 && (
              <ul className="text-xs text-neutral-500 mt-2 space-y-0.5">
                {r.history.map((h) => (
                  <li key={h.id}>
                    {new Date(h.createdAt).toLocaleString("ru-RU")} — {requestStatusLabel[h.status]}
                    {h.comment && `: ${h.comment}`}
                  </li>
                ))}
              </ul>
            )}
            {isStaff && (
              <div className="mt-2 flex gap-2">
                {["IN_PROGRESS", "READY", "REJECTED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(r.id, s)}
                    disabled={r.status === s}
                    className="text-xs border rounded px-2 py-1 disabled:opacity-40"
                  >
                    {requestStatusLabel[s]}
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
