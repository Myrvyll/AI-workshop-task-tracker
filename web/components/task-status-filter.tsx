import Link from "next/link";

export type TaskStatusFilterValue = "all" | "active" | "done";

const OPTIONS: {
  value: TaskStatusFilterValue;
  label: string;
  href: string;
}[] = [
  { value: "all", label: "Усі", href: "/" },
  { value: "active", label: "Активні", href: "/?status=active" },
  { value: "done", label: "Виконані", href: "/?status=done" },
];

export function parseTaskStatusFilter(sp: {
  status?: string | string[];
}): TaskStatusFilterValue {
  const raw = sp.status;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "active" || v === "done") return v;
  return "all";
}

export function TaskStatusFilter({ current }: { current: TaskStatusFilterValue }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фільтр за статусом">
      {OPTIONS.map(({ value, label, href }) => {
        const selected = current === value;
        return (
          <Link
            key={value}
            href={href}
            scroll={false}
            prefetch
            role="tab"
            aria-selected={selected}
            className={
              selected
                ? "rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
