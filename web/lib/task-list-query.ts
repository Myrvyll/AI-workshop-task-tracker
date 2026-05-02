export type TaskStatusFilterValue = "all" | "active" | "done";

export type TaskSortBy = "created" | "deadline" | "priority";

export type TaskSortOrder = "asc" | "desc";

export const DEFAULT_SORT_BY: TaskSortBy = "created";

export const DEFAULT_SORT_ORDER: TaskSortOrder = "desc";

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseTaskStatusFilter(sp: {
  status?: string | string[];
}): TaskStatusFilterValue {
  const v = firstParam(sp.status);
  if (v === "active" || v === "done") return v;
  return "all";
}

export function parseTaskSortBy(sp: { sort?: string | string[] }): TaskSortBy {
  const v = firstParam(sp.sort);
  if (v === "deadline" || v === "priority" || v === "created") return v;
  return DEFAULT_SORT_BY;
}

export function parseTaskSortOrder(sp: {
  order?: string | string[];
}): TaskSortOrder {
  const v = firstParam(sp.order);
  if (v === "asc" || v === "desc") return v;
  return DEFAULT_SORT_ORDER;
}

export function taskListHref(opts: {
  status: TaskStatusFilterValue;
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
}): string {
  const params = new URLSearchParams();
  if (opts.status !== "all") params.set("status", opts.status);
  const sortNonDefault =
    opts.sortBy !== DEFAULT_SORT_BY || opts.sortOrder !== DEFAULT_SORT_ORDER;
  if (sortNonDefault) {
    params.set("sort", opts.sortBy);
    params.set("order", opts.sortOrder);
  }
  const q = params.toString();
  return q ? `/?${q}` : "/";
}
