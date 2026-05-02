import OpenAI from "openai";

/** Top-level life-area slugs seeded in DB; sub-tags reuse the same slug namespace later. */
export const LIFE_AREA_TAG_SLUGS = ["work", "life", "hobby", "learning"] as const;
export type LifeAreaTagSlug = (typeof LIFE_AREA_TAG_SLUGS)[number];

export type ParsedTask = {
  title: string;
  priority: "high" | "medium" | "low";
  deadline: Date | null;
  /** Resolved life-area tags from the model (subset of seeded root slugs). */
  tagSlugs: LifeAreaTagSlug[];
};

function normalizePriority(value: unknown): ParsedTask["priority"] {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  if (typeof value === "string") {
    const p = value.toLowerCase();
    if (p === "high" || p === "medium" || p === "low") {
      return p;
    }
  }
  return "medium";
}

function parseDeadline(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeTagSlugs(value: unknown): LifeAreaTagSlug[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(LIFE_AREA_TAG_SLUGS);
  const out: LifeAreaTagSlug[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const s = item.trim().toLowerCase();
    if (allowed.has(s)) out.push(s as LifeAreaTagSlug);
  }
  return [...new Set(out)];
}

/**
 * When the model returns no tags, infer life areas from wording (same role as
 * `fallbackParsedTask` for title when JSON breaks — keeps UX when the model is terse).
 */
export function inferLifeAreaSlugsFromKeywords(rawInput: string): LifeAreaTagSlug[] {
  const t = rawInput.toLowerCase();
  const out: LifeAreaTagSlug[] = [];
  const add = (s: LifeAreaTagSlug) => {
    if (!out.includes(s)) out.push(s);
  };

  if (
    /робот|офіс|office|zoom|meeting|standup|jira|клієнт|client|deadline|проект|project|кар'єр|career|зарплат|manager|репорт|звіт\s+по|slack|email\s+до\s+колег/i.test(
      t,
    )
  ) {
    add("work");
  }
  if (
    /сім'я|family|дім\b|дома|home|лікар|doctor|здоров'|health|дитин|kids|особист|personal|мам|тат|відпустк|vacation|релокац|психолог|therapy|купити\s+продукт|groceries/i.test(
      t,
    )
  ) {
    add("life");
  }
  if (
    /хобі|hobby|гра\b|games?|спорт|sport|guitar|гітара|кіно|cinema|netflix|малюван|draw|концерт|підкорити\s+гору|бігати|побігати/i.test(
      t,
    )
  ) {
    add("hobby");
  }
  if (
    /навчан|study|learn|курс|course|tutorial|лекці|lecture|coursera|exam|іспит|універ|university|школ|домашн\w*\s+завдан|homework|read\s+chapter/i.test(
      t,
    )
  ) {
    add("learning");
  }

  return out;
}

export function fallbackParsedTask(rawInput: string): ParsedTask {
  return {
    title: rawInput.length > 200 ? `${rawInput.slice(0, 197)}…` : rawInput,
    priority: "medium",
    deadline: null,
    tagSlugs: inferLifeAreaSlugsFromKeywords(rawInput),
  };
}

export async function parseTaskFromNaturalLanguage(
  rawInput: string,
): Promise<ParsedTask> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });
  const nowIso = new Date().toISOString();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You extract a single task from natural language. Current moment (UTC): ${nowIso}. Interpret relative dates (tomorrow, next week, by Friday, до обіду as around noon local same day if day implied, etc.) as absolute ISO 8601 datetimes in UTC.

Respond ONLY with valid JSON, no markdown, no explanation. The JSON object must have exactly these keys:
- "title": string, concise, same language as the user
- "priority": one of "high", "medium", "low" (urgent/ASAP/терміново → high)
- "deadline": ISO 8601 string in UTC, or null if not known
- "tagSlugs": array of strings; each element must be exactly one of: "work", "life", "hobby", "learning". Infer life-area categories from the FULL user message the same way you infer priority and deadline — from meaning, not from explicit labels. Include every category that clearly applies (often one). Mapping: job/office/meeting/client/project/career/Slack/email to colleagues/робота/звіт → work; family/home/health/personal errands/догляд/ліки → life; sport/games/music/film/creative fun/спорт/хобі → hobby; course/study/exam/lecture/homework/курс/навчання → learning. Use [] only when the text is a generic time reminder with no domain at all (e.g. "remind me at 3pm" with no subject). Examples: "завтра написати Славі про відео" → ["work"]; "купити ліки мамі" → ["life"]; "подивитись лекцію з ML" → ["learning"]; "побігати вечором" → ["hobby"].`,
      },
      { role: "user", content: rawInput },
    ],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    return fallbackParsedTask(rawInput);
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    return fallbackParsedTask(rawInput);
  }

  if (!data || typeof data !== "object") {
    return fallbackParsedTask(rawInput);
  }

  const obj = data as Record<string, unknown>;
  const title =
    typeof obj.title === "string" && obj.title.trim()
      ? obj.title.trim()
      : fallbackParsedTask(rawInput).title;

  const fromModel = normalizeTagSlugs(obj.tagSlugs);
  const tagSlugs =
    fromModel.length > 0 ? fromModel : inferLifeAreaSlugsFromKeywords(rawInput);

  return {
    title,
    priority: normalizePriority(obj.priority),
    deadline: parseDeadline(obj.deadline),
    tagSlugs,
  };
}
