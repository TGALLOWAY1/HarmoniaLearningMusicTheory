# Milestone 7 - Circle of Fifths UI & Flashcards Notes

This document contains summaries from each prompt/task completed during Milestone 7 development.

---

## Prompt 7.1 - Circle Theory Helper Module (`lib/theory/circle.ts`)

### Goal
Create a small theory helper module for the Circle of Fifths that will be used by UI and flashcards.

### Files Created/Modified:

1. **`lib/theory/circle.ts`** - New Circle of Fifths theory module:
   - `CircleNode` type definition
   - `CIRCLE_MAJOR_ORDER` constant (12 major keys in fifths order)
   - `getRelativeMinor(root: PitchClass)` function
   - `getCircleNodes()` function
   - `getNeighborsForKey(root: PitchClass)` function

2. **`lib/theory/index.ts`** - Added export for circle module

3. **`lib/theory/devScratch.ts`** - Added sanity checks for circle functions

### Implementation Details:

**CircleNode Type:**
- `index`: 0–11 position on circle
- `root`: Major key root pitch class
- `label`: Display label (currently same as root)
- `relativeMinor`: Relative minor pitch class

**Circle Order:**
- Fixed geometric order: `C, G, D, A, E, B, F#, C#, G#, D#, A#, F`
- Sharps-focused representation (not handling enharmonic spellings yet)
- Clockwise = sharps, counterclockwise = flats

**Key Functions:**
- `getRelativeMinor()`: Returns 6th degree of major scale
- `getCircleNodes()`: Returns all 12 nodes with relative minors
- `getNeighborsForKey()`: Returns left (IV) and right (V) neighbors with circular wrapping

### Assumptions:
- Single sharps-focused representation (no enharmonic handling)
- Stable geometric order for consistent UI
- Relative minor = 6th degree of major scale (natural minor relationship)
- Neighbors interpreted as IV (left) and V (right) in Circle-of-Fifths geometry

---

## Prompt 7.2 - CircleOfFifths Component

### Goal
Create a reusable `CircleOfFifths` React component that renders the circle geometry and supports selection.

### Files Created/Modified:

1. **`components/circle/CircleOfFifths.tsx`** - New React component:
   - Client component with SVG-based circular layout
   - 12 major keys positioned in a circle (C at 12 o'clock)
   - Inner ring for relative minor keys (toggleable)
   - Visual states: selected, highlighted, neighbor (IV/V)
   - Click handlers for key selection

### Implementation Details:

**Props API:**
```typescript
{
  selectedRoot: PitchClass;
  onSelectRoot: (root: PitchClass) => void;
  showRelativeMinors?: boolean; // default true
  highlightedRoot?: PitchClass | null; // for flashcard "reveal"
}
```

**Visual Representation:**
- **Selected key**: Dark foreground fill with white text
- **Neighbors (IV/V)**: Muted fill at 40% opacity with foreground text
- **Other keys**: Surface-muted fill with muted text
- **Highlighted key**: Emerald fill at 70% opacity with white text (overrides other states)

**Layout:**
- Outer ring: Major keys at radius 70 from center
- Inner ring: Relative minor keys at radius 55 from center
- SVG viewBox: `0 0 200 200`
- Responsive sizing: `h-72 w-72` (288px)

**Styling:**
- 150ms color transitions
- 10px font for major keys, 8px for relative minors
- High-contrast colors aligned with minimalist theme (PRD B13)

---

## Prompt 7.3 - `/circle` Page

### Goal
Create a `/circle` page that combines CircleOfFifths, info panel, piano roll, and diatonic chord list.

### Files Created/Modified:

1. **`app/circle/page.tsx`** - New page component:
   - Two-column layout (stacked on mobile)
   - CircleOfFifths component with selection
   - Info panel showing selected key, relative minor, IV/V neighbors
   - Diatonic chord list with Roman numerals and chord symbols
   - Piano roll highlighting the selected key's major scale

### Implementation Details:

**State Management:**
- `selectedRoot` state (defaults to "C")
- All derived data computed via `useMemo` for performance

**Derived Data:**
- `neighbors`: IV/V keys via `getNeighborsForKey()`
- `relativeMinor`: Relative minor via `getRelativeMinor()`
- `majorScale`: Major scale via `getMajorScale()`
- `diatonicChords`: All 7 diatonic triads via `getDiatonicChords()`
- `mappedScale`: Scale mapped to MIDI notes in octave 3

**Layout:**
- Left column: Circle, info panel, diatonic chords
- Right column: Piano roll preview
- Responsive: Stacks on mobile, side-by-side on large screens

**Chord Symbol Formatting:**
- Helper function `formatChordSymbol()`:
  - Major: "C" (no suffix)
  - Minor: "Cm"
  - Diminished: "C°"
  - Augmented: "C+"

**Piano Roll Integration:**
- Highlights scale notes via `highlightLayers` prop
- Single octave (C3-B3) for clarity
- Uses `mapScaleToMidi()` to convert scale to MIDI notes

**TODOs:**
- Key signature text (sharps/flats count) - PRD A5.3 (marked with TODO comment)

---

## Prompt 7.4 - Circle Flashcards (Minimal)

### Goal
Introduce minimal Circle-of-Fifths card types and integrate them into the practice flow with no schema changes.

### Files Created/Modified:

1. **`app/api/cards/next/route.ts`** - Added `meta` field to response

2. **`prisma/seed.ts`** - Added 7 circle card examples:
   - 1 `circle_geometry` card
   - 3 `circle_relative_minor` cards
   - 3 `circle_neighbor_key` cards

3. **`components/flashcards/Flashcard.tsx`** - Enhanced to support circle cards:
   - Added `cardKind` and `cardMeta` props
   - Circle rendering logic for cards with `kind.startsWith("circle_")`
   - Pitch class extraction from option text
   - Hint display for relative minor questions (when `hintLevel === "light"`)
   - Answer highlighting on circle when revealed

4. **`app/practice/page.tsx`** - Updated to pass card metadata:
   - Added `kind` and `meta` to `LoadedCard` type
   - Passes `cardKind` and `cardMeta` to Flashcard component

### Implementation Details:

**New Card Kinds:**
1. **`circle_geometry`**: "Which key sits at 12 o'clock on the circle of fifths?"
   - Meta: `{ clockPosition: 12 }`

2. **`circle_relative_minor`**: "What is the relative minor of G major?"
   - Meta: `{ majorRoot: "G" }`
   - Shows hint when `hintLevel === "light"`: "Relative minor is the 6th degree of the major scale"

3. **`circle_neighbor_key`**: "Which of these is a neighbor (IV or V) of D major on the circle?"
   - Meta: `{ majorRoot: "D" }`

**Circle Card Visualization:**
- Side-by-side layout: Circle on left (50% width), 2x2 grid on right (50% width)
- Stacked vertically on mobile
- Container width: `max-w-4xl` (vs `max-w-xl` for regular cards)

**Circle Display Logic:**
- `circle_relative_minor`: Shows major root from `meta.majorRoot`
- `circle_neighbor_key`: Shows major root from `meta.majorRoot`
- `circle_geometry`: Defaults to showing "C"

**Answer Highlighting:**
- Extracts pitch class from correct option text (handles "E minor", "A", "C#" formats)
- Highlights correct key on circle when answer is revealed (emerald glow - PRD B12)
- Works for all three circle card types

**Pitch Class Extraction:**
- Helper function `extractPitchClass()`:
  - Removes "minor" or "major" suffix
  - Validates against known pitch classes
  - Returns `PitchClass | null`

**Integration:**
- No schema changes required
- All existing SRS functionality continues to work
- Circle is non-interactive in flashcard mode (`onSelectRoot` is no-op)

---

## Summary

This milestone implements the Circle of Fifths UI and flashcard integration as specified in PRD Milestone 5:

- **A5.1**: Key geometry (clock positions) - ✅ Implemented in circle.ts
- **A5.4**: Relative major/minor relationships - ✅ Implemented in circle.ts and UI
- **A5.5**: Neighbor keys (IV/V) - ✅ Implemented in circle.ts and UI
- **A5.6**: Circle interacts with piano roll - ✅ Implemented in /circle page
- **C1-C3**: Circular ring with 12 major keys, inner ring for relative minors, clockwise/counterclockwise direction - ✅ Implemented in CircleOfFifths component
- **C4**: When key is clicked: show signature info, diatonic chords, highlight on piano roll - ✅ Implemented in /circle page
- **C5**: IV and V neighbors highlighted visually - ✅ Implemented in CircleOfFifths component
- **C6**: Relative minor highlight toggle - ✅ Implemented via `showRelativeMinors` prop
- **B5-B7**: Circle flashcard question types - ✅ Implemented with 3 card kinds
- **D1-D3**: Circle interaction in flashcards - ✅ Implemented with visual highlighting
- **B12**: Circle wedge glows when answer is revealed - ✅ Implemented via `highlightedRoot` prop
- **B13**: Minimalist, high-contrast UX - ✅ Implemented with Scandinavian minimal theme

All components are strongly typed, use existing theory library functions, and integrate seamlessly with the existing flashcard and SRS system.

