"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { slugifyName } from "@/lib/slugify";

export type TagActionState = { error?: string } | null;

async function uniqueSlug(base: string): Promise<string> {
  const prisma = getPrisma();
  let slug = base;
  let n = 2;
  for (;;) {
    const exists = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!exists) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export async function createTag(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const parentId = formData.get("parentId")?.toString();
  const name = formData.get("name")?.toString().trim();
  if (!parentId) {
    return { error: "Немає батьківського тегу." };
  }
  if (!name) {
    return { error: "Введіть назву тегу." };
  }

  const parent = await getPrisma().tag.findUnique({ where: { id: parentId } });
  if (!parent) {
    return { error: "Батьківський тег не знайдено." };
  }
  if (parent.parentId !== null) {
    return {
      error: "Поки можна додавати лише підтеги під сферою життя (верхній рівень).",
    };
  }

  let base = slugifyName(name);
  const manualSlug = formData.get("slug")?.toString().trim();
  if (manualSlug) {
    base = slugifyName(manualSlug) || base;
  }
  const slug = await uniqueSlug(base);

  const sortOrderRaw = formData.get("sortOrder")?.toString();
  let sortOrder = 0;
  if (sortOrderRaw) {
    const x = parseInt(sortOrderRaw, 10);
    if (!Number.isNaN(x)) sortOrder = x;
  }

  await getPrisma().tag.create({
    data: { name, slug, parentId, sortOrder },
  });

  revalidatePath("/");
  revalidatePath("/tags");
  return null;
}

export async function updateTag(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  if (!id) {
    return { error: "Немає ідентифікатора тегу." };
  }
  if (!name) {
    return { error: "Назва не може бути порожньою." };
  }

  const existing = await getPrisma().tag.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Тег не знайдено." };
  }

  const sortOrderRaw = formData.get("sortOrder")?.toString();
  let sortOrder = existing.sortOrder;
  if (sortOrderRaw !== undefined && sortOrderRaw !== "") {
    const x = parseInt(sortOrderRaw, 10);
    if (!Number.isNaN(x)) sortOrder = x;
  }

  await getPrisma().tag.update({
    where: { id },
    data: { name, sortOrder },
  });

  revalidatePath("/");
  revalidatePath("/tags");
  return null;
}

export async function deleteTag(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const id = formData.get("id")?.toString();
  if (!id) {
    return { error: "Немає ідентифікатора тегу." };
  }

  const childCount = await getPrisma().tag.count({ where: { parentId: id } });
  if (childCount > 0) {
    return { error: "Спочатку видали дочірні теги." };
  }

  try {
    await getPrisma().tag.deleteMany({ where: { id } });
  } catch {
    return { error: "Не вдалося видалити тег." };
  }

  revalidatePath("/");
  revalidatePath("/tags");
  return null;
}
