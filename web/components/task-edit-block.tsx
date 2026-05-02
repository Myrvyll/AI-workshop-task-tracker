"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateTask } from "@/app/actions";
import { formatDeadline } from "@/lib/format-deadline";
import type { TaskWithTags } from "@/lib/task-include";
import type { TagForTaskPicker } from "@/lib/tag-tree";
import { tagDisplayName } from "@/lib/tag-display";
import { tagPillClass } from "@/lib/tag-styles";

function parseDeadline(d: TaskWithTags["deadline"]): Date | null {
  if (d == null) return null;
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? null : d;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Matches deadlines saved as “date only” (end of local day). */
function isDateOnlyEndOfDay(d: Date): boolean {
  return (
    d.getHours() === 23 &&
    d.getMinutes() === 59 &&
    d.getSeconds() === 59 &&
    d.getMilliseconds() >= 990
  );
}

function toTimeInputValue(d: Date | null): string {
  if (!d) return "";
  if (isDateOnlyEndOfDay(d)) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** If `timeStr` is empty, end of that local calendar day. */
function combineLocalDateTime(dateStr: string, timeStr: string): Date | null {
  const parts = dateStr.split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;

  const t = timeStr.trim();
  if (!t) {
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  const timeParts = t.split(":");
  const hh = parseInt(timeParts[0] ?? "", 10);
  const mm = parseInt(timeParts[1] ?? "0", 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export function TaskEditBlock({
  task,
  done,
  assignableTags,
  editing,
  onEditingChange,
  formId,
  pending,
  setPending,
}: {
  task: TaskWithTags;
  done: boolean;
  assignableTags: TagForTaskPicker[];
  editing: boolean;
  onEditingChange: (next: boolean) => void;
  formId: string;
  pending: boolean;
  setPending: (next: boolean) => void;
}) {
  const router = useRouter();
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const deadlineDate = parseDeadline(task.deadline);

  function startEditing() {
    setClientError(null);
    setServerError(null);
    onEditingChange(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);
    setServerError(null);

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const dateStr = (form.elements.namedItem("deadlineDate") as HTMLInputElement).value.trim();
    const timeStr = (form.elements.namedItem("deadlineTime") as HTMLInputElement).value.trim();

    if (!title) {
      setClientError("Назва не може бути порожньою.");
      return;
    }

    if (timeStr && !dateStr) {
      setClientError("Спочатку обери дату, або прибери час.");
      return;
    }

    let deadlineIso = "";
    if (!dateStr) {
      deadlineIso = "";
    } else {
      const inst = combineLocalDateTime(dateStr, timeStr);
      if (!inst || Number.isNaN(inst.getTime())) {
        setClientError("Некоректна дата або час.");
        return;
      }
      deadlineIso = inst.toISOString();
    }

    const fd = new FormData();
    fd.set("id", task.id);
    fd.set("title", title);
    fd.set("deadlineIso", deadlineIso);
    const inner = new FormData(form);
    for (const id of inner.getAll("tagIds")) {
      const s = id.toString();
      if (s) fd.append("tagIds", s);
    }

    setPending(true);
    try {
      const result = await updateTask(null, fd);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      onEditingChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div className="min-w-0 flex-1">
        <h2 className="min-w-0 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          <button
            type="button"
            onClick={startEditing}
            className={`w-full cursor-pointer rounded-md px-0 py-0.5 text-left font-semibold text-inherit transition hover:bg-zinc-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800/60 dark:focus-visible:ring-zinc-500 ${
              done ? "line-through decoration-zinc-400" : ""
            }`}
          >
            {task.title}
          </button>
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={startEditing}
            className="cursor-pointer rounded-md px-0 py-0.5 text-left text-inherit transition hover:bg-zinc-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800/60 dark:focus-visible:ring-zinc-500"
          >
            {formatDeadline(deadlineDate)}
          </button>
        </p>
        {task.taskTags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {task.taskTags.map((tt) => (
              <span
                key={tt.tagId}
                className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${tagPillClass(tt.tag.slug)}`}
              >
                {tagDisplayName(tt.tag)}
              </span>
            ))}
          </div>
        ) : null}
        {task.rawInput !== task.title ? (
          <p className="mt-2 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-500">
            Оригінал: {task.rawInput}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Назва
          <input
            name="title"
            required
            defaultValue={task.title}
            disabled={pending}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base font-semibold text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <fieldset className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-600 dark:bg-zinc-900/50">
          <legend className="px-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Дедлайн
          </legend>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-500">
            Обери дату в календарі. Час можна не вказувати — тоді дедлайн на кінець цього дня. Залиш дату
            порожньою, щоб прибрати дедлайн.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Дата
              <input
                type="date"
                name="deadlineDate"
                defaultValue={toDateInputValue(deadlineDate)}
                disabled={pending}
                className="mt-1 min-h-11 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Час <span className="font-normal text-zinc-400">(необов’язково)</span>
              <input
                type="time"
                name="deadlineTime"
                step={60}
                defaultValue={toTimeInputValue(deadlineDate)}
                disabled={pending}
                className="mt-1 min-h-11 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
        </fieldset>

        {assignableTags.length > 0 ? (
          <fieldset className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-600 dark:bg-zinc-900/50">
            <legend className="px-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Теги
            </legend>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">
              Кореневі сфери та підтеги (налаштовуються в «Теги») — відмічай потрібні.
            </p>
            <div className="flex flex-col gap-2">
              {assignableTags.map((tag) => (
                <label
                  key={tag.id}
                  style={{ paddingLeft: `${tag.depth * 0.75}rem` }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={task.taskTags.some((tt) => tt.tagId === tag.id)}
                    disabled={pending}
                    className="size-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-500 dark:bg-zinc-900"
                  />
                  <span className="min-w-0">{tag.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {clientError || serverError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {clientError ?? serverError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setClientError(null);
              setServerError(null);
              onEditingChange(false);
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Скасувати
          </button>
        </div>
      </form>
      {task.rawInput !== task.title ? (
        <p className="mt-2 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-500">
          Оригінал: {task.rawInput}
        </p>
      ) : null}
    </div>
  );
}
