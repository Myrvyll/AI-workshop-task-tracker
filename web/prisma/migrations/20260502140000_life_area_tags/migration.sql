-- Life-area tags (hierarchical via parentId; seed roots only).

CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

CREATE INDEX "Tag_parentId_idx" ON "Tag"("parentId");

ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "TaskTag" (
    "taskId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("taskId","tagId")
);

CREATE INDEX "TaskTag_tagId_idx" ON "TaskTag"("tagId");

ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Tag" ("id", "slug", "name", "parentId", "sortOrder") VALUES
('tag_seed_work', 'work', 'Робота', NULL, 0),
('tag_seed_life', 'life', 'Життя', NULL, 1),
('tag_seed_hobby', 'hobby', 'Хобі', NULL, 2),
('tag_seed_learning', 'learning', 'Навчання', NULL, 3);
