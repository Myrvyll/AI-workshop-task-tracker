export function formatDeadline(d: Date | null) {
  if (!d) return "без дедлайну";
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
