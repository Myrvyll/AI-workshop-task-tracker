"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { filterExistingTagIds, tagIdsFromSlugs } from "@/lib/assignable-tags";
import {
  fallbackParsedTask,
  parseTaskFromNaturalLanguage,
} from "@/lib/parse-task";

export type TaskFormState = { error?: string } | null;

export type UpdateTaskState = { error?: string } | null;

export async function updateTask(
  _prev: UpdateTaskState,
  formData: FormData,
): Promise<UpdateTaskState> {
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const deadlineIso = formData.get("deadlineIso")?.toString().trim() ?? "";

  if (!id) {
    return { error: "Немає ідентифікатора задачі." };
  }
  if (!title) {
    return { error: "Назва не може бути порожньою." };
  }

  let deadline: Date | null = null;
  if (deadlineIso) {
    const d = new Date(deadlineIso);
    if (Number.isNaN(d.getTime())) {
      return { error: "Некоректна дата." };
    }
    deadline = d;
  }

  const existing = await getPrisma().task.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Задачу не знайдено." };
  }

  const requestedTagIds = formData.getAll("tagIds").map((v) => v.toString()).filter(Boolean);
  const tagIds = await filterExistingTagIds(requestedTagIds);

  await getPrisma().task.update({
    where: { id },
    data: {
      title,
      deadline,
      taskTags: {
        deleteMany: {},
        ...(tagIds.length > 0 ? { create: tagIds.map((tagId) => ({ tagId })) } : {}),
      },
    },
  });

  revalidatePath("/");
  return null;
}

export async function createTask(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const rawInput = formData.get("rawInput")?.toString().trim();
  if (!rawInput) {
    return { error: "Введіть текст задачі." };
  }

  let title: string;
  let priority: string;
  let deadline: Date | null;
  let tagSlugs: string[];

  try {
    const parsed = await parseTaskFromNaturalLanguage(rawInput);
    title = parsed.title;
    priority = parsed.priority;
    deadline = parsed.deadline;
    tagSlugs = parsed.tagSlugs;
  } catch {
    const fb = fallbackParsedTask(rawInput);
    title = fb.title;
    priority = fb.priority;
    deadline = fb.deadline;
    tagSlugs = fb.tagSlugs;
  }

  const tagIds = await tagIdsFromSlugs(tagSlugs);

  await getPrisma().task.create({
    data: {
      rawInput,
      title,
      priority,
      deadline,
      ...(tagIds.length > 0 ? { taskTags: { create: tagIds.map((tagId) => ({ tagId })) } } : {}),
    },
  });

  revalidatePath("/");
  return null;
}

export async function toggleTaskDone(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const task = await getPrisma().task.findUnique({ where: { id } });
  if (!task) return;

  await getPrisma().task.update({
    where: { id },
    data: { done: !task.done },
  });

  revalidatePath("/");
}

export async function deleteTask(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  await getPrisma().task.deleteMany({ where: { id } });

  revalidatePath("/");
}
