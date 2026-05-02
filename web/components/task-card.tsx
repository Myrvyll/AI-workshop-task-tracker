import { toggleTaskDone } from "@/app/actions";
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
        <form action={toggleTaskDone}>
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {done ? "Повернути" : "Готово"}
          </button>
        </form>
      </div>
    </article>
  );
}
