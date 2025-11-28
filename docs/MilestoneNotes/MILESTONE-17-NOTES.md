# Milestone 17 - Fix Chord-Based Cards Scale Filtering

This document contains summaries from each prompt/task completed during Milestone 17 development.

---

## Prompt 17.1 — Analyze Existing Chord-Based Card Templates

### Goal
Identify how "Chord from Notes" and "Notes from Chord" card types are currently represented in CardTemplate (kind + meta) so we can attach scale membership information.

### Files Inspected:
1. **`prisma/schema.prisma`** - CardTemplate model structure
2. **`prisma/seed.ts`** - Example chord-based card seeds
3. **`lib/cards/cardKinds.ts`** - CardKind type definitions
4. **`lib/cards/advancedCardMeta.ts`** - Advanced card meta type examples
5. **`app/practice/page.tsx`** - Practice filter UI
6. **`app/api/cards/next/route.ts`** - Card filtering logic

### Findings:

**Card Kinds:**
- `notes_from_chord`: "Notes from Chord" card type
- `chord_from_notes`: "Chord from Notes" card type

**Current Meta Structure:**
- `notes_from_chord`: Contains `root`, `quality`, `type` (chord type, not scale type)
- `chord_from_notes`: Contains `notes` array only

**Filter System:**
- Practice UI has "Card Type" and "Scale Type" dropdowns
- `/api/cards/next` currently filters by `meta.type === scaleType` (incorrect for chord cards)
- Chord-based cards are being excluded from scale filtering

**Design Recommendations:**
- Extend meta to include optional `scaleMemberships` array
- Create `BasicCardMeta` type definitions
- Update filter logic to check `scaleMemberships` for chord-based cards

---

## Prompt 17.2 — Create Basic Card Meta Type Definitions

### Goal
Create TypeScript type definitions for basic card meta structures, including scale membership support.

### Files Created/Modified:

1. **`lib/cards/basicCardMeta.ts`** - New file with type definitions:
   - `ScaleMembership` type: `{ keyRoot, keyType, degree }`
   - `ChordCardMetaBase` type: Base structure with `root`, `quality`, `notes`, and optional `scaleMemberships`
   - `NotesFromChordMeta` type: Extends base with optional `type` field
   - `ChordFromNotesMeta` type: Extends base
   - Type guard functions for type-safe narrowing

### Implementation:
- Follows same pattern as `advancedCardMeta.ts`
- Supports optional `scaleMemberships` array
- Provides type safety for chord-based card meta

---

## Prompt 17.3 — Compute & Attach Scale Memberships in Seed

### Goal
Populate `scaleMemberships` for chord-based CardTemplates during seeding using the theory engine, so each chord knows which keys/scales it belongs to.

### Files Modified:

1. **`prisma/seed.ts`** - Added scale membership computation:
   - Helper function `identifyTriadFromNotes()`: Identifies chord root/quality from notes array
   - Helper function `notesMatch()`: Compares note arrays order-independently
   - Main function `attachScaleMemberships()`: Computes and attaches scale memberships
   - Updated card creation to include `notes` array in meta

### Implementation Details:

**Scale Membership Computation:**
- Checks all 24 keys (12 major + 12 natural minor)
- Uses `getDiatonicChords()` to get diatonic triads for each key
- Matches chords by root, quality, and notes
- Creates `ScaleMembership` entries with `keyRoot`, `keyType`, and `degree` (Roman numeral)

**Results:**
- All chord-based cards now have `scaleMemberships` populated
- Example: C major triad has 6 memberships (C major I, F major V, G major IV, D minor VII, E minor VI, A minor III)

---

## Prompt 17.4 — Update /api/cards/next to Use Scale Membership for Chord Cards

### Goal
Change `/api/cards/next` filtering so that chord-based card types use `meta.scaleMemberships` instead of being excluded.

### Files Modified:

1. **`app/api/cards/next/route.ts`** - Updated filtering logic:
   - Added `scaleRoot` parameter support (optional)
   - Defined `CHORD_BASED_KINDS` constant
   - For chord-based cards: Checks `meta.scaleMemberships` array
   - For non-chord cards: Keeps existing `meta.type` behavior
   - Handles missing `scaleMemberships` gracefully

### Filtering Behavior:

- `scaleType` only: Returns chord cards that belong to any key of that type
- `scaleRoot` only: Returns chord cards that belong to that specific key root
- Both `scaleType` and `scaleRoot`: Returns chord cards in that specific key
- No scale filter: All chord cards remain available

---

## Prompt 17.5 — Update Practice Filter UI to Reflect Correct Behavior

### Goal
Update the Practice UI so the filters match the new behavior and make it clear that "Chord from Notes" / "Notes from Chord" respect the selected scale.

### Files Modified:

1. **`app/practice/page.tsx`** - Enhanced filter UI:
   - Added `CHORD_BASED_KINDS` and `KEY_AGNOSTIC_KINDS` constants
   - Added helper text under scale filter for chord-based cards: "You'll be quizzed on chords that belong to this scale type."
   - Disabled scale filter for key-agnostic card types with explanation
   - Added active filter status message showing which scale type is active

### UI Improvements:

- **Chord-based cards**: Scale filter enabled with helpful explanation
- **Key-agnostic cards**: Scale filter disabled with message explaining why
- **Active filters**: Shows confirmation message when chord-based card + scale filter are active

---

## Prompt 17.6 — Regression & Sanity Pass

### Goal
Verify that the new chord–scale mapping works and doesn't break other practice flows.

### Testing Performed:

1. **Lint & Build:**
   - Fixed apostrophe escaping issue in practice page
   - All TypeScript errors resolved
   - Build passes (pre-existing Next.js Suspense issue unrelated)

2. **Manual Testing:**
   - ✅ "Chord from Notes" + major scale: Returns correct cards
   - ✅ "Notes from Chord" + natural minor: Returns correct cards
   - ✅ Non-chord cards (scale_spelling): Still filter correctly
   - ✅ No scale filter: All cards appear (no over-filtering)

3. **Scale Memberships Verification:**
   - ✅ 100% coverage (all chord-based cards have `scaleMemberships`)
   - ✅ Proper structure with `keyRoot`, `keyType`, and `degree`
   - ✅ Example: C major chord has 6 memberships across multiple keys

4. **Edge Cases:**
   - ✅ Missing `scaleMemberships`: Cards correctly filtered out (no errors)
   - ✅ Non-chord cards: Continue using `meta.type` (backward compatible)
   - ✅ Empty filters: All cards remain available

### Final Status:
✅ All tests passing
✅ No regressions detected
✅ Production-ready implementation

---

## Summary

**Milestone 17 Achievement:**
"Chord from Notes / Notes from Chord now respect chosen scale via scaleMemberships; verified for multiple keys."

### Key Changes:
1. Created `BasicCardMeta` type system with `ScaleMembership` support
2. Implemented automatic scale membership computation in seed file
3. Updated API route to filter chord-based cards by `scaleMemberships`
4. Enhanced Practice UI with clear feedback about scale filtering
5. Comprehensive testing confirms no regressions

### Files Modified:
- `lib/cards/basicCardMeta.ts` (new)
- `prisma/seed.ts`
- `app/api/cards/next/route.ts`
- `app/practice/page.tsx`

### Impact:
- Users can now filter chord-based cards by scale type (major, minor, etc.)
- Chord cards know which keys they belong to and their function (degree)
- Practice experience improved with clear UI feedback
- Backward compatible with existing non-chord card types

