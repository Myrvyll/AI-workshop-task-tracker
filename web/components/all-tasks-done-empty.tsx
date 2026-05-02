import Link from "next/link";
import {
  taskListHref,
  type TaskSortBy,
  type TaskSortOrder,
} from "@/lib/task-list-query";

export function AllTasksDoneEmpty({
  sortBy,
  sortOrder,
}: {
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
}) {
  const doneHref = taskListHref({ status: "done", sortBy, sortOrder });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/95 via-white to-teal-50/80 px-6 py-14 text-center shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/[0.07] dark:border-emerald-900/50 dark:from-emerald-950/35 dark:via-zinc-900 dark:to-teal-950/25 dark:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.12)] dark:ring-emerald-400/10">
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-500/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-8 size-2 rounded-full bg-emerald-400/40 dark:bg-emerald-400/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[18%] top-16 size-1.5 rounded-full bg-teal-400/50 dark:bg-teal-400/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[14%] top-24 size-1 rounded-full bg-emerald-500/35"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-6">
        <div
          className="flex size-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 dark:shadow-emerald-950/50"
          aria-hidden
        >
          <svg
            className="size-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Усе зроблено <span aria-hidden>🎉</span>
          </p>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Активних задач немає — можна перевітрити виконані або додати нову
            внизу.
          </p>
        </div>

        <Link
          href={doneHref}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white/80 px-5 py-2.5 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm transition hover:border-emerald-300 hover:bg-white hover:text-emerald-900 dark:border-emerald-800 dark:bg-zinc-900/80 dark:text-emerald-200 dark:hover:border-emerald-600 dark:hover:bg-zinc-800/90 dark:hover:text-emerald-100"
        >
          Переглянути виконані
          <svg
            className="size-4 opacity-70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
