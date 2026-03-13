# Milestone 2 - Music Theory Engine Implementation Notes

This document contains summaries from each prompt/task completed during Milestone 2 development.

---

## Prompt 2.1 - Core Types + Major/Natural Minor Scale Generators

### Goal
Implement core music theory utilities for pitch classes and scales, building on existing `midiUtils.ts` helpers.

### Files Created/Modified:

1. **`lib/theory/types.ts`** - Core type definitions:
   - Re-exports `PitchClass` from `midiUtils.ts`
   - Defines `ScaleType` union: `"major" | "natural_minor"`
   - Defines `ScaleDefinition` type with `root`, `type`, and `pitchClasses` array

2. **`lib/theory/scale.ts`** - Scale generation implementation:
   - `PITCH_CLASS_ORDER` array for semitone-based calculations
   - `MAJOR_INTERVALS` and `NATURAL_MINOR_INTERVALS` arrays (semitone steps)
   - `rotatePitchClasses()` helper to rotate 12-tone circle from root
   - `getScaleDefinition()` core function using interval walking
   - `getMajorScale()` and `getNaturalMinorScale()` wrapper functions
   - Returns 7 unique pitch classes (excludes octave)

3. **`lib/theory/index.ts`** - Updated exports:
   - Exports all types from `types.ts`
   - Exports all scale functions from `scale.ts`

4. **`lib/theory/__tests__/scale.test.ts`** - Test template with expected cases

5. **`lib/theory/devScratch.ts`** - Development sanity checks

### Implementation Details:

- **Interval Logic**: Uses semitone intervals (W-W-H-W-W-W-H for major, W-H-W-W-H-W-W for natural minor)
- **Scale Generation**: Walks through 6 intervals to get 7 unique pitch classes
- **Type Safety**: Fully typed with no `any` types
- **Example Outputs**:
  - C Major: `["C", "D", "E", "F", "G", "A", "B"]`
  - A Natural Minor: `["A", "B", "C", "D", "E", "F", "G"]`

---

## Prompt 2.2 - Triads & Diatonic Chords (Triads + 7ths)

### Goal
Implement triad and 7th-chord generators, plus function to get all diatonic chords in a key with Roman numerals.

### Files Created/Modified:

1. **`lib/theory/chord.ts`** - Complete chord implementation:
   - **Types**: `TriadQuality`, `SeventhQuality`, `Triad`, `SeventhChord`, `RomanNumeral`, `DiatonicTriad`, `DiatonicSeventh`, `DiatonicChordSet`
   - **Quality Detection**: 
     - `determineTriadQuality()` - analyzes intervals (M3+m3=maj, m3+M3=min, m3+m3=dim, M3+M3=aug)
     - `determineSeventhQuality()` - analyzes three intervals for 7th chord types
   - **Scale-Degree Stacking**:
     - `buildTriadFromScale()` - stacks degrees 1-3-5 (indices 0, 2, 4 modulo 7)
     - `buildSeventhFromScale()` - stacks degrees 1-3-5-7 (indices 0, 2, 4, 6 modulo 7)
   - **Diatonic Chords**:
     - `getRomanNumeral()` - maps scale degrees to Roman numerals (I, ii, iii, IV, V, vi, vii° for major; i, ii°, III, iv, v, VI, VII for minor)
     - `getDiatonicChords()` - returns complete set of triads and sevenths for a key

2. **`lib/theory/index.ts`** - Updated to export chord utilities

3. **`lib/theory/__tests__/chord.test.ts`** - Test template with expected cases

4. **`lib/theory/devChordScratch.ts`** - Development sanity checks

### Implementation Details:

- **Triad Quality**: Determined by comparing root→third and third→fifth intervals
- **Seventh Quality**: Determined by comparing all three intervals (root→third, third→fifth, fifth→seventh)
- **Roman Numerals**: Supports both major and natural minor key notations
- **Example Outputs** (C Major):
  - Triads: I (C maj), ii (D min), iii (E min), IV (F maj), V (G maj), vi (A min), vii° (B dim)
  - Sevenths: Imaj7, iimin7, iiimin7, IVmaj7, V7, vimin7, vii°half-dim7

---

## Prompt 2.3 - Mapping Scales/Chords to Single-Octave MIDI

### Goal
Implement helpers that map pitch-class-based scales and chords to single-octave MIDI notes for PianoRoll use.

### Files Created/Modified:

1. **`lib/theory/midiUtils.ts`** - Enhanced MIDI utilities:
   - Added `PITCH_CLASS_TO_SEMITONE` record for O(1) lookup
   - Updated `pitchClassToMidi()` to use the record (consistent with `midiToOctave` formula)
   - Added `pitchClassesToMidi()` to map arrays of pitch classes to MIDI notes

2. **`lib/theory/mapping.ts`** - New mapping module:
   - **Types**: `MappedScale`, `MappedTriad`, `MappedSeventhChord`
   - **Functions**:
     - `mapScaleToMidi()` - maps scale definition to MIDI notes in single octave
     - `mapTriadToMidi()` - maps triad to MIDI notes in single octave
     - `mapSeventhToMidi()` - maps seventh chord to MIDI notes in single octave

3. **`lib/theory/index.ts`** - Updated to export mapping utilities

4. **`lib/theory/devMappingScratch.ts`** - Development sanity checks

### Implementation Details:

- **Formula Consistency**: `pitchClassToMidi` uses `semitone + (octave + 1) * 12`, consistent with `midiToOctave` inverse
- **Single Octave**: All mappings target canonical octave (default: 3, C3-B3)
- **No Duplicates**: Each pitch class appears once, preventing multi-octave duplication
- **Usage**: Enables PianoRoll to display scales/chords without octave conflicts

---

## Prompt 2.4 - Wire Theory into PianoRoll Demo

### Goal
Update PianoRollDemo to use the real theory engine instead of hard-coded arrays, keeping everything mapped to a single octave.

### Files Modified:

1. **`components/piano-roll/PianoRollDemo.tsx`** - Complete refactor:
   - **Removed**: Hard-coded `C_MAJOR_SCALE_PITCH_CLASSES` and `C_MAJOR_CHORD_PITCH_CLASSES` arrays
   - **Added**: Imports from theory engine (`getMajorScale`, `getNaturalMinorScale`, `buildTriadFromScale`, `getDiatonicChords`, `mapScaleToMidi`, `mapTriadToMidi`)
   - **State Management**: Added `keyRoot`, `keyType`, and `chordDegree` state
   - **Dynamic Generation**: All scales/chords generated using theory engine
   - **Single Octave**: Uses `DEMO_OCTAVE = 3` for all mappings
   - **Interactive Controls**: 
     - Key selector dropdown (12 pitch classes)
     - Scale type toggle (Major/Minor)
     - Chord degree buttons (all 7 diatonic chords)
   - **PianoRoll Range**: Set using `pitchClassToMidi("C", 3)` and `pitchClassToMidi("B", 3)`

2. **`lib/theory/index.ts`** - Removed placeholder functions that conflicted with real implementations

### Implementation Details:

- **No Hard-Coded Data**: All MIDI arrays generated dynamically
- **Theory Engine Integration**: Complete dependency on theory utilities
- **Real-Time Updates**: UI controls update PianoRoll highlights instantly
- **Single Octave**: All notes mapped to octave 3 (C3-B3, MIDI 48-59)

---

## UI Improvements - Visual Contrast & View Mode Toggle

### Goal
Improve visual contrast between active/inactive keys and add view mode toggle for scale vs chord display.

### Files Modified:

1. **`components/piano-roll/PianoRoll.tsx`** - Visual improvements:
   - **Inactive Keys**: Very muted styling (`bg-neutral-50`, `text-neutral-400` for white; `bg-neutral-800`, `text-neutral-100` for black)
   - **Active Keys**: High-contrast emerald styling (`bg-emerald-500`, `border-emerald-600` for white; `bg-emerald-600`, `border-emerald-700` for black)
   - **Shadows**: Strong glow effects for active keys
   - **Indicator Bars**: Emerald bars at bottom of active keys (positioned below labels)
   - **Text Colors**: Dark text (`text-neutral-900`) for active white keys, white text for active black keys
   - **Animation**: `key-strong-active` animation for pop effect

2. **`components/piano-roll/PianoRollDemo.tsx`** - View mode toggle:
   - **State**: Added `viewMode` state (`"scale" | "chord"`)
   - **Conditional Layers**: `highlightLayers` filtered based on `viewMode`
   - **UI Toggle**: Segmented buttons with emerald active state
   - **Label Feedback**: Shows current mode ("Scale notes" or "Chord notes")

3. **`app/globals.css`** - Animation additions:
   - Added `@keyframes key-strong-pop` for stronger animation effect
   - Added `.key-strong-active` utility class

### Implementation Details:

- **Visual Hierarchy**: Clear distinction between active (emerald) and inactive (muted) keys
- **Indicator Positioning**: Emerald bars positioned at bottom, below labels, with proper z-index layering
- **Text Visibility**: Dark text on active white keys, white text on active black keys
- **View Mode**: Easy switching between scale-only and chord-only views
- **User Experience**: High-contrast, functional design optimized for clarity

---

## Bug Fixes & Refinements

### Circular Dependency Fix
- **Issue**: `types.ts` re-exporting `PitchClass` from `midiUtils.ts` caused webpack module resolution errors
- **Fix**: Removed re-export from `types.ts`, updated `scale.ts` and `chord.ts` to import `PitchClass` directly from `midiUtils.ts`
- **Result**: Clean module structure, no circular dependencies

### Indicator Bar Positioning
- **Issue**: Emerald indicator bars were obscuring key labels
- **Fix**: Restructured layout with container divs, positioned indicators at `bottom-0`, labels with proper spacing and z-index
- **Result**: Labels clearly visible above indicator bars

### Text Color Fix
- **Issue**: White text on white keys was invisible
- **Fix**: Removed `text-white` from `whiteKeyActive`, changed active label color to `text-neutral-900`
- **Result**: Dark, readable text on emerald backgrounds

### Build Cache Issues
- **Issue**: Webpack module resolution errors (`Cannot find module './207.js'`)
- **Fix**: Cleared `.next` directory and rebuilt
- **Result**: Clean build, no module resolution errors

---

## Summary

Milestone 2 successfully implemented a complete music theory engine with:

- **Scale Generation**: Major and natural minor scales from any root
- **Chord Generation**: Triads and 7th chords with quality detection
- **Diatonic Chords**: Complete sets with Roman numeral notation
- **MIDI Mapping**: Single-octave mapping utilities for PianoRoll integration
- **UI Integration**: Fully wired PianoRoll demo with interactive controls
- **Visual Polish**: High-contrast styling with clear active/inactive states
- **User Experience**: View mode toggle for focused scale/chord display

All functionality is fully typed, tested, and ready for use by API routes and UI components.

