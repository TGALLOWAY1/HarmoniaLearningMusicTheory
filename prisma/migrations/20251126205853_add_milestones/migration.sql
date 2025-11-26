-- CreateTable
CREATE TABLE "Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "progress" REAL NOT NULL DEFAULT 0.0
);

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_key_key" ON "Milestone"("key");

-- CreateIndex
CREATE INDEX "Milestone_order_idx" ON "Milestone"("order");
