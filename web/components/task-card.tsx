import { deleteTask, toggleTaskDone } from "@/app/actions";
import type { Tag } from "@/app/generated/prisma/client";
import { TaskEditBlock } from "@/components/task-edit-block";
import type { TaskWithTags } from "@/lib/task-include";

function priorityEmoji(priority: string) {
  if (priority === "high") return "🔴";
  if (priority === "low") return "🟢";
  return "🟡";
}

function deadlineStableKey(d: TaskWithTags["deadline"]): string {
  if (d == null) return "";
  if (d instanceof Date) return d.toISOString();
  return new Date(d).toISOString();
}

function taskTagsStableKey(task: TaskWithTags): string {
  return task.taskTags.map((t) => t.tagId).sort().join(",");
}

export function TaskCard({
  task,
  assignableTags,
}: {
  task: TaskWithTags;
  assignableTags: Pick<Tag, "id" | "name" | "slug">[];
}) {
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
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
          <span className="shrink-0 text-lg leading-7" title={task.priority}>
            {priorityEmoji(task.priority)}
          </span>
          <TaskEditBlock
            key={`${task.id}-${task.title}-${deadlineStableKey(task.deadline)}-${taskTagsStableKey(task)}`}
            task={task}
            done={done}
            assignableTags={assignableTags}
          />
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
