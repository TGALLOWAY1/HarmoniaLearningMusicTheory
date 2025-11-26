# Spaced Repetition System (SRS) - SuperMemo 2

This module implements the SuperMemo 2 (SM-2) spaced repetition algorithm for scheduling flashcard reviews.

## Overview

The SM-2 algorithm schedules card reviews based on:
- **Ease Factor**: How easy the card is for the user (starts at 2.5, adjusts based on performance)
- **Interval**: Days until next review (increases with successful reviews)
- **Repetitions**: Number of consecutive successful reviews
- **Lapses**: Number of times a card was forgotten after being learned

## Confidence Ratings

Users provide confidence ratings that map to SM-2 quality values (0-5):

- `"Again"` → 0 (incorrect answer)
- `"Hard"` → 1 (correct but difficult)
- `"Good"` → 3 (correct with normal difficulty)
- `"Easy"` → 5 (correct and easy)

## Usage

### Basic Usage

```typescript
import { updateCardWithSM2, type ConfidenceRating } from "@/lib/srs";

const currentState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

// User answers with "Good" confidence
const result = updateCardWithSM2("Good", currentState);

console.log(result);
// {
//   easeFactor: 2.6,
//   intervalDays: 1,
//   repetitions: 1,
//   lapses: 0,
//   dueAt: Date (1 day from now)
// }
```

### With Prisma CardState

```typescript
import { calculateSM2Update } from "@/lib/srs";
import { prisma } from "@/lib/db";

// Get card state from database
const cardState = await prisma.cardState.findFirst({
  where: { cardId: 1 },
});

if (cardState) {
  // Calculate SM-2 update
  const update = calculateSM2Update("Good", cardState);

  // Update database
  await prisma.cardState.update({
    where: { id: cardState.id },
    data: update,
  });
}
```

## Algorithm Details

### Ease Factor Calculation

The ease factor adjusts based on quality:
- Formula: `EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))`
- Minimum ease factor: 1.3
- Higher quality → ease factor increases
- Lower quality → ease factor decreases

### Interval Calculation

- **Quality < 3** (Again/Hard): Reset to 1 day, reset repetitions to 0
- **Quality >= 3** (Good/Easy):
  - First review (repetitions = 0): 1 day
  - Second review (repetitions = 1): 6 days
  - Subsequent reviews: `previous interval × ease factor`

### Lapse Tracking

A lapse occurs when a card that was previously learned (repetitions > 0) is answered incorrectly (quality < 3). The lapse count is incremented in this case.

## API Reference

See `lib/srs/sm2.ts` for detailed function documentation:

- `confidenceToQuality(confidence)`: Maps confidence rating to quality (0-5)
- `calculateEaseFactor(currentEaseFactor, quality)`: Calculates new ease factor
- `calculateInterval(...)`: Calculates new interval and repetition count
- `calculateDueDate(intervalDays, fromDate?)`: Calculates next due date
- `calculateSM2(params)`: Main SM-2 algorithm function
- `updateCardWithSM2(confidence, currentState)`: Convenience wrapper
- `calculateSM2Update(confidence, cardState)`: Returns Prisma update object

