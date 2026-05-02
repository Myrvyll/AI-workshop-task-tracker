"use client";

import { useActionState } from "react";
import {
  createTag,
  deleteTag,
  updateTag,
  type TagActionState,
} from "@/app/tag-actions";

function FormError({ state }: { state: TagActionState }) {
  if (!state?.error) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {state.error}
    </p>
  );
}

export function RootRenameForm({
  tagId,
  defaultName,
}: {
  tagId: string;
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState<TagActionState, FormData>(
    updateTag,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-zinc-200/90 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
      <input type="hidden" name="id" value={tagId} />
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Назва сфери (кореневий тег)
        <input
          name="name"
          required
          defaultValue={defaultName}
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <input type="hidden" name="sortOrder" value="" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? "Зберігаю…" : "Зберегти назву"}
        </button>
        <FormError state={state} />
      </div>
    </form>
  );
}

export function CreateChildTagForm({ parentId }: { parentId: string }) {
  const [state, formAction, pending] = useActionState<TagActionState, FormData>(
    createTag,
    null,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-zinc-300/90 bg-white/60 p-4 dark:border-zinc-600 dark:bg-zinc-900/40"
    >
      <input type="hidden" name="parentId" value={parentId} />
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Новий підтег</p>
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Назва
        <input
          name="name"
          required
          placeholder="Наприклад: 1-1 з клієнтом"
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Порядок <span className="font-normal text-zinc-400">(необов’язково)</span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={0}
          disabled={pending}
          className="mt-1 w-28 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? "Додаю…" : "Додати підтег"}
        </button>
        <FormError state={state} />
      </div>
    </form>
  );
}

export function ChildTagRow({
  tag,
}: {
  tag: { id: string; name: string; slug: string; sortOrder: number };
}) {
  const [updateState, updateAction, updatePending] = useActionState<
    TagActionState,
    FormData
  >(updateTag, null);
  const [deleteState, deleteAction, deletePending] = useActionState<
    TagActionState,
    FormData
  >(deleteTag, null);

  return (
    <li className="rounded-xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50">
      <form action={updateAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <input type="hidden" name="id" value={tag.id} />
        <label className="min-w-0 flex-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Назва
          <input
            name="name"
            required
            defaultValue={tag.name}
            disabled={updatePending}
            className="mt-1 w-full min-w-[12rem] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="w-full text-xs font-medium text-zinc-600 sm:w-24 dark:text-zinc-400">
          Порядок
          <input
            name="sortOrder"
            type="number"
            defaultValue={tag.sortOrder}
            disabled={updatePending}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {updatePending ? "…" : "Зберегти"}
          </button>
        </div>
      </form>
      <p className="mt-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">slug: {tag.slug}</p>
      <FormError state={updateState} />
      <form
        action={deleteAction}
        className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800"
        onSubmit={(e) => {
          if (
            !window.confirm(
              `Видалити тег «${tag.name}»? Зв’язки з задачами буде знято.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={tag.id} />
        <button
          type="submit"
          disabled={deletePending}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
        >
          {deletePending ? "Видаляю…" : "Видалити тег"}
        </button>
        <FormError state={deleteState} />
      </form>
    </li>
  );
}
