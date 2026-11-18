"use client";

import { useEffect, useState } from "react";

type Note = { id: string; body: string; pinned: boolean; createdAt: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/notes");
    const data = await res.json().catch(() => []);
    setNotes(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить");
      return;
    }
    setText("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Заметки</h1>
      <p className="text-sm text-neutral-500">Только ваши заметки. Доступ проверяется на сервере.</p>
      <form onSubmit={create} className="flex gap-2 max-w-md">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Новая заметка"
          maxLength={2000}
          className="flex-1 border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-2">Добавить</button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="border rounded p-3 flex justify-between gap-4">
            <span>
              {n.pinned && <span className="text-xs text-amber-600">Закреплено · </span>}
              {n.body}
            </span>
            <button onClick={() => remove(n.id)} className="text-xs text-neutral-500 underline">
              Удалить
            </button>
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-neutral-500">Нет заметок</p>}
      </ul>
    </div>
  );
}
