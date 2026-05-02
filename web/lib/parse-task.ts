import OpenAI from "openai";

export type ParsedTask = {
  title: string;
  priority: "high" | "medium" | "low";
  deadline: Date | null;
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

export function fallbackParsedTask(rawInput: string): ParsedTask {
  return {
    title: rawInput.length > 200 ? `${rawInput.slice(0, 197)}…` : rawInput,
    priority: "medium",
    deadline: null,
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
- "deadline": ISO 8601 string in UTC, or null if not known`,
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

  return {
    title,
    priority: normalizePriority(obj.priority),
    deadline: parseDeadline(obj.deadline),
  };
}
