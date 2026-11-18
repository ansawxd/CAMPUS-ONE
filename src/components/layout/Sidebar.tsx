"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appName, university } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n-context";

export function Sidebar({ fullName, role }: { fullName: string; role: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: t.navHome },
    { href: "/schedule", label: t.navSchedule },
    { href: "/subjects", label: t.navSubjects },
    { href: "/requests", label: t.navRequests },
    { href: "/news", label: t.navNews },
    { href: "/notes", label: t.navNotes },
    { href: "/directory", label: t.navDirectory },
    { href: "/campus-map", label: t.navMap },
    { href: "/profile", label: t.navProfile },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r bg-neutral-50 p-4 dark:bg-neutral-900 flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="font-semibold">{appName}</h2>
          <p className="text-xs text-neutral-500">{university.shortName}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-2 py-1.5 ${active ? "bg-neutral-900 text-white" : "hover:bg-neutral-200 dark:hover:bg-neutral-800"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 text-sm">
        <p className="font-medium">{fullName}</p>
        <p className="text-xs text-neutral-500">{role}</p>
        <button onClick={logout} className="mt-2 text-xs underline text-neutral-500">
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
