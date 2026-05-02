import type { Prisma } from "@/app/generated/prisma/client";

/** Task list payload with tags (hierarchy-ready: `tag.parentId`, `tag.children` unused in UI for now). */
export const TASK_WITH_TAGS_INCLUDE = {
  taskTags: {
    include: {
      tag: {
        include: {
          parent: true,
        },
      },
    },
  },
} satisfies Prisma.TaskInclude;

export type TaskWithTags = Prisma.TaskGetPayload<{
  include: typeof TASK_WITH_TAGS_INCLUDE;
}>;
