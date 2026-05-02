import { getPrisma } from "@/lib/prisma";

/** Tags the user can assign today: top-level life areas. Sub-tags (e.g. under work) appear here once they exist in DB. */
export async function getAssignableTags() {
  return getPrisma().tag.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

/** Drops unknown ids (e.g. tampered form data). Works for future child tags once they exist in `Tag`. */
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
