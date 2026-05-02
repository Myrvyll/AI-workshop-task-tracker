"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import {
  type TaskSortBy,
  type TaskSortOrder,
  taskListHref,
  type TaskStatusFilterValue,
} from "@/lib/task-list-query";

const SORT_BY_OPTIONS: { value: TaskSortBy; label: string }[] = [
  { value: "created", label: "Дата додавання" },
  { value: "deadline", label: "Дедлайн" },
  { value: "priority", label: "Пріоритет" },
];

const SORT_ORDER_OPTIONS: { value: TaskSortOrder; label: string }[] = [
  { value: "asc", label: "Зростання" },
  { value: "desc", label: "Спадання" },
];

export function TaskSortControls({
  status,
  sortBy,
  sortOrder,
}: {
  status: TaskStatusFilterValue;
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pushList = useCallback(
    (next: { sortBy: TaskSortBy; sortOrder: TaskSortOrder }) => {
      const href = taskListHref({ status, ...next });
      startTransition(() => {
        router.push(href);
      });
    },
    [router, status],
  );

  const onSortByChange = (value: TaskSortBy) => {
    pushList({ sortBy: value, sortOrder });
  };

  const onSortOrderChange = (value: TaskSortOrder) => {
    pushList({ sortBy, sortOrder: value });
  };

  const sortByTitle =
    sortBy === "deadline"
      ? "Зростання: раніші дедлайни першими. Спадання: пізніші першими (без дедлайну в кінці)."
      : sortBy === "priority"
        ? "Зростання: низький → середній → високий. Спадання: високий → середній → низький."
        : "Зростання: старіші задачі першими. Спадання: новіші першими.";

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-zinc-200/90 bg-white/70 p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end dark:border-zinc-700 dark:bg-zinc-900/50 ${pending ? "opacity-70" : ""}`}
      role="group"
      aria-label="Сортування списку задач"
    >
      <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Сортувати за
        </span>
        <select
          className="rounded-lg border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          value={sortBy}
          title={sortByTitle}
          onChange={(e) => onSortByChange(e.target.value as TaskSortBy)}
        >
          {SORT_BY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[10rem]">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Порядок
        </span>
        <select
          className="rounded-lg border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          value={sortOrder}
          title={sortByTitle}
          onChange={(e) => onSortOrderChange(e.target.value as TaskSortOrder)}
        >
          {SORT_ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
