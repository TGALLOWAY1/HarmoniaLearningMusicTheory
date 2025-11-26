# Milestone 4 - SM-2 Spaced Repetition System Integration Notes

This document contains summaries from each prompt/task completed during Milestone 4 development.

---

## Prompt 4.1 - Add SM2 Utility Functions

### Goal
Implement SuperMemo 2 (SM-2) spaced repetition algorithm utility functions for scheduling flashcard reviews.

### Files Created/Modified:

1. **`lib/srs/sm2.ts`** - Core SM-2 algorithm implementation:
   - `ConfidenceRating` type: "Again" | "Hard" | "Good" | "Easy"
   - `confidenceToQuality()`: Maps confidence ratings to SM-2 quality values (0-5)
   - `calculateEaseFactor()`: Updates ease factor based on quality rating
   - `calculateInterval()`: Calculates new review interval and tracks lapses
   - `calculateDueDate()`: Computes next due date from interval
   - `calculateSM2()`: Main SM-2 algorithm function
   - `updateCardWithSM2()`: Convenience wrapper for card state updates
   - `calculateSM2Update()`: Returns Prisma-ready update object

2. **`lib/srs/index.ts`** - Module exports for SRS utilities

3. **`lib/srs/README.md`** - Documentation with usage examples and algorithm details

4. **`prisma/schema.prisma`** - Updated CardState model:
   - Added `repetitions` field (Int, default 0)
   - Added `lapses` field (Int, default 0)
   - Changed `lastResult` from Boolean to String (stores confidence rating)

5. **`prisma/migrations/20251126185015_add_sm2_fields/`** - Database migration:
   - Adds `repetitions` and `lapses` columns
   - Converts `lastResult` from Boolean to String (TEXT)

### SM-2 Algorithm Details:

**Ease Factor Calculation:**
- Formula: `EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))`
- Minimum ease factor: 1.3
- Adjusts based on quality rating (higher quality increases ease factor)

**Interval Calculation:**
- Quality < 3 (Again/Hard): Reset to 1 day, reset repetitions to 0
- Quality >= 3 (Good/Easy):
  - First review (repetitions = 0): 1 day
  - Second review (repetitions = 1): 6 days
  - Subsequent reviews: `previous interval × ease factor`

**Lapse Tracking:**
- A lapse occurs when a previously learned card (repetitions > 0) is answered incorrectly
- Lapse count increments when quality < 3 and repetitions > 0

**Quality Mapping:**
- "Again" → 0 (incorrect)
- "Hard" → 1 (correct but difficult)
- "Good" → 3 (correct with normal difficulty)
- "Easy" → 5 (correct and easy)

---

## Prompt 4.2 - Modify `/api/cards/[id]/answer` to Use SM-2

### Goal
Update the answer endpoint to accept quality ratings and use SM-2 algorithm for scheduling.

### Files Modified:

1. **`app/api/cards/[id]/answer/route.ts`** - Updated answer processing:

**Request Body Changes:**
- Added `quality` field (required): `0 | 1 | 2 | 3`
- `selectedIndex`: Still required
- `responseMs`: Optional

**New Validation:**
- Validates `quality` is provided and is 0, 1, 2, or 3

**SM-2 Integration:**
- Maps quality (0-3) to SM-2 quality (0-5): 0→0, 1→1, 2→3, 3→5
- Calls `calculateSM2()` with current card state
- Updates `CardState` with:
  - `easeFactor`: From SM-2 calculation
  - `intervalDays`: From SM-2 calculation
  - `repetitions`: From SM-2 calculation
  - `lapses`: From SM-2 calculation
  - `dueAt`: Next review date from SM-2
  - `lastResult`: Confidence rating string ("Again" | "Hard" | "Good" | "Easy")
  - Existing counters (`attemptsCount`, `correctCount`, `lastAnswerAt`)

**Response Changes:**
- Added `nextDueAt`: ISO string of next due date
- Added SRS fields to state: `easeFactor`, `intervalDays`, `repetitions`

**Helper Functions:**
- `qualityToConfidence()`: Maps quality to confidence rating string
- `qualityToSM2Quality()`: Maps quality (0-3) to SM-2 quality (0-5)

---

## Prompt 4.3 - Modify `/api/cards/next` for True SRS Scheduling

### Goal
Update the next card endpoint to prioritize cards by due date with random distribution.

### Files Modified:

1. **`app/api/cards/next/route.ts`** - Updated card selection logic:

**Query Changes:**
- Changed `orderBy` from `[{ dueAt: "asc" }, { id: "asc" }]` to `[{ dueAt: "asc" }]`
- Removed `id` tiebreaker (random selection handles ties)

**SRS Scheduling Logic:**
1. **Partitioning**: Split cards into two groups:
   - `dueCards`: Cards where `dueAt <= now` (overdue or due now)
   - Future cards: Cards with `dueAt > now`

2. **Selection Algorithm**:
   - **If due cards exist**: Randomly select one from due cards
   - **If no due cards**: 
     - Get earliest future `dueAt` from sorted list
     - Find all cards with that same `dueAt` (using `getTime()` for comparison)
     - Randomly select one from those cards

3. **Random Selection**:
   - Uses `Math.floor(Math.random() * array.length)` for uniform distribution
   - Improves card review distribution when multiple cards share same priority

**Response Changes:**
- Added `correctIndex` to card response (for local correctness checking in UI)

**Benefits:**
- Prioritizes due cards (`dueAt <= now`)
- Distributes reviews evenly when multiple cards share same due date
- Handles future cards by selecting from earliest due date group
- Maintains existing functionality (state creation, template lookup)

---

## Prompt 4.4 - Update Practice UI to Support Quality Buttons

### Goal
Add SM-2 quality rating buttons to the Practice page, replacing the "Next card" button.

### Files Modified:

1. **`app/practice/page.tsx`** - Updated UI flow:

**Type Updates:**
- `LoadedCard` type now includes `correctIndex` field

**New State Flow:**
1. **Initial State** (`correctIndex === null`):
   - User sees flashcard with 4 options
   - User selects an option
   - "Check answer" button enabled

2. **After "Check answer"**:
   - `handleSubmit()` runs (local check only, no API call)
   - Sets `correctIndex` from card data
   - Flashcard shows correct/incorrect feedback
   - "Check answer" button replaced with quality buttons

3. **Quality Buttons Appear** (`correctIndex !== null`):
   - Four buttons: [Again] [Hard] [Good] [Easy]
   - Colors: Red (Again), Orange (Hard), Emerald (Good), Blue (Easy)
   - Buttons disabled during submission

4. **User Clicks Quality Button**:
   - `submitQuality(q)` called with quality value (0-3)
   - POST request to `/api/cards/${card.id}/answer` with:
     - `selectedIndex`: User's selected answer
     - `quality`: Quality rating (0-3)
   - After successful submission, automatically calls `fetchNextCard()`

5. **Next Card Loaded**:
   - State resets (`selectedIndex = null`, `correctIndex = null`)
   - New card displayed
   - Flow repeats

**New Functions:**
- `handleSubmit()`: Simplified to check correctness locally (no API call)
- `submitQuality(q)`: Sends quality rating to API and fetches next card

**UI Changes:**
- Replaced "Next card" button with quality rating buttons
- Quality buttons appear after correctness feedback
- Automatic card progression after quality submission
- Proper loading/error states maintained

**API Integration:**
- `/api/cards/next` now returns `correctIndex` for local checking
- Quality submission sends both `selectedIndex` and `quality` to answer endpoint

---

## Database Migration & Data Fix

### Issue
After changing `lastResult` from Boolean to String, existing database records had boolean values (`1`/`0`) that couldn't be read as strings.

### Solution
Updated all existing `CardState` records to set `lastResult = NULL` for old attempts (since we can't know the confidence rating for historical data).

**SQL Command:**
```sql
UPDATE CardState SET lastResult = NULL 
WHERE typeof(lastResult) = 'integer' OR lastResult IN ('0', '1', 'true', 'false');
```

**Regenerated Prisma Client:**
- Ran `npx prisma generate` to sync client with schema

---

## Bug Fixes - Quality Rating Submission Error

### Issue
Users reported "Failed to submit quality rating" error when clicking quality buttons.

### Root Cause
1. Error handling in UI was too generic, not showing actual API error messages
2. Missing null safety for `repetitions` field in API endpoint (only `lapses` had fallback)

### Solution

**1. Improved Error Handling (`app/practice/page.tsx`):**
- Updated `submitQuality()` to parse and display actual API error messages
- Changed from generic "Failed to submit quality rating" to showing specific error from API response
- Helps with debugging and provides better user feedback

**2. Added Null Safety (`app/api/cards/[id]/answer/route.ts`):**
- Added `?? 0` fallback for `repetitions` field (matching `lapses`)
- Prevents errors if field is missing from database records
- Ensures SM-2 calculation always has valid numeric values

**Changes:**
```typescript
// Before
repetitions: state.repetitions,

// After  
repetitions: state.repetitions ?? 0,
```

These fixes ensure robust error handling and prevent runtime errors from missing database fields.

---

## Summary

Milestone 4 successfully integrates the SuperMemo 2 (SM-2) spaced repetition algorithm into Harmonia:

1. **SM-2 Algorithm Implementation**: 
   - Complete utility functions for ease factor, interval, and due date calculations
   - Lapse tracking for forgotten cards
   - Quality rating system (Again/Hard/Good/Easy)

2. **API Integration**:
   - `/api/cards/[id]/answer` now accepts quality ratings and updates SRS scheduling
   - `/api/cards/next` prioritizes cards by due date with random distribution

3. **UI Updates**:
   - Quality rating buttons replace "Next card" button
   - Local correctness checking before quality submission
   - Automatic card progression after quality rating

4. **Database Schema**:
   - Added `repetitions` and `lapses` fields to `CardState`
   - Changed `lastResult` from Boolean to String
   - Migration created and applied

5. **Data Migration**:
   - Fixed existing boolean values in `lastResult` field
   - All historical data set to NULL (appropriate for old attempts)

The flashcard system now uses true spaced repetition scheduling, automatically adjusting review intervals based on user performance and confidence ratings. Cards are scheduled intelligently, with due cards prioritized and future cards scheduled based on SM-2 calculations.

