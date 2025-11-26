-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CardState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardId" INTEGER NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "lastAnswerAt" DATETIME,
    "lastResult" TEXT,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "dueAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CardState_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CardTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CardState" ("attemptsCount", "cardId", "correctCount", "createdAt", "dueAt", "easeFactor", "id", "intervalDays", "lastAnswerAt", "lastResult", "updatedAt") SELECT "attemptsCount", "cardId", "correctCount", "createdAt", "dueAt", "easeFactor", "id", "intervalDays", "lastAnswerAt", "lastResult", "updatedAt" FROM "CardState";
DROP TABLE "CardState";
ALTER TABLE "new_CardState" RENAME TO "CardState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
