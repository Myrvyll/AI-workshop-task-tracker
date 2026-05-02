import type { Tag } from "@/app/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type TagForTaskPicker = Pick<Tag, "id" | "name" | "slug" | "parentId"> & {
  depth: number;
};

type TagRow = Pick<Tag, "id" | "name" | "slug" | "parentId" | "sortOrder">;

/** Depth-first order: roots by sortOrder, then each subtree. */
export function flattenTagsForPicker(tags: TagRow[]): TagForTaskPicker[] {
  const byParent = new Map<string | null, TagRow[]>();
  for (const t of tags) {
    const key = t.parentId ?? null;
    const list = byParent.get(key);
    if (list) list.push(t);
    else byParent.set(key, [t]);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, "uk");
    });
  }
  const out: TagForTaskPicker[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const t of byParent.get(parentId) ?? []) {
      out.push({
        id: t.id,
        name: t.name,
        slug: t.slug,
        parentId: t.parentId,
        depth,
      });
      walk(t.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}

export async function getTagsForTaskPicker(): Promise<TagForTaskPicker[]> {
  const rows = await getPrisma().tag.findMany({
    select: { id: true, name: true, slug: true, parentId: true, sortOrder: true },
  });
  return flattenTagsForPicker(rows);
}

export async function getRootTags() {
  return getPrisma().tag.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, sortOrder: true },
  });
}

export async function getTagChildren(parentId: string) {
  return getPrisma().tag.findMany({
    where: { parentId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, sortOrder: true, parentId: true },
  });
}

export async function getRootBySlug(slug: string) {
  return getPrisma().tag.findFirst({
    where: { parentId: null, slug },
    select: { id: true, slug: true, name: true, sortOrder: true },
  });
}
