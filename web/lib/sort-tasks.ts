import type { TaskSortOrder } from "@/lib/task-list-query";

const PRIORITY_SCORE: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function priorityScore(priority: string): number {
  return PRIORITY_SCORE[priority] ?? 2;
}

type TaskPrioritySortable = { priority: string; createdAt: Date };

function compareCreatedAt(a: TaskPrioritySortable, b: TaskPrioritySortable, order: TaskSortOrder): number {
  const t = a.createdAt.getTime() - b.createdAt.getTime();
  return order === "asc" ? t : -t;
}

/** In-memory sort when ordering by priority (not a natural DB order for high/medium/low). */
export function sortTasksByPriority<T extends TaskPrioritySortable>(
  tasks: T[],
  order: TaskSortOrder,
): T[] {
  return [...tasks].sort((a, b) => {
    const pa = priorityScore(a.priority);
    const pb = priorityScore(b.priority);
    if (pa !== pb) {
      return order === "desc" ? pb - pa : pa - pb;
    }
    return compareCreatedAt(a, b, "desc");
  });
}
