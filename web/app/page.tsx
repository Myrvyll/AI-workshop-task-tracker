import { AddTaskForm } from "@/components/add-task-form";
import { TaskCard } from "@/components/task-card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let tasks;
  try {
    tasks = await getPrisma().task.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Task tracker
        </h1>
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Не вдалося підключитися до бази. Перевірте{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            DATABASE_URL
          </code>{" "}
          у <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> і виконайте{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            npx prisma migrate deploy
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-10 px-4 py-10 pb-20">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Task tracker
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Одне поле — пиши як думаєш; AI структурує назву, дедлайн і пріоритет.
        </p>
      </header>

      <AddTaskForm />

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Задачі
        </h2>
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Поки порожньо. Додай першу задачу вище.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
