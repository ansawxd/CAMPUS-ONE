"use client";

import { useEffect, useState } from "react";

type Note = { id: string; body: string; pinned: boolean; createdAt: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  const load = () => fetch("/api/notes").then(r => r.json()).then(setNotes);

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    setText("");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Заметки</h1>
      <p className="text-sm text-neutral-500">Только ваши заметки. Доступ проверяется на сервере.</p>
      <form onSubmit={create} className="flex gap-2 max-w-md">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Новая заметка"
          className="flex-1 border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-2">Добавить</button>
      </form>
      <ul className="space-y-2">
        {notes.map(n => (
          <li key={n.id} className="border rounded p-3">
            {n.pinned && <span className="text-xs text-amber-600">Закреплено · </span>}
            {n.body}
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-neutral-500">Нет заметок</p>}
      </ul>
    </div>
  );
}
