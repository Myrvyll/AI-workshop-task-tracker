"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Задачі" },
  { href: "/tags", label: "Теги" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="z-20 min-h-0 shrink-0 border-b border-zinc-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-none md:flex md:h-full md:w-56 md:flex-col md:overflow-y-auto md:overscroll-y-contain md:border-b-0 md:border-r md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)] md:dark:shadow-[4px_0_32px_-16px_rgba(0,0,0,0.45)]">
      <div className="flex flex-col gap-4 px-3 py-4 md:min-h-0 md:px-4 md:py-6">
        <div className="hidden md:block">
          <p className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Task tracker
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
            Особисті задачі
          </p>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto pb-0.5 md:flex-col md:overflow-visible" aria-label="Головна навігація">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname === ""
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "shrink-0 rounded-lg border border-sky-200/90 bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-950 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/35 dark:text-sky-100 dark:shadow-none"
                    : "shrink-0 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100"
                }
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
