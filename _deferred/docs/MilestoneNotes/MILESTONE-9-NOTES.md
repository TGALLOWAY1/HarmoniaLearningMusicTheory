# Milestone 9 - Curriculum System & Milestones API Notes

This document contains summaries from each prompt/task completed during Milestone 9 development.

---

## Prompt 1 - Add Milestone Model to Prisma Schema

### Goal
Add a `Milestone` model to the Prisma schema to support the curriculum system, allowing the app to track learning progress through structured milestones.

### Files Created/Modified:

1. **`prisma/schema.prisma`** - Added new `Milestone` model:
   - `id`: Auto-increment primary key
   - `key`: Unique string identifier (e.g., "FOUNDATION", "TRIADS")
   - `title`: Display title for the milestone
   - `description`: User-facing description
   - `order`: Integer for sorting milestones in sequence
   - `isUnlocked`: Boolean flag for unlock status (default: false)
   - `isCompleted`: Boolean flag for completion status (default: false)
   - `progress`: Float representing completion progress (0.0-1.0, default: 0.0)
   - Index on `order` field for efficient sorting

2. **`prisma/seed.ts`** - Updated seed script:
   - Added deletion of existing milestones for idempotency
   - Added 8 milestone records aligned with PRD milestones 1-5 plus placeholders for 6-8:
     - FOUNDATION (order: 1, unlocked by default)
     - NATURAL_MINOR (order: 2)
     - TRIADS (order: 3)
     - DIATONIC_TRIADS (order: 4)
     - CIRCLE_OF_FIFTHS (order: 5)
     - SEVENTH_CHORDS (order: 6)
     - MODES (order: 7)
     - ADVANCED (order: 8)
   - Used `upsert` pattern (SQLite doesn't support `skipDuplicates` in `createMany`)

3. **`prisma/migrations/20251126205853_add_milestones/migration.sql`** - Database migration:
   - Created `Milestone` table with all fields
   - Added unique index on `key`
   - Added index on `order` for sorting

### Implementation Details:

**Model Design:**
- Single-user app design: milestone state stored directly on model (no separate UserProgress model needed)
- Progress stored as float (0.0-1.0) for percentage calculations
- Order field ensures consistent curriculum sequence
- Unique key field allows stable references in code

**Seed Data:**
- First milestone (FOUNDATION) is unlocked by default
- All other milestones start locked
- Descriptions align with PRD milestone goals
- Placeholder milestones (6-8) prepared for future expansion

### Database Migration:
- Ran `npx prisma migrate dev --name add_milestones`
- Applied migration successfully
- Seeded database with 8 milestones

---

## Prompt 2 - Implement Milestones API

### Goal
Create REST API endpoints to support the curriculum UI, allowing the `/learn` page to fetch and update milestone data.

### Files Created:

1. **`app/api/milestones/route.ts`** - GET endpoint:
   - Returns all milestones sorted by `order` ascending
   - Response type: `{ milestones: MilestoneDto[] }`
   - Error handling with 500 status on failures
   - Uses Prisma client from `@/lib/db`

2. **`app/api/milestones/[id]/route.ts`** - PATCH endpoint:
   - Updates milestone fields: `isUnlocked`, `isCompleted`, `progress`
   - Validates:
     - ID must be valid integer (400 if invalid)
     - At least one field must be provided (400 if empty)
     - Progress must be between 0 and 1 (400 if out of range)
     - Milestone must exist (404 if not found)
   - Returns `{ success: true }` on success
   - Comprehensive error handling with appropriate status codes

### Implementation Details:

**GET /api/milestones:**
- Fetches all milestones using Prisma
- Orders by `order` field ascending
- Maps directly to `MilestoneDto` type
- Returns JSON response with `milestones` array

**PATCH /api/milestones/:id:**
- Parses ID from route params
- Validates ID is numeric
- Parses JSON request body
- Validates at least one update field provided
- Validates progress range (0-1) if provided
- Checks milestone exists before updating
- Updates only provided fields (partial update)
- Returns success response or appropriate error

**Type Definitions:**
```typescript
type MilestoneDto = {
  id: number;
  key: string;
  title: string;
  description: string;
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0–1
};
```

**Error Handling:**
- 400: Invalid request (bad ID, missing fields, invalid progress)
- 404: Milestone not found
- 500: Internal server error (with console.error for debugging)

### Testing:
- GET endpoint returns all 8 seeded milestones in order
- PATCH endpoint successfully updates milestone fields
- Validation works for all error cases:
  - Invalid ID format → 400
  - Non-existent milestone → 404
  - Progress out of range → 400
  - Empty request body → 400

---

## Prompt 3 - Upgrade `/learn` Page to Milestone UI

### Goal
Transform the `/learn` page from a static stub into a functional curriculum page that displays milestones fetched from the API.

### Files Modified:

1. **`app/learn/page.tsx`** - Complete rewrite:
   - Converted to client component (`"use client"`)
   - Added state management for data, loading, and error states
   - Implemented data fetching with `fetch` API
   - Created `MilestoneCard` component for individual milestone display
   - Added loading, error, and loaded UI states

### Implementation Details:

**State Management:**
- `data`: Array of milestones (null initially)
- `loading`: Boolean loading state
- `error`: Error message string (null if no error)
- `load()` function handles fetching and error handling

**Data Fetching:**
- Fetches from `/api/milestones` on component mount
- Defensive sorting by `order` field (even though API already sorts)
- Error handling with user-friendly messages
- Retry functionality on error

**UI States:**

1. **Loading State:**
   - Shows "Loading milestones…" message
   - Simple text indicator

2. **Error State:**
   - Displays error message in red
   - Shows "Retry" button to reload data
   - Styled with border and hover effects

3. **Loaded State:**
   - Responsive grid layout (2 columns on md+ screens)
   - Displays all milestones as cards
   - Each card shows full milestone information

**MilestoneCard Component:**
- **Title & Description**: Main content area
- **Status Chips**:
  - "Unlocked" / "Locked" chip with opacity for locked state
  - "Completed" badge (shown when `isCompleted` is true)
- **Progress Bar**:
  - Visual progress bar showing `progress * 100%`
  - Percentage text display
  - Smooth width transition animation

**Design System:**
- Uses semantic CSS variables from `globals.css`
- Matches existing design patterns from home page
- Responsive grid: `md:grid-cols-2`
- Consistent spacing and typography
- Hover effects and transitions

**TypeScript:**
- Type definitions match API response
- No unused variables
- Proper error typing
- Compiles without errors

### Testing:
- Page compiles successfully
- API endpoint accessible and returns data
- Dev server running and page accessible at `/learn`
- All 8 milestones display correctly
- Loading and error states work as expected

---

## Summary

Milestone 9 establishes the foundation for the curriculum system:

1. **Database Layer**: Milestone model with progress tracking
2. **API Layer**: REST endpoints for fetching and updating milestones
3. **UI Layer**: Functional curriculum page displaying milestones

The system is ready for future enhancements:
- Unlock logic based on progress/completion
- Interactive milestone cards (click to view details)
- Progress tracking integration with flashcard system
- Milestone-specific content pages

All code follows existing patterns, uses TypeScript throughout, and maintains the Scandinavian minimal design aesthetic.

