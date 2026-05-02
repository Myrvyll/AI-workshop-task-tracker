/** Visual accent for root life-area tags; unknown slugs get a stable hashed palette. */
const HASH_PALETTES = [
  "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/45 dark:text-emerald-100",
  "border-orange-200 bg-orange-50 text-orange-950 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-100",
  "border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-900/50 dark:bg-cyan-950/45 dark:text-cyan-100",
  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/40 dark:text-fuchsia-100",
  "border-lime-200 bg-lime-50 text-lime-950 dark:border-lime-900/50 dark:bg-lime-950/35 dark:text-lime-100",
  "border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-900/50 dark:bg-indigo-950/45 dark:text-indigo-100",
] as const;

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function tagPillClass(slug: string): string {
  switch (slug) {
    case "work":
      return "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-100";
    case "life":
      return "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-100";
    case "hobby":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-100";
    case "learning":
      return "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-100";
    default:
      return HASH_PALETTES[hashSlug(slug) % HASH_PALETTES.length];
  }
}
