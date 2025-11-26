# Milestone 1 - Piano Roll Implementation Notes

This document contains summaries from each prompt/task completed during Milestone 1 development.

---

## Prompt 0.1 - Initialize Next.js App

### Files Created/Modified:

1. **`package.json`** - Next.js 14, React 18, TypeScript, TailwindCSS, and related dev dependencies
2. **`next.config.js`** - Basic Next.js configuration
3. **`tsconfig.json`** - TypeScript configuration with App Router support and path aliases
4. **`tailwind.config.ts`** - TailwindCSS configuration with `darkMode: "class"` enabled
5. **`postcss.config.js`** - PostCSS configuration for TailwindCSS
6. **`app/globals.css`** - Global styles with Tailwind directives and dark theme (`bg-slate-950` / `text-slate-100`)
7. **`app/layout.tsx`** - Root layout with:
   - Dark mode class on `<html>`
   - Dark background (`bg-slate-950`) and light text (`text-slate-100`)
   - Centered max-width container (`max-w-7xl mx-auto`)
8. **`app/page.tsx`** - Home page displaying "Harmonia – Music Theory Learning App"
9. **`.gitignore`** - Standard Next.js gitignore
10. **`.eslintrc.json`** - ESLint configuration for Next.js

### Configuration Highlights:

- **Dark mode**: `darkMode: "class"` in Tailwind config
- **Dark theme**: `bg-slate-950` background with `text-slate-100` text
- **App Router**: Using the `app/` directory structure
- **TypeScript**: Full TypeScript support enabled
- **Layout**: Centered container with responsive padding

---

## Prompt 0.2 - Create Folder Structure

### Folders Created:

1. **`app/api/`** - Next.js App Router API routes
2. **`lib/`** - Shared utilities
3. **`lib/theory/`** - Music theory functions
4. **`lib/state/`** - Global state stores (Zustand/Jotai)
5. **`components/`** - Shared UI components
6. **`components/piano-roll/`** - Piano roll visualization
7. **`components/flashcards/`** - Flashcard components
8. **`components/circle/`** - Circle of Fifths components

### Placeholder Files Created:

1. **`lib/theory/index.ts`** - Contains TODO-stubbed functions:
   - `getMajorScale(root: string)`
   - `getNaturalMinorScale(root: string)`
   - `getTriad(root: string, quality: "maj" | "min")`
   - `getDiatonicChords(keyRoot: string, type: "major" | "natural_minor")`

2. **`lib/state/README.md`** - Notes that this directory will hold global state stores

3. **`components/piano-roll/README.md`** - Describes the piano-roll visualization component

4. **`docs/README.md`** - Explains the documentation structure:
   - `PRD.md` - Product Requirements Document
   - `API_SPEC.md` - API specification
   - `SCHEMA.md` - Database/schema definition
   - `CONTEXT.md` - High-level project context

### Path Aliases:

The `tsconfig.json` already has `"@/*": ["./*"]` configured, so you can import modules like:
- `import { getMajorScale } from "@/lib/theory"`
- `import PianoRoll from "@/components/piano-roll/PianoRoll"`

---

## Prompt 0.3 - Add Global State Store

### Files Created:

1. **`lib/state/settingsStore.ts`** - Settings store with Zustand hook
2. **`lib/state/theorySelectionStore.ts`** - Theory selection store with Zustand hook

### Store Shapes:

#### `useSettingsStore` (Settings Store)

**State:**
- `freeExploreMode: boolean` (default: `false`)
- `enableAdvancedTopics: boolean` (default: `false`)
- `hintLevel: "none" | "light"` (default: `"light"`)

**Actions:**
- `setFreeExploreMode(value: boolean)`
- `setEnableAdvancedTopics(value: boolean)`
- `setHintLevel(level: "none" | "light")`

#### `useTheorySelectionStore` (Theory Selection Store)

**State:**
- `selectedKey: string | null` (e.g., `"C_major"`)
- `selectedScaleType: "major" | "natural_minor" | "dorian" | "mixolydian" | "phrygian" | null`
- `selectedChordSymbol: string | null`

**Actions:**
- `setSelectedKey(key: string | null)`
- `setSelectedScaleType(scaleType: ScaleType | null)`
- `setSelectedChordSymbol(chordSymbol: string | null)`

### Additional Changes:

- **`app/page.tsx`** - Added a debug component that:
  - Displays the current `freeExploreMode` value
  - Includes a toggle button to test Zustand state updates
  - Uses `"use client"` directive for client-side interactivity

---

## Prompt 1.1 - Build Basic Piano Roll Layout

### Final PianoRollProps

```typescript
export type PianoRollProps = {
  lowestMidiNote?: number;   // default: 48 (C3)
  highestMidiNote?: number;  // default: 72 (C5)
  highlightedNotes?: number[]; // MIDI note numbers to highlight
  className?: string;
};
```

### Visual Decisions

**Orientation:**
- Vertical layout: keys stacked top to bottom
- Highest notes (C5) at the top, lowest (C3) at the bottom
- Notes are reversed so higher pitches appear first

**Colors:**
- Background: `bg-slate-900` with `border-slate-700`
- White keys: `bg-slate-800`, height `h-12`
- Black keys: `bg-slate-950` with borders, height `h-8`
- Highlighted notes: `ring-teal-400` with `bg-teal-900/20` and `bg-teal-500/30` on the key area
- Text: `text-slate-200` for white keys, `text-slate-400` for black keys, `text-teal-300` when highlighted

**Layout:**
- Fixed height: `600px` with vertical scrolling
- Left label: `w-20` showing full note name (e.g., "C4", "C#4")
- Key area: flex-1 for the main visualization space
- Responsive width: `w-full` with container constraints

### How highlightedNotes is Handled

1. **Set conversion**: `highlightedNotes` array is converted to a `Set` for O(1) lookup
2. **Visual indicators**:
   - Ring border: `ring-2 ring-teal-400 ring-opacity-75`
   - Background tint: `bg-teal-900/20` on the row, `bg-teal-500/30` on the key area
   - Text highlight: `text-teal-300 font-semibold` for the label
3. **Per-note check**: each MIDI note row checks `highlightedSet.has(midiNote)` to determine highlighting

### Helper Functions Implemented

- `generateMidiNotes()` - Creates array of MIDI notes in range
- `getPitchClassName()` - Returns pitch class (C, C#, D, etc.)
- `getOctave()` - Calculates octave number from MIDI note
- `isBlackKey()` - Determines if note is a black key
- `getFullNoteName()` - Returns full name like "C4" or "C#4"

### Example Usage

The home page now displays a C major chord example:
- Notes highlighted: C3, E3, G3, C4, E4, G4 (MIDI: 48, 52, 55, 60, 64, 67)
- Shows the component working with real chord data

---

## Prompt 1.2 - Implement Note → Coordinate / Pitch Class Mapping

### Final Signatures Implemented in `midiUtils.ts`

All functions are exported with TypeScript types:

```typescript
// Type definitions
export type PitchClass = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";
export type NoteName = `${PitchClass}${number}`; // e.g. "C3", "C#4"

// Core functions
export function midiToPitchClass(midi: number): PitchClass;
export function midiToOctave(midi: number): number;
export function midiToNoteName(midi: number): NoteName;
export function isBlackKey(midi: number): boolean;
export function isWhiteKey(midi: number): boolean;
export function generateMidiRange(lowest: number, highest: number): number[];
```

**Implementation details:**
- MIDI 60 = C4 (middle C)
- Octave formula: `Math.floor(midi / 12) - 1`
- Pitch class: `midi % 12` mapped to pitch class array
- Black keys: indices 1, 3, 6, 8, 10 (C#, D#, F#, G#, A#)

### Changes Made to `PianoRoll.tsx`

**Removed:**
- Inline `PITCH_CLASSES` array
- Inline `BLACK_KEY_INDICES` Set
- Local helper functions: `generateMidiNotes()`, `getPitchClassName()`, `getOctave()`, `isBlackKey()`, `getFullNoteName()`

**Added:**
- Imports from `@/lib/theory/midiUtils`:
  - `midiToNoteName` (replaces `getFullNoteName`)
  - `isBlackKey` (reused)
  - `generateMidiRange` (replaces `generateMidiNotes`)

**Result:**
- Component reduced from ~160 lines to ~100 lines
- All MIDI logic centralized in reusable utilities
- Type-safe with exported types
- Easier to test and maintain

### Additional Files Created

1. **`lib/theory/midiUtils.ts`** - Core MIDI utility functions with JSDoc
2. **`lib/theory/__tests__/midiUtils.test.ts`** - Test file template with TODO test cases
3. **`lib/theory/index.ts`** - Updated to export all MIDI utilities for easy importing

---

## Prompt 1.3 - Add highlightNotes API & Refine Highlighting

### Final PianoRollProps Type

```typescript
export type HighlightLayer = {
  id: string;
  label?: string;
  midiNotes: number[];
};

export type PianoRollProps = {
  lowestMidiNote?: number;   // default: 48 (C3)
  highestMidiNote?: number;  // default: 72 (C5)
  highlightLayers?: HighlightLayer[]; // replaces highlightedNotes
  className?: string;
};
```

**Changes:**
- Removed `highlightedNotes?: number[]`
- Added `highlightLayers?: HighlightLayer[]` with `id`, optional `label`, and `midiNotes`

### How the Highlighting Logic Works

1. **Layer aggregation**: All MIDI notes from all layers are collected into a `Set` for O(1) lookup:
   ```typescript
   const highlightedSet = useMemo(() => {
     const allHighlighted = new Set<number>();
     highlightLayers?.forEach((layer) => {
       layer.midiNotes.forEach((note) => allHighlighted.add(note));
     });
     return allHighlighted;
   }, [highlightLayers]);
   ```

2. **Highlight check**: For each MIDI note row, check if it exists in the set:
   ```typescript
   const isHighlighted = highlightedSet.has(midiNote);
   ```

3. **Visual styling when highlighted**:
   - Border: `border-teal-400`
   - Background: `bg-slate-700` (darker than normal keys)
   - Shadow: `shadow-[0_0_8px_rgba(34,211,238,0.3)]` (teal glow)
   - Key area: `bg-teal-500/40` with `border-teal-400/50`
   - Label: `text-teal-300 font-semibold`

4. **Graceful handling**: If `highlightLayers` is undefined or empty, no notes are highlighted (no runtime errors).

### Demo Component Added

**`components/piano-roll/PianoRollDemo.tsx`** includes:

1. **Two highlight layers**:
   - C Major Scale: 14 notes (C3-B3 and C4-B4)
   - C Major Chord: 6 notes (C, E, G across two octaves)

2. **Visual legend**: Shows each layer with:
   - Color indicator (teal square)
   - Layer label
   - Note count

3. **Integration**: The home page (`app/page.tsx`) now uses `PianoRollDemo` instead of the old single-chord example.

**Example usage:**
```typescript
const highlightLayers: HighlightLayer[] = [
  {
    id: "scale",
    label: "C Major Scale",
    midiNotes: [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71],
  },
  {
    id: "chord",
    label: "C Major Chord",
    midiNotes: [48, 52, 55, 60, 64, 67],
  },
];
```

---

## Prompt 1.4 - Add Basic Note-On/Note-Off Animations

### Classes/Styles Added

#### 1. Transition Classes on Key Rows:
- `transition-colors duration-200 ease-in-out` - Smooth color transitions for background and border
- `transition-shadow duration-200 ease-in-out` - Smooth shadow transitions when highlighting changes

#### 2. Transition Classes on Label:
- `transition-colors duration-200` - Smooth text color transition when highlighted

#### 3. Transition Classes on Key Area:
- `transition-colors duration-200 ease-in-out` - Smooth background color transition for the key visualization

#### 4. CSS Animation in `globals.css`:
```css
@keyframes note-on-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.95; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-note-on {
  animation: note-on-pulse 0.3s ease-out;
}
```

#### 5. Enhanced Highlight Styles:
- Base (not highlighted): `border-slate-800`
- Highlighted: `border-teal-400 bg-slate-700 shadow-md shadow-teal-500/30 animate-note-on`

### How the "Note-On" Effect is Achieved

1. **When `highlightLayers` changes and a note becomes highlighted**:
   - The `isHighlighted` check becomes `true`
   - The highlighted classes are applied: `border-teal-400 bg-slate-700 shadow-md shadow-teal-500/30 animate-note-on`
   - The `animate-note-on` class triggers the pulse animation

2. **The pulse animation (`note-on-pulse`)**:
   - Runs once for 0.3 seconds
   - Scales the element to 1.02x at the midpoint
   - Slightly reduces opacity, then returns to normal
   - Provides a brief visual emphasis

3. **Smooth transitions**:
   - `transition-colors` handles background and border color changes
   - `transition-shadow` handles shadow changes
   - Both use 200ms duration with `ease-in-out` timing

4. **Performance considerations**:
   - Specific transition properties (`transition-colors`, `transition-shadow`) instead of `transition-all` for better performance
   - Animation is one-time (0.3s), not looping
   - Uses CSS transforms and opacity (GPU-accelerated)
   - Memoized `highlightedSet` prevents unnecessary recalculations

---

## Prompt 1.5 - Add Octave Selector UI

### How the Octave Range Maps to MIDI Notes

**Formula:** `MIDI note for C of octave N = (N + 1) * 12`

**Examples:**
- **Octave 3 (C3)**: `(3 + 1) * 12 = 48` → `lowestMidiNote = 48`
- **Octave 4 (C4)**: `(4 + 1) * 12 = 60` → `lowestMidiNote = 60`
- **Octave 5 (C5)**: `(5 + 1) * 12 = 72` → `lowestMidiNote = 72`

**Range calculation:**
- `lowestMidiNote = (baseOctave + 1) * 12` (C of the base octave)
- `highestMidiNote = lowestMidiNote + 24` (2 octaves = 24 semitones)

**Example ranges:**
- **Octave 3**: MIDI 48 (C3) to MIDI 72 (C5)
- **Octave 4**: MIDI 60 (C4) to MIDI 84 (C6)
- **Octave 5**: MIDI 72 (C5) to MIDI 96 (C7)

### How the Selector Interacts with the Piano Roll

1. **State management**:
   - `PianoRollDemo` uses `useState` to track `baseOctave` (default: 3)
   - `OctaveSelector` receives `value={baseOctave}` and `onChange={setBaseOctave}`

2. **MIDI note calculation**:
   - When `baseOctave` changes, `lowestMidiNote` and `highestMidiNote` are recalculated via `useMemo`
   - These values are passed to `<PianoRoll>` as props

3. **Dynamic highlight layers**:
   - C Major Scale and C Major Chord notes are recalculated based on the current `lowestMidiNote`
   - Scale intervals: `[0, 2, 4, 5, 7, 9, 11]` (C, D, E, F, G, A, B)
   - Chord intervals: `[0, 4, 7]` (C, E, G)
   - Notes are calculated for both the base octave and the next octave (2-octave span)

4. **User interaction**:
   - Clicking "+" increments `baseOctave` (max 7)
   - Clicking "−" decrements `baseOctave` (min 1)
   - Buttons are disabled at min/max boundaries
   - The piano roll updates to show the new octave range with highlights recalculated

5. **Visual feedback**:
   - Heading updates: "Piano Roll Demo – Octave {baseOctave}"
   - The selector shows the current octave value
   - Transitions animate when the range changes

### Component Features

**OctaveSelector:**
- Label: "Octave"
- Decrement button ("−") with disabled state at minimum
- Current value display (monospace, larger font)
- Increment button ("+") with disabled state at maximum
- Hover/active states with transitions
- Accessibility: `aria-label` attributes

**Integration:**
- Positioned in the header next to the title
- Responsive layout with flex-wrap for smaller screens
- Styling matches the dark Harmonia theme

---

## Summary

Milestone 1 successfully implemented a fully functional piano roll component with:
- ✅ Basic vertical piano roll layout with white/black key distinction
- ✅ MIDI note utilities for pitch class, octave, and key type calculations
- ✅ Highlight layer system supporting multiple simultaneous highlights
- ✅ Smooth note-on/note-off animations
- ✅ Octave selector for dynamic range adjustment
- ✅ Type-safe TypeScript implementation throughout
- ✅ Dark theme styling consistent with Harmonia design
- ✅ Reusable components ready for integration with theory engine

The piano roll is now ready to be integrated with the music theory engine for scales, chords, and other theory concepts.

