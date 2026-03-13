I’ll give you a **Prisma-style** schema plus a quick ERD description.

### Entity Overview

- `Setting` — single row of user settings
- `Milestone` — each milestone in your curriculum
- `CardTemplate` — definition of a card (prompt, type, metadata)
- `CardState` — SRS state per card (for your single user)
- `CardAttempt` — every attempt logged
- `CircleKey` — metadata for circle of fifths keys
- (Optionally) `Tag`/`CardTag` for filtering later

### Prisma-Style Schema

```
model Setting {
  id                 Int      @id @default(1)
  freeExploreMode    Boolean  @default(false)
  enableAdvancedTopics Boolean @default(false)
  hintLevel          String   @default("light") // "none" | "light"
  updatedAt          DateTime @updatedAt
}

model Milestone {
  id          Int       @id @default(autoincrement())
  key         String    @unique        // e.g. "FOUNDATION", "CIRCLE_OF_FIFTHS"
  title       String
  description String
  isUnlocked  Boolean   @default(false)
  isCompleted Boolean   @default(false)
  progress    Float     @default(0)
  order       Int

  cardTemplates CardTemplate[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model CardTemplate {
  id          Int       @id @default(autoincrement())
  type        String                // e.g. "CHORD_TO_NOTES", "NOTES_TO_CHORD", "CIRCLE_GEOMETRY"
  promptJson  Json                  // structure depends on type
  optionsJson Json?                 // multiple choice options etc.
  answerJson  Json                  // canonical correct answer
  difficulty  Int       @default(1) // 1=basic,2=intermediate,3=advanced

  milestone   Milestone @relation(fields: [milestoneId], references: [id])
  milestoneId Int

  circleKey   CircleKey? @relation(fields: [circleKeyId], references: [id])
  circleKeyId Int?

  isActive    Boolean   @default(true)

  cardState   CardState?
  attempts    CardAttempt[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model CardState {
  id           Int          @id @default(autoincrement())
  cardTemplate CardTemplate @relation(fields: [cardTemplateId], references: [id])
  cardTemplateId Int @unique

  // SM-2 or similar fields
  easeFactor   Float       @default(2.5)
  intervalDays Int         @default(0)
  repetitions  Int         @default(0)
  lapses       Int         @default(0)
  dueAt        DateTime    @default(now())
  lastResult   String?     // e.g. "Again" | "Hard" | "Good" | "Easy"

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model CardAttempt {
  id            Int          @id @default(autoincrement())
  cardTemplate  CardTemplate @relation(fields: [cardTemplateId], references: [id])
  cardTemplateId Int

  correct       Boolean
  confidence    String       // "Again" | "Hard" | "Good" | "Easy"
  answerMs      Int          // time to answer
  givenAnswer   Json         // what user selected/constructed

  createdAt     DateTime     @default(now())
}

model CircleKey {
  id             Int       @id @default(autoincrement())
  keyId          String    @unique // e.g. "C_major"
  root           String          // "C", "G", "F#"
  type           String          // "major" | "minor"
  clockPosition  Int             // 0-11
  accidentals    Int             // -7..+7
  accidentalType String          // "sharps" | "flats" | "none"

  relativeMinorId String?        // keyId of relative minor
  relativeMajorId String?        // keyId of relative major

  clockwiseNeighborId    String? // keyId
  counterclockwiseNeighborId String?

  // Derived stats (for progress)
  mastery       Float    @default(0)          // aggregated
  lastReviewedAt DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  cardTemplates CardTemplate[]
}

```

### Quick ERD Summary

- **Milestone 1–N**
    
    ↳ has many `CardTemplate` records
    
- **CardTemplate**
    
    ↳ has one `CardState` (SRS info, single user)
    
    ↳ has many `CardAttempt` (history)
    
    ↳ optionally linked to `CircleKey` (for circle-related questions)
    
- **CircleKey**
    
    ↳ can be used for circle metadata AND aggregated mastery
    
- **Setting**
    
    ↳ one row controlling freeExploreMode, advanced topics, hints