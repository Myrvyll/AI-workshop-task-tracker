import { getTagsForTaskPicker, type TagForTaskPicker } from "@/lib/tag-tree";
import { getPrisma } from "@/lib/prisma";

export type { TagForTaskPicker };

/** All tags in tree order with depth for the task editor (roots and sub-tags). */
export async function getAssignableTags(): Promise<TagForTaskPicker[]> {
  return getTagsForTaskPicker();
}

/** Drops unknown ids (e.g. tampered form data). */
export async function filterExistingTagIds(requestedIds: string[]): Promise<string[]> {
  if (requestedIds.length === 0) return [];
  const tags = await getPrisma().tag.findMany({
    where: { id: { in: requestedIds } },
    select: { id: true },
  });
  return tags.map((t) => t.id);
}

export async function tagIdsFromSlugs(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const tags = await getPrisma().tag.findMany({
    where: { slug: { in: slugs } },
    select: { id: true },
  });
  return tags.map((t) => t.id);
}
