/** Visual accent for root life-area tags (extend when sub-tags get their own slugs). */
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
      return "border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200";
  }
}
