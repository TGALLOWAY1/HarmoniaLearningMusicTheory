# Milestone 10 - Milestone-Based Card Filtering Notes

This document contains summaries from each prompt/task completed during Milestone 10 development.

---

## Prompt 1 - Attach CardTemplate to Milestone via milestoneKey

### Goal
Attach each `CardTemplate` to a curriculum milestone via a `milestoneKey` string field, enabling the `/practice` page and `/api/cards/next` to filter cards by milestone.

### Files Created/Modified:

1. **`prisma/schema.prisma`** - Added `milestoneKey` field to `CardTemplate` model:
   - `milestoneKey String?` - Optional string field (e.g., "FOUNDATION", "TRIADS", "CIRCLE_OF_FIFTHS")
   - Field is nullable to maintain compatibility with existing rows
   - No foreign key constraint (simple string reference to Milestone.key)

2. **`prisma/migrations/20251126213432_add_milestone_key_to_cardtemplate/migration.sql`** - Database migration:
   - Added `milestoneKey` column as nullable TEXT field
   - Migration applied successfully without data loss

3. **`prisma/seed.ts`** - Updated seed script to assign `milestoneKey` values:
   - **TRIADS**: `c-major-chord-notes`, `which-chord-c-e-g`
   - **CIRCLE_OF_FIFTHS**: 
     - `key-signature-one-sharp`
     - `c-at-12-oclock` (circle geometry)
     - `relative-minor-of-g`, `relative-minor-of-c`, `relative-minor-of-d` (relative minor cards)
     - `neighbor-of-d-major`, `neighbor-of-c-major`, `neighbor-of-g-major` (neighbor key cards)
   - All seeded cards now have appropriate milestone assignments

### Implementation Details:

**Schema Design:**
- Simple nullable string field (no foreign key constraint)
- Matches existing Milestone.key values from seed data
- Allows cards to exist without milestone assignment (for flexibility)
- Single-user app design, so no need for complex relationships

**Seed Data Mapping:**
- Chord-related cards → TRIADS milestone
- Circle of fifths cards → CIRCLE_OF_FIFTHS milestone
- Future cards can be assigned to other milestones (FOUNDATION, NATURAL_MINOR, DIATONIC_TRIADS, etc.)

**Migration Strategy:**
- Field is nullable, so existing rows remain valid
- No data migration needed (existing cards can be updated later)
- Migration applied cleanly with no errors

---

## Prompt 2 - Add milestoneKey Filter to `/api/cards/next`

### Goal
Extend `GET /api/cards/next` to optionally filter by `milestoneKey` query parameter, enabling milestone-specific practice sessions.

### Files Modified:

1. **`app/api/cards/next/route.ts`** - Added milestoneKey filtering:
   - Updated function signature to accept `Request` parameter
   - Parses `milestoneKey` from URL search params
   - Conditionally filters CardTemplate query when `milestoneKey` is provided
   - Returns 404 with clear error message if milestoneKey provided but no cards found
   - Maintains existing behavior when `milestoneKey` is not provided

### Implementation Details:

**Query Parameter Parsing:**
```typescript
const url = new URL(request.url);
const milestoneKey = url.searchParams.get("milestoneKey");
```

**Conditional Filtering:**
- If `milestoneKey` is provided: filters templates with `where: { milestoneKey }`
- If not provided: fetches all templates (unchanged behavior)
- Uses Prisma's conditional spread syntax for clean implementation

**Error Handling:**
- 404 response when `milestoneKey` provided but no matching cards
- Error message: "No cards found for this milestoneKey."
- All other error handling remains unchanged

**Backward Compatibility:**
- Existing calls to `/api/cards/next` work exactly as before
- New filtering is opt-in via query parameter
- No breaking changes to response format

### API Behavior:
- `/api/cards/next` → Returns next card from all cards (unchanged)
- `/api/cards/next?milestoneKey=TRIADS` → Returns next card only from TRIADS milestone
- `/api/cards/next?milestoneKey=INVALID` → Returns 404 with error message

---

## Prompt 3 - Filter Practice Page by milestoneKey

### Goal
Update the `/practice` page to accept a `?milestone=` query parameter and pass it through to `/api/cards/next` as `milestoneKey`, enabling milestone-specific practice sessions.

### Files Modified:

1. **`app/practice/page.tsx`** - Added milestone query parameter support:
   - Imported `useSearchParams` from `next/navigation`
   - Reads `milestone` query parameter from URL
   - Constructs API URL dynamically with `milestoneKey` when present
   - Updated `useEffect` to re-fetch when `milestone` parameter changes
   - Added specific error handling for 404 milestoneKey errors

### Implementation Details:

**Query Parameter Reading:**
```typescript
const searchParams = useSearchParams();
const milestone = searchParams.get("milestone");
```

**Dynamic API URL Construction:**
- Base URL: `/api/cards/next`
- With milestone: `/api/cards/next?milestoneKey=${encodeURIComponent(milestone)}`
- Without milestone: `/api/cards/next` (unchanged)

**Error Handling:**
- Detects 404 responses from API
- Checks if error message includes "milestoneKey"
- Shows user-friendly message: "No cards found for this milestone yet."
- Maintains existing error handling for other cases

**Reactive Updates:**
- `useEffect` dependency includes `milestone`
- Automatically re-fetches cards when milestone parameter changes
- Ensures practice session updates when navigating between milestones

### User Experience:
- `/practice` → Practices all cards (unchanged behavior)
- `/practice?milestone=TRIADS` → Practices only TRIADS milestone cards
- `/practice?milestone=INVALID` → Shows "No cards found for this milestone yet."
- Seamless navigation between milestone-specific practice sessions

---

## Prompt 4 - Add Practice Link to MilestoneCard on `/learn` Page

### Goal
Add a "Practice this" action to each milestone card on the `/learn` page that navigates to `/practice?milestone=<milestone.key>`, creating a direct path from curriculum milestones to milestone-specific practice.

### Files Modified:

1. **`app/learn/page.tsx`** - Added practice link to MilestoneCard:
   - Imported `Link` from `next/link`
   - Added "Practice this" link/button at bottom of each milestone card
   - Link only enabled when `milestone.isUnlocked` is true
   - Disabled "Locked" button shown for locked milestones
   - URL properly encodes milestone key

### Implementation Details:

**Link Implementation:**
- Uses Next.js `Link` component for client-side navigation
- URL format: `/practice?milestone=${encodeURIComponent(milestone.key)}`
- Properly encodes milestone keys for URL safety

**Conditional Rendering:**
- **Unlocked milestones**: Shows clickable "Practice this" link
  - Styled with border, rounded corners, hover effects
  - Navigates to milestone-specific practice session
- **Locked milestones**: Shows disabled "Locked" button
  - Styled with reduced opacity and cursor-not-allowed
  - Prevents navigation to locked milestone practice

**Design Integration:**
- Matches existing card styling and spacing
- Uses semantic design tokens (`border-subtle`, `text-foreground`, etc.)
- Consistent with overall Scandinavian minimal design
- Positioned at bottom right of each card

### User Flow:
1. User views `/learn` page with milestone cards
2. For unlocked milestones, sees "Practice this" link
3. Clicking link navigates to `/practice?milestone=<key>`
4. Practice page loads cards filtered to that milestone
5. User can practice milestone-specific content

---

## Summary

Milestone 10 establishes milestone-based card filtering throughout the application:

1. **Database Layer**: Added `milestoneKey` field to `CardTemplate` model with migration
2. **Seed Data**: Assigned milestone keys to all seeded cards
3. **API Layer**: Extended `/api/cards/next` to filter by `milestoneKey`
4. **Practice Page**: Added milestone query parameter support
5. **Learn Page**: Added "Practice this" links to milestone cards

The system now enables:
- Milestone-specific practice sessions
- Direct navigation from curriculum to practice
- Filtered card selection based on learning progress
- Clear separation of content by curriculum milestone

All changes maintain backward compatibility, use proper TypeScript types, and follow existing design patterns. The implementation is ready for future enhancements like automatic milestone unlocking based on practice progress.

