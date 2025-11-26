# Milestone 5 - Progress Dashboard & Stats Notes

This document contains summaries from each prompt/task completed during Milestone 5 development.

---

## Prompt 5.1 - Implement `/api/progress/summary`

### Goal
Create a backend endpoint to summarize spaced repetition progress with comprehensive statistics across all cards, SRS status, breakdown by card kind, and recent activity.

### Files Created/Modified:

1. **`app/api/progress/summary/route.ts`** - Progress summary API endpoint:
   - `GET /api/progress/summary` handler
   - `ProgressSummaryResponse` type definition
   - Helper functions: `getEndOfToday()`, `formatDate()`

### Implementation Details:

**a) Totals Calculation:**
- `cardsTotal`: Count of all `CardTemplate` records
- `cardsSeen`: Count of `CardState` records with `attemptsCount > 0`
- `cardsUnseen`: Cards without a state OR cards with state but `attemptsCount = 0`
- `attemptsTotal`: Sum of all `attemptsCount` values across all states
- `correctTotal`: Sum of all `correctCount` values across all states
- `accuracyOverall`: `correctTotal / attemptsTotal` (0 if no attempts)

**b) SRS Status:**
- `dueNow`: Count of `CardState` where `dueAt <= now`
- `overdue`: Count where `dueAt < now` AND `attemptsCount > 0`
- `dueToday`: Count where `dueAt <= endOfToday` (23:59:59 local time)
- `averageIntervalDays`: Average of `intervalDays` for states with `attemptsCount > 0` (0 if none)
- `averageEaseFactor`: Average of `easeFactor` for states with `attemptsCount > 0` (0 if none)

**c) By Kind Breakdown:**
- Groups `CardTemplate` by `kind` using Prisma `groupBy`
- For each kind:
  - `cards`: Number of templates with that kind
  - `seen`: Number of states with `attemptsCount > 0` for cards of that kind
  - `accuracy`: `totalCorrectForKind / totalAttemptsForKind` (0 if no attempts)

**d) Recent Activity:**
- Fetches `CardAttempt` records from the last 14 days
- Groups attempts by date (YYYY-MM-DD format)
- For each date: counts total attempts and correct attempts
- Returns array sorted ascending by date

### Edge Cases Handled:
- No cards: Returns zeros and empty arrays
- Division by zero: All accuracy/average calculations check for zero denominators
- Cards without states: Correctly counted in `cardsUnseen`
- No recent activity: Returns empty array

### Response Structure:
```typescript
{
  totals: { cardsTotal, cardsSeen, cardsUnseen, attemptsTotal, correctTotal, accuracyOverall },
  srs: { dueNow, overdue, dueToday, averageIntervalDays, averageEaseFactor },
  byKind: [{ kind, cards, seen, accuracy }],
  recentActivity: [{ date, attempts, correct }]
}
```

---

## Prompt 5.2 - Create `/progress` Page UI

### Goal
Implement a Scandinavian-style progress dashboard page that consumes the `/api/progress/summary` endpoint and displays comprehensive statistics in a clean, modern UI.

### Files Created/Modified:

1. **`app/progress/page.tsx`** - Progress dashboard page:
   - Client component with state management
   - Fetches data from `/api/progress/summary` on mount
   - Loading, error, and loaded states
   - `ProgressSummary` type definition (mirrors API response)

### UI Sections:

**1. Header:**
- Title: "Theory practice overview"
- Subtitle explaining dashboard purpose
- Scandinavian design with light typography

**2. Overview Cards (2x2 Grid):**
- **Total Cards**: Shows total count with seen/unseen breakdown
- **Overall Accuracy**: Percentage with correct/attempts breakdown
- **Total Attempts**: Total attempts across all cards
- **Progress**: Percentage of cards reviewed (seen/total)

**3. SRS Status Section:**
- 3-column grid showing:
  - Due Now count
  - Due Today count
  - Overdue count
- Below: Average interval days and ease factor

**4. By Kind + Recent Activity (2-Column Grid):**
- **By Card Type**: List of card kinds with:
  - Kind name
  - Seen count / Total cards
  - Accuracy percentage
- **Recent Activity**: Vertical bar chart for last 14 days:
  - Bar height scales with attempt count (formula: `10 + day.attempts * 4`)
  - Green fill represents accuracy percentage
  - Date labels in MM-DD format
  - Empty state message if no activity

### State Management:
- `data`: Stores fetched `ProgressSummary` or null
- `loading`: Boolean tracking loading state
- `error`: String storing error messages
- `loadData()`: Async function to fetch and handle errors

### Loading & Error States:
- **Loading**: Shows "Loading progress…" text
- **Error**: Shows error message with "Retry" button that calls `loadData()`
- **Empty States**: Handles empty arrays for `byKind` and `recentActivity` with appropriate messages

### Design Features:
- Scandinavian design system with rounded cards (`rounded-2xl`)
- Subtle borders (`border-subtle`)
- Muted text colors for secondary information
- Responsive grid layouts (mobile-friendly)
- Light font weights for modern aesthetic
- Shadow effects for depth (`shadow-sm`)

### Helper Functions:
- `loadData()`: Fetches progress summary data and handles errors
- Inline calculations for accuracy percentages and bar heights

---

## Summary

Milestone 5 adds comprehensive progress tracking and visualization to the Harmonia application. The backend API endpoint provides detailed statistics about card progress, SRS scheduling, and activity patterns. The frontend dashboard presents this data in a clean, Scandinavian-inspired interface that makes it easy for users to understand their learning progress and upcoming review schedule.

