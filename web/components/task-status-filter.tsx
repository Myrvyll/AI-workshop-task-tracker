import Link from "next/link";
import {
  type TaskSortBy,
  type TaskSortOrder,
  type TaskStatusFilterValue,
  taskListHref,
} from "@/lib/task-list-query";

export type { TaskStatusFilterValue } from "@/lib/task-list-query";

const OPTIONS: {
  value: TaskStatusFilterValue;
  label: string;
}[] = [
  { value: "all", label: "Усі" },
  { value: "active", label: "Активні" },
  { value: "done", label: "Виконані" },
];

export { parseTaskStatusFilter } from "@/lib/task-list-query";

export function TaskStatusFilter({
  current,
  sortBy,
  sortOrder,
}: {
  current: TaskStatusFilterValue;
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
}) {
  return (
    <div
      className="inline-flex w-fit max-w-full flex-wrap rounded-xl border border-zinc-200/90 bg-zinc-100/80 p-1 shadow-inner dark:border-zinc-700 dark:bg-zinc-900/60"
      role="tablist"
      aria-label="Фільтр за статусом"
    >
      {OPTIONS.map(({ value, label }) => {
        const selected = current === value;
        const href = taskListHref({ status: value, sortBy, sortOrder });
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
                ? "rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
