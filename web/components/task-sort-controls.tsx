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
  { value: "created", label: "Сорт: створено" },
  { value: "deadline", label: "Сорт: дедлайн" },
  { value: "priority", label: "Сорт: пріоритет" },
];

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

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

  const orderBtnBase =
    "inline-flex h-full min-h-0 min-w-[2.25rem] items-center justify-center rounded-md px-2 outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-zinc-500";
  const orderBtnOn =
    `${orderBtnBase} bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50`;
  const orderBtnOff =
    `${orderBtnBase} text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100`;

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-3 self-stretch rounded-xl border border-zinc-200/90 bg-white/70 p-1 shadow-sm sm:min-w-[min(100%,18rem)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-2 dark:border-zinc-700 dark:bg-zinc-900/50 ${pending ? "opacity-70" : ""}`}
      role="group"
      aria-label="Сортування списку задач"
    >
      <label className="min-w-0 flex-1 sm:min-w-[12rem]">
        <span className="sr-only">Сортувати за</span>
        <select
          className="h-10 w-full rounded-lg border border-zinc-200/90 bg-white pl-3 pr-12 text-sm font-medium text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
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
      <div
        className="inline-flex h-10 w-fit shrink-0 items-center rounded-lg border border-zinc-200/90 bg-zinc-100/80 p-0.5 shadow-inner dark:border-zinc-700 dark:bg-zinc-900/60"
        role="radiogroup"
        aria-label="Порядок: зростання або спадання"
      >
        <button
          type="button"
          role="radio"
          aria-checked={sortOrder === "asc"}
          title="Зростання"
          aria-label="Зростання"
          disabled={pending}
          onClick={() => onSortOrderChange("asc")}
          className={sortOrder === "asc" ? orderBtnOn : orderBtnOff}
        >
          <ChevronUpIcon />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={sortOrder === "desc"}
          title="Спадання"
          aria-label="Спадання"
          disabled={pending}
          onClick={() => onSortOrderChange("desc")}
          className={sortOrder === "desc" ? orderBtnOn : orderBtnOff}
        >
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
}
