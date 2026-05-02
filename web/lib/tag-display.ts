import type { TaskWithTags } from "@/lib/task-include";

type TagWithOptionalParent = TaskWithTags["taskTags"][number]["tag"];

export function tagDisplayName(tag: TagWithOptionalParent): string {
  if (tag.parent) {
    return `${tag.parent.name} / ${tag.name}`;
  }
  return tag.name;
}
