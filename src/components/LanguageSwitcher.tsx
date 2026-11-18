"use client";

import { useI18n } from "@/lib/i18n-context";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-1 text-sm">
      <button
        onClick={() => setLang("ru")}
        className={`px-2 py-1 rounded ${lang === "ru" ? "bg-neutral-900 text-white" : "border"}`}
      >
        RU
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded ${lang === "en" ? "bg-neutral-900 text-white" : "border"}`}
      >
        EN
      </button>
    </div>
  );
}
