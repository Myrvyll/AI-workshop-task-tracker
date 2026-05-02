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
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фільтр за статусом">
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
