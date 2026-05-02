import { AllTasksDoneEmpty } from "@/components/all-tasks-done-empty";
import { AddTaskForm } from "@/components/add-task-form";
import { TaskSortControls } from "@/components/task-sort-controls";
import { TaskStatusFilter } from "@/components/task-status-filter";
import { TaskCard } from "@/components/task-card";
import { getAssignableTags } from "@/lib/assignable-tags";
import { getPrisma } from "@/lib/prisma";
import { TASK_WITH_TAGS_INCLUDE } from "@/lib/task-include";
import {
  parseTaskSortBy,
  parseTaskSortOrder,
  parseTaskStatusFilter,
} from "@/lib/task-list-query";
import type { ReactNode } from "react";
import { describeDbFailure } from "@/lib/db-error-hint";
import { sortTasksByPriority } from "@/lib/sort-tasks";
import type { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{
    status?: string | string[];
    sort?: string | string[];
    order?: string | string[];
  }>;
};

function taskOrderBy(
  sortBy: ReturnType<typeof parseTaskSortBy>,
  sortOrder: ReturnType<typeof parseTaskSortOrder>,
): Prisma.TaskOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput[] {
  if (sortBy === "deadline") {
    return [
      { deadline: { sort: sortOrder, nulls: "last" } },
      { createdAt: "desc" },
    ];
  }
  if (sortBy === "created") {
    return { createdAt: sortOrder };
  }
  return { createdAt: "desc" };
}

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const statusFilter = parseTaskStatusFilter(sp);
  const sortBy = parseTaskSortBy(sp);
  const sortOrder = parseTaskSortOrder(sp);
  const where =
    statusFilter === "active"
      ? { done: false }
      : statusFilter === "done"
        ? { done: true }
        : {};

  let tasks;
  let totalCount: number;
  let assignableTags: Awaited<ReturnType<typeof getAssignableTags>>;
  try {
    const orderBy =
      sortBy === "priority"
        ? ({ createdAt: "desc" } satisfies Prisma.TaskOrderByWithRelationInput)
        : taskOrderBy(sortBy, sortOrder);

    [tasks, totalCount, assignableTags] = await Promise.all([
      getPrisma().task.findMany({
        where,
        orderBy,
        include: TASK_WITH_TAGS_INCLUDE,
      }),
      getPrisma().task.count(),
      getAssignableTags(),
    ]);
  } catch (err) {
    const { kind, technicalMessage } = describeDbFailure(err);
    const showTech =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "preview";

    const blocks: Record<
      | "missing_url"
      | "schema_outdated"
      | "stale_client"
      | "auth"
      | "connection"
      | "unknown",
      ReactNode
    > = {
      missing_url: (
        <>
          У каталозі <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">web/</code> немає або
          порожній{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">DATABASE_URL</code>. Скопіюй{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.example</code> у{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> і встав рядок
          підключення з Neon (або іншого Postgres).
        </>
      ),
      schema_outdated: (
        <>
          Схема бази не збігається з кодом (часто після <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">git pull</code>
          ). У каталозі <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">web/</code> виконай:{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npx prisma migrate deploy</code>
        </>
      ),
      stale_client: (
        <>
          Застарілий клієнт Prisma у пам’яті процесу (часто після оновлення коду без перезапуску{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npm run dev</code>). Зупини dev-сервер
          і запусти знову з каталогу <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">web/</code>; у
          крайньому разі виконай <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npx prisma generate</code>.
        </>
      ),
      auth: (
        <>
          База відхилила логін (невірний пароль або користувач у{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">DATABASE_URL</code>). Перевір рядок
          підключення в Neon → Connection string.
        </>
      ),
      connection: (
        <>
          Не вдається дістатися до сервера Postgres. Перевір{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">DATABASE_URL</code> у{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>, чи не призупинений
          проєкт у Neon, і що <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npm run dev</code>{" "}
          запущено з каталогу <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">web/</code>.
        </>
      ),
      unknown: (
        <>
          Під час запиту до бази сталася помилка. Перевір{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">DATABASE_URL</code> у{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> і виконай у{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">web/</code>:{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npx prisma migrate deploy</code>.
        </>
      ),
    };

    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Task tracker</h1>
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium text-amber-950 dark:text-amber-50">Помилка бази даних</p>
          <p>{blocks[kind]}</p>
          {showTech ? (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-amber-100/80 p-2 text-xs text-amber-950 dark:bg-amber-900/50 dark:text-amber-100">
              {technicalMessage}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }

  if (sortBy === "priority") {
    tasks = sortTasksByPriority(tasks, sortOrder);
  }

  return (
    <>
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-10 px-4 py-10 pb-60">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Task tracker
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Одне поле — пиши як думаєш; AI визначає назву, дедлайн, пріоритет і сферу життя (робота / життя /
            хобі / навчання) з того ж тексту. Змінити теги можна в «Редагувати» на картці. Підтеги згодом можна
            дробити ієрархічно (наприклад, під «Робота» — 1-1, ідеї).
          </p>
        </header>

        <section className="space-y-3">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Задачі
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <TaskStatusFilter
                current={statusFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
              <TaskSortControls
                status={statusFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </div>
          </div>
          {totalCount === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Поки порожньо. Додай першу задачу нижче.
            </p>
          ) : tasks.length === 0 ? (
            statusFilter === "active" ? (
              <AllTasksDoneEmpty sortBy={sortBy} sortOrder={sortOrder} />
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {statusFilter === "done"
                  ? "Ще немає виконаних задач."
                  : "Немає задач для цього фільтра."}
              </p>
            )
          ) : (
            <ul className="flex flex-col gap-3">
              {tasks.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} assignableTags={assignableTags} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <AddTaskForm />
        </div>
      </div>
    </>
  );
}
