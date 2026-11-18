"use client";

import { useEffect, useState } from "react";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<{ students: any[]; teachers: any[] }>({ students: [], teachers: [] });

  useEffect(() => {
    // Небольшая задержка, чтобы не слать запрос на каждую букву
    const timer = setTimeout(() => {
      fetch(`/api/directory?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { students: [], teachers: [] }))
        .then(setData)
        .catch(() => setData({ students: [], teachers: [] }));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Каталог</h1>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Поиск по ФИО"
        className="border rounded px-3 py-2 max-w-md"
      />
      <section>
        <h2 className="font-medium">Студенты</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data.students.map(s => (
            <li key={s.id}>{s.fullName} · {s.course} курс · {s.group}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium">Преподаватели</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data.teachers.map(t => (
            <li key={t.id}>{t.fullName} · {t.position} · {t.department}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
