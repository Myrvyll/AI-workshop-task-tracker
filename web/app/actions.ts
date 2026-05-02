"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import {
  fallbackParsedTask,
  parseTaskFromNaturalLanguage,
} from "@/lib/parse-task";

export type TaskFormState = { error?: string } | null;

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

  try {
    const parsed = await parseTaskFromNaturalLanguage(rawInput);
    title = parsed.title;
    priority = parsed.priority;
    deadline = parsed.deadline;
  } catch {
    const fb = fallbackParsedTask(rawInput);
    title = fb.title;
    priority = fb.priority;
    deadline = fb.deadline;
  }

  await getPrisma().task.create({
    data: { rawInput, title, priority, deadline },
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
