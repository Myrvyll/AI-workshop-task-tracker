/** Basic Cyrillic → Latin map for URL slugs (Ukrainian-focused). */
const CYR_TO_LAT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
  ы: "y",
  э: "e",
  ё: "io",
  ъ: "",
};

function transliterateChar(ch: string): string {
  const lower = ch.toLowerCase();
  const mapped = CYR_TO_LAT[lower];
  if (mapped !== undefined) return mapped;
  if (/[a-z0-9]/.test(lower)) return lower;
  if (ch === " " || ch === "_" || ch === "-") return "-";
  return "";
}

/** Produce a URL-safe base slug from arbitrary display text. */
export function slugifyName(name: string): string {
  const raw = name
    .trim()
    .split("")
    .map((c) => transliterateChar(c))
    .join("");
  const collapsed = raw
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return collapsed || "tag";
}
