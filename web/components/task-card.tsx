import { deleteTask, toggleTaskDone } from "@/app/actions";
import type { Task } from "@/app/generated/prisma/client";

function priorityEmoji(priority: string) {
  if (priority === "high") return "🔴";
  if (priority === "low") return "🟢";
  return "🟡";
}

function formatDeadline(d: Date | null) {
  if (!d) return "без дедлайну";
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function TaskCard({ task }: { task: Task }) {
  const done = task.done;

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition ${
        done
          ? "border-zinc-100 bg-zinc-50/80 opacity-80 dark:border-zinc-800 dark:bg-zinc-900/40"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg" title={task.priority}>
              {priorityEmoji(task.priority)}
            </span>
            <h2
              className={`text-base font-semibold text-zinc-900 dark:text-zinc-50 ${
                done ? "line-through decoration-zinc-400" : ""
              }`}
            >
              {task.title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatDeadline(task.deadline)}
          </p>
          {task.rawInput !== task.title ? (
            <p className="mt-2 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-500">
              Оригінал: {task.rawInput}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <form action={toggleTaskDone}>
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {done ? "Повернути" : "Готово"}
            </button>
          </form>
          <form action={deleteTask}>
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              title="Видалити"
              aria-label="Видалити"
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <svg
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
