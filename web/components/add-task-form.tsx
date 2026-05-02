"use client";

import { useActionState } from "react";
import { createTask, type TaskFormState } from "@/app/actions";

export function AddTaskForm() {
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(
    createTask,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="rawInput" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Нова задача (як у Slack)
      </label>
      <textarea
        id="rawInput"
        name="rawInput"
        rows={3}
        required
        disabled={pending}
        placeholder="Наприклад: завтра написати Славі про відео до обіду, терміново"
        className="max-h-48 min-h-[4.5rem] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {pending ? "Розбираю…" : "Додати задачу"}
      </button>
    </form>
  );
}
