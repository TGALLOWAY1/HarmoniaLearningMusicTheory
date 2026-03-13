# Advanced Generate Audit

## Existing Generator (Default Path)

### Core progression generator API
- `lib/theory/harmonyEngine.ts`
- Public function:

```ts
export function generateProgression(params: {
  rootKey: string;
  mode: Mode;
  depth: Depth;
  numChords: number;
}): GeneratedChord[]
```

- Output shape (`GeneratedChord`):

```ts
type GeneratedChord = {
  degree: Degree;
  quality: ChordQuality;
}
```

### Current UI entry point for "Generate"
- `components/progression/ActionButtons.tsx`
  - `Generate` button calls `useProgressionStore().generateNew`
- `lib/state/progressionStore.ts`
  - `generateNew()` calls `generateProgression(...)` from `harmonyEngine`
  - Maps each generated degree/quality into UI chords (`symbol`, `notes`, `romanNumeral`, etc.)

### Related generation paths in repo
- `app/api/theory/progression/route.ts` uses `generateRandomProgression(...)` from `lib/progressionRandom.ts`
  - This API route is separate from the `/progression` page's store-based generation flow.

## How Chords / Progressions Are Represented

### Store/UI progression types
- `lib/theory/progressionTypes.ts`

```ts
interface Chord {
  symbol: string;
  notes: string[];
  romanNumeral: string;
  root?: PitchClass;
  quality?: ChordQuality;
  isLocked?: boolean;
}

interface Progression {
  id: string;
  chords: Chord[];
  timestamp: number;
}
```

### Theory-level note/pitch types
- `lib/theory/midiUtils.ts`
  - `PitchClass`: sharps-only canonical set (`C`, `C#`, ..., `A#`, `B`)
  - MIDI helpers for pitch class and note-name conversion (`midiToNoteName`, etc.)

### Harmonic generation primitive types
- `lib/theory/harmonyEngine.ts`
  - `Mode`, `Depth`, `Degree`, `ChordQuality`

## Current Trigger Flow Summary
1. User clicks `Generate` in `components/progression/ActionButtons.tsx`
2. `useProgressionStore.generateNew()` runs
3. Store calls `generateProgression({ rootKey, mode, depth, numChords })`
4. Store maps returned degree/quality to realized triads + symbols for display/playback

## Existing Strategy/Mode Abstraction?
- There is currently no generator strategy registry for progression creation.
- Generation mode exists only as music mode (`ionian`, `aeolian`, etc.), not as generator-selection mode (`simple` vs `advanced`).

## Recommended Integration Points (Low Risk)
1. Add a new generator registry layer in `lib/music/generators/*`
   - `simple` adapter should directly pass through to existing `harmonyEngine.generateProgression`
   - `advanced` should be implemented in isolated new modules
2. Update store simple path to use the registry `simple` adapter only (no logic change)
3. Add a separate UI entry point next to existing `Generate` (e.g., `Advanced...`) that opens an advanced modal
4. Keep existing `Generate` button and behavior unchanged
5. Keep advanced output additive (labels + voiced MIDI notes) without replacing current progression rendering path
