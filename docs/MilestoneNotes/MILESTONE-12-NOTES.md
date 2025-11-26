# Milestone 12 - Circle of Fifths Enhancement Notes

This document contains summaries from each prompt/task completed during Milestone 12 development.

---

## Prompt 10 – Implement `GET /api/circle/keys`

### Goal
Expose Circle-of-Fifths geometry and metadata via an API endpoint, using the existing theory circle module.

### Files Created/Modified:

1. **`app/api/circle/keys/route.ts`** - New API route:
   - Implements `GET /api/circle/keys` endpoint
   - Returns all 12 major keys with their circle positions, accidentals, relative minors, and neighbor relationships
   - Uses existing `getCircleNodes()` and `getNeighborsForKey()` from `lib/theory/circle.ts`
   - Maps circle geometry to API response format matching API_SPEC.md

### Implementation Details:

**Response Format:**
```typescript
{
  keys: [
    {
      id: "C_major",
      root: "C",
      type: "major",
      clockPosition: 0,
      accidentals: 0,
      accidentalType: "none" | "sharps" | "flats",
      relativeMinorId: "A_minor",
      neighbors: {
        clockwise: "G_major",
        counterclockwise: "F_major"
      }
    }
  ]
}
```

**Key Features:**
- Uses `getCircleNodes()` to get base geometry (index, root, relativeMinor)
- Implements accidentals mapping:
  - Position 0 (C): 0 accidentals, "none"
  - Positions 1-7: sharps (count = position)
  - Positions 8-11: flats (count = 12 - position)
- Converts neighbor relationships: `left` → `counterclockwise`, `right` → `clockwise`
- Formats IDs as `${root}_major` and `${relativeMinor}_minor`
- Error handling with try/catch and 500 status on failure

**Helper Function:**
- `getAccidentalsForPosition()` - Maps circle position to accidentals count and type

---

## Prompt 11 – Implement `GET /api/circle/summary` (Mastery per Key)

### Goal
Compute mastery per key for the circle based on existing circle flashcards and SRS data, exposing it via `/api/circle/summary`.

### Files Created/Modified:

1. **`app/api/circle/summary/route.ts`** - New API route:
   - Implements `GET /api/circle/summary` endpoint
   - Computes mastery metrics for each major key based on circle-related CardTemplates
   - Aggregates CardState and CardAttempt data to calculate mastery, avgRecallMs, lastReviewedAt, and dueCount

### Implementation Details:

**Response Format:**
```typescript
{
  keys: [
    {
      id: "C_major",
      mastery: 0.85,  // 0-1 score (accuracy * coverage)
      avgRecallMs: 900,
      lastReviewedAt: "2025-11-26T12:00:00.000Z" | null,
      dueCount: 2
    }
  ]
}
```

**Mastery Computation:**
- Finds all CardTemplates where `kind` starts with `"circle_"` and `meta.majorRoot` matches the key
- **Accuracy**: `totalCorrect / totalAttempts` across all CardStates
- **Coverage**: templates with `attemptsCount > 0` / total templates for that key
- **Mastery**: `accuracy * coverage` (0-1, rounded to 2 decimals)
- **avgRecallMs**: Average `responseMs` from all CardAttempts (null if none)
- **lastReviewedAt**: Latest `createdAt` from CardAttempts (null if none, ISO string)
- **dueCount**: CardStates with `attemptsCount > 0` AND `dueAt <= now`

**Key Features:**
- Efficient: Fetches all circle templates once, filters in memory
- Type-safe: Uses `hasMajorRoot()` type guard to safely parse JSON meta
- Edge cases handled:
  - Keys with no circle cards: all metrics default to 0/null
  - Keys with cards but no attempts: mastery = 0, coverage = 0
  - Safely skips templates without `majorRoot` in meta

**Helper Functions:**
- `hasMajorRoot()` - Type guard to check if meta has a majorRoot field
- `computeKeySummary()` - Computes mastery metrics for a single major key

---

## Prompt 12 – Update /circle Page to Show Mastery Overlay

### Goal
Enhance the `/circle` page to visualize per-key mastery from `/api/circle/summary` with a mastery overlay on the CircleOfFifths component and basic stats for the selected key.

### Files Created/Modified:

1. **`components/circle/CircleOfFifths.tsx`** - Enhanced component:
   - Added optional `masteryByRoot` prop: `Record<PitchClass, number>` (0-1 mastery per major root)
   - Applies mastery-based opacity to circle backgrounds: `0.15 + mastery * 0.7`
   - Visual priority: selection, highlight, and neighbor states override mastery styling
   - Backwards compatible: works without `masteryByRoot` (no special shading)

2. **`app/circle/page.tsx`** - Enhanced page:
   - Fetches `/api/circle/summary` on mount
   - Creates `masteryByRoot` map from summary data
   - Passes `masteryByRoot` to CircleOfFifths component
   - Displays mastery stats card for selected key

### Implementation Details:

**CircleOfFifths Enhancements:**
- Mastery-based opacity: `0.15 + mastery * 0.7` (even 0 has faint presence)
- Visual hierarchy:
  - Highlighted: emerald-500/70 opacity
  - Selected: full opacity (1.0)
  - Neighbor: muted/40 opacity
  - Unselected: mastery-based opacity

**Circle Page Enhancements:**
- Data fetching with loading and error states
- Mastery stats card displays:
  - Mastery: percentage (0-100%)
  - Avg recall: response time in ms or "—" if null
  - Last reviewed: formatted date or "Not reviewed yet"
  - Due cards: count of cards due for review
- Styling matches existing info panel cards (`bg-surface`, `border-subtle`, `rounded-2xl`)

**Key Features:**
- Visual feedback: mastery shown via opacity on the circle
- Stats display: detailed metrics for selected key
- Error handling: graceful fallback if API fails
- Performance: uses `useMemo` for derived data

---

## Prompt 13 – Optional: Key Detail Tooltip / Hover Overlay

### Goal
Add UX enhancement: when hovering a key on the circle, show a small tooltip with mastery and due count, without needing to select it.

### Files Created/Modified:

1. **`components/circle/CircleOfFifths.tsx`** - Enhanced component:
   - Added optional `statsByRoot` prop: `Record<PitchClass, { mastery: number; dueCount: number }>`
   - Implements hover state tracking (`hoveredRoot`, `hoveredPosition`)
   - Adds mouse event handlers (`onMouseEnter`, `onMouseLeave`) to circle and text elements
   - Renders tooltip overlay when hovering over a key

2. **`app/circle/page.tsx`** - Enhanced page:
   - Creates `statsByRoot` map from summary data (mastery + dueCount)
   - Passes `statsByRoot` to CircleOfFifths component

### Implementation Details:

**Tooltip Features:**
- Shows key name, mastery percentage, and due card count
- Positioned above hovered key with offset
- Styled with `bg-surface`, `border-subtle`, `rounded-lg`, `shadow-lg`
- Uses `pointerEvents: "none"` to prevent interaction issues
- Positioned using SVG coordinate conversion (viewBox to pixel coordinates)

**Hover Tracking:**
- Tracks hovered root and position state
- Mouse enter/leave handlers on both circle and text elements
- SVG-level `onMouseLeave` to handle mouse leaving the entire circle

**Key Features:**
- Hover tooltip: shows mastery and due count without clicking
- Positioning: tooltip appears above hovered key
- Backwards compatible: only renders if `statsByRoot` is provided
- Performance: uses `useMemo` for derived data

---

## Summary

Milestone 12 enhances the Circle of Fifths visualization with mastery tracking and interactive features:

1. **API Endpoints:**
   - `GET /api/circle/keys` - Exposes circle geometry and metadata
   - `GET /api/circle/summary` - Computes mastery metrics per key

2. **Visual Enhancements:**
   - Mastery-based opacity overlay on circle keys
   - Hover tooltips showing mastery and due count
   - Detailed mastery stats card for selected key

3. **User Experience:**
   - Visual feedback for mastery level at a glance
   - Quick access to stats via hover tooltips
   - Detailed information panel for selected key

All changes maintain backwards compatibility and follow existing design patterns and TypeScript best practices.

