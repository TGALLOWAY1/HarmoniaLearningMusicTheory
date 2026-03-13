# ChordGenerator Conversion Mismatch Report

**Date:** 2025-02-23  
**Scope:** Audit of `ChordGenerator/Harmonia Chord Progression Generator/` against Harmonia's canonical theory engine (`lib/theory/*`). No refactoring performed.

---

## 1. Type / Representation Mismatches

### 1.1 PitchClass & Note Representation

| Location | Harmonia | ChordGenerator |
|---------|----------|----------------|
| **Pitch class set** | `PitchClass` = sharps only: `"C" \| "C#" \| "D" \| ... \| "B"` | Tonal.js returns context-dependent spellings (e.g. `"Bb"` for D aeolian) |
| **Enharmonic policy** | Sharps only (`lib/theory/midiUtils.ts`, `scale.ts`, `chord.ts`) | Tonal uses flats in minor keys (`lib/music-theory.ts`: `Scale.get("D aeolian").notes` → `Bb`) |
| **Note format** | `NoteName` = `PitchClass` + octave (e.g. `"C3"`) | `string[]` from `Note.fromMidi()` / `Chord.get().notes` — Tonal format (may include flats) |

**Files affected:**
- `ChordGenerator/.../lib/music-theory.ts` (Bb in D aeolian)
- `ChordGenerator/.../src/audio/voicing.ts` (Note.midi, Note.fromMidi)
- `ChordGenerator/.../src/lib/theory.ts` (Note.get, Note.transpose, TonalChord.get)
- `ChordGenerator/.../src/lib/midiExport.ts` (Note.midi on note names)

### 1.2 ScaleType / Mode

| Harmonia | ChordGenerator |
|----------|----------------|
| `ScaleType`: `"major" \| "natural_minor" \| "dorian" \| "mixolydian" \| "phrygian"` | `Mode`: `"ionian" \| "aeolian" \| "dorian" \| "mixolydian" \| "phrygian"` |
| `ScaleMode` (N/A in Harmonia) | `ScaleMode`: `"major" \| "minor"` (maps to ionian/aeolian) |

**Mapping needed:** `major` ↔ `ionian`, `natural_minor` ↔ `aeolian`. Harmonia has no `ScaleMode`; ChordGenerator uses it as a UI abstraction.

**Files affected:**
- `ChordGenerator/.../src/lib/theory.ts` (ScaleMode, SCALE_MODE_TO_ENGINE_MODE)
- `ChordGenerator/.../src/logic/harmonyEngine.ts` (Mode type)

### 1.3 Chord Quality

| Harmonia | ChordGenerator (harmonyEngine) |
|----------|-------------------------------|
| `TriadQuality`: `"maj" \| "min" \| "dim" \| "aug"` | `ChordQuality`: `"" \| "m" \| "dim" \| "maj7" \| "m7" \| "7" \| "sus2" \| "sus4" \| "add9" \| "m(add9)" \| "maj(add9)"` |
| `SeventhQuality`: `"maj7" \| "min7" \| "dom7" \| "half-dim7" \| "dim7"` | Uses `"7"` for dominant, `"m7"` for minor 7th |
| `formatChordSymbol` uses `"dom7"` → `"C7"` | QUALITY_SYMBOL_MAP: `"7"` → `"7"` (symbol suffix) |

**Mismatches:**
- Harmonia: `min` vs ChordGenerator: `m`
- Harmonia: `dom7` vs ChordGenerator: `7`
- ChordGenerator supports `sus2`, `sus4`, `add9`, `m(add9)`, `maj(add9)` — Harmonia chord.ts does not
- ChordGenerator has no `half-dim7` or `dim7` in its quality set (only `dim` for triads)

**Files affected:**
- `ChordGenerator/.../src/lib/theory.ts` (QUALITY_SYMBOL_MAP)
- `ChordGenerator/.../src/logic/harmonyEngine.ts` (ChordQuality, DEPTH_MAPPING)

### 1.4 Roman Numeral / Degree

| Harmonia | ChordGenerator |
|----------|----------------|
| `RomanNumeral`: `"I" \| "ii" \| "iii" \| "IV" \| "V" \| "vi" \| "vii°" \| "i" \| "ii°" \| "III" \| "iv" \| "v" \| "VI" \| "VII"` | `Degree`: Same + `"bVI" \| "bVII" \| "bII" \| "bIII" \| "II"` |
| No flat degrees | Uses `bVI`, `bVII`, `bII`, `bIII` for modal mixture |
| `degreeInfo.ts` covers standard diatonic degrees | No equivalent for flat degrees |

**Files affected:**
- `ChordGenerator/.../src/logic/harmonyEngine.ts` (Degree, MODE_DEGREE_OFFSETS, ROMAN_INDEX)
- `lib/theory/degreeInfo.ts` (would need extension for flat degrees if exposed)

### 1.5 Chord Object Shapes

| Harmonia API | ChordGenerator ChordObject |
|--------------|----------------------------|
| `ChordResponseItem`: `{ degree, symbol, quality, notes }` — `notes` = `PitchClass[]` | `ChordObject`: `{ symbol, notes, roman }` — `notes` = `string[]` (e.g. `"C4"`, `"E4"`) |
| `Triad`: `{ root, quality, pitchClasses }` | N/A — ChordGenerator uses symbol + Tonal for notes |
| `SeventhChord`: `{ root, quality, pitchClasses }` | N/A |

**Field naming:** Harmonia uses `degree`; ChordGenerator uses `roman`. Both represent Roman numerals.

**Files affected:**
- `ChordGenerator/.../src/lib/theory.ts` (ChordObject)
- `ChordGenerator/.../types/chord.ts` (Chord: `romanNumeral` — legacy, used by old progression-store)

### 1.6 MIDI Mapping

| Aspect | Harmonia | ChordGenerator |
|--------|----------|----------------|
| **Formula** | `(octave + 1) * 12 + semitone` (midiUtils) | Tonal `Note.midi()` — same standard (60 = C4) |
| **Default octave** | 3 (C3–B3 = 48–59) | voicing.ts: DEFAULT_OCTAVE = 4, BASS_MIN = C2, MUD_CUTOFF = C3 |
| **Input** | `PitchClass[]` + octave | `string[]` note names from Tonal |

Harmonia's `pitchClassToMidi` and `pitchClassesToMidi` take `PitchClass`; ChordGenerator uses Tonal's `Note.midi(noteName)` on full note names. Semantically compatible if note names are valid, but Harmonia has no equivalent for voiced note names with octaves.

**Files affected:**
- `ChordGenerator/.../src/audio/voicing.ts`
- `ChordGenerator/.../src/lib/midiExport.ts`

---

## 2. Duplicate Constants

### 2.1 Note Name / Pitch Class Arrays

| File | Constant | Purpose |
|------|----------|---------|
| `lib/theory/midiUtils.ts` | `PITCH_CLASSES` | 12-tone order |
| `lib/theory/scale.ts` | `PITCH_CLASS_ORDER` | Scale building |
| `lib/theory/chord.ts` | `PITCH_CLASS_ORDER` | Chord building |
| `app/api/theory/scale/route.ts` | `VALID_PITCH_CLASSES` | Validation |
| `app/api/theory/chord/route.ts` | `VALID_PITCH_CLASSES` | Validation |
| `app/api/theory/key-diatonic-chords/route.ts` | `VALID_PITCH_CLASSES` | Validation |

**Recommendation:** Single canonical `PITCH_CLASSES` / `PITCH_CLASS_ORDER` in `lib/theory` (e.g. `midiUtils` or `types`), imported elsewhere.

### 2.2 Scale Interval Tables

| File | Constants |
|------|-----------|
| `lib/theory/scale.ts` | `MAJOR_INTERVALS`, `NATURAL_MINOR_INTERVALS`, `DORIAN_INTERVALS`, `MIXOLYDIAN_INTERVALS`, `PHRYGIAN_INTERVALS` |
| `ChordGenerator/.../src/logic/harmonyEngine.ts` | `MODE_DEGREE_OFFSETS` (semitone offsets per mode: ionian, aeolian, dorian, mixolydian, phrygian) |

ChordGenerator uses degree→semitone offsets; Harmonia uses interval steps. Different representations of the same modes.

### 2.3 Chord Quality Enums / Maps

| File | Constant |
|------|----------|
| `lib/theory/chord.ts` | `TriadQuality`, `SeventhQuality`, `ChordQuality` |
| `ChordGenerator/.../src/lib/theory.ts` | `QUALITY_SYMBOL_MAP` (ChordGenerator quality → symbol suffix) |
| `ChordGenerator/.../src/logic/harmonyEngine.ts` | `ChordQuality`, `DEPTH_MAPPING`, `QUALITY_BY_FLAVOR` |

No shared quality vocabulary between Harmonia and ChordGenerator.

### 2.4 Roman Numeral Index

| File | Constant |
|------|----------|
| `ChordGenerator/.../src/lib/theory.ts` | `ROMAN_INDEX`: `{ I: 0, II: 1, ... }` |
| `ChordGenerator/.../src/logic/harmonyEngine.ts` | `ALL_DEGREES`, `MODE_TONICS` |
| `lib/theory/chord.ts` | `getRomanNumeral()` with inline arrays |
| `lib/theory/degreeInfo.ts` | `degreeMap` for I, ii, ... (no flat degrees) |

---

## 3. Conflicting Exports

### 3.1 Direct Export Conflicts

If ChordGenerator were moved under `lib/theory/` or its types re-exported from `lib/theory/index.ts`:

| Export | Harmonia (`lib/theory`) | ChordGenerator |
|--------|-------------------------|----------------|
| `Mood` | Not in Harmonia | `"happy" \| "sad" \| "dark" \| "hopeful" \| "neutral"` (theory.ts) vs `"melancholic" \| "moody" \| ...` (harmonyEngine) |
| `ScaleMode` | Not in Harmonia | `"major" \| "minor"` |
| `ChordObject` | Not in Harmonia | `{ symbol, notes, roman }` |
| `ChordQuality` | `TriadQuality \| SeventhQuality` | Different union |
| `generateProgression` | Not in Harmonia | ChordGenerator's main API |

**Conclusion:** ChordGenerator should not re-export from `lib/theory` directly. Use an adapter that consumes Harmonia types and returns Harmonia-shaped data.

### 3.2 Import Path Conflicts

ChordGenerator uses `@/src/lib/theory`, `@/src/logic/harmonyEngine`, etc. Harmonia uses `@/lib/theory`. If ChordGenerator is integrated into the main app, path aliases must be updated so `@/lib/theory` remains Harmonia's canonical theory module.

---

## 4. String-Based & Ad-Hoc Representations

### 4.1 String-Based Notes

- **ChordGenerator:** `notes: string[]` — Tonal note names (`"C4"`, `"Bb3"`, etc.). No `PitchClass` type.
- **Root parameter:** `root: string` in `generateProgression` — accepts `"C"`, `"F#"`, `"Bb"`; no validation against `PitchClass`.
- **voicing.ts:** `Note.get(n).pc` for pitch class; `Note.midi()`, `Note.fromMidi()` for conversion.

### 4.2 Ad-Hoc Objects

- **ChordObject:** `{ symbol, notes, roman }` — custom shape, not `Triad` or `SeventhChord`.
- **VoicedChord:** `{ notes: string[] }` — minimal, internal to voicing.
- **GeneratedChord:** `{ degree, quality }` — internal to harmonyEngine.
- **Chord** (types/chord.ts): `{ symbol, notes, romanNumeral }` — legacy; `romanNumeral` vs `roman` inconsistency.

---

## 5. Proposed Target Folder Structure

```
lib/
  theory/                    # Harmonia canonical (unchanged)
    index.ts
    types.ts
    midiUtils.ts
    scale.ts
    chord.ts
    mapping.ts
    circle.ts
    degreeInfo.ts
    __tests__/
  chordGeneratorAdapter.ts   # NEW: Public adapter
    - generateProgression(root: PitchClass, mode: ScaleType, mood?, complexity?)
    - Returns Harmonia-shaped progression (e.g. ChordResponseItem[] or extended type)
    - Internally calls ChordGenerator logic, converts to PitchClass, normalizes enharmonics

ChordGenerator/               # Internal implementation (no direct imports from app)
  Harmonia Chord Progression Generator/
    src/
      logic/
        harmonyEngine.ts      # Keep; adapter will call
      lib/
        theory.ts            # Refactor to use Harmonia types where possible
      audio/
        voicing.ts           # Keep; may need enharmonic normalization
    lib/
      music-theory.ts        # Deprecated; adapter replaces
```

### Adapter Responsibilities

1. **Input:** Accept `PitchClass`, `ScaleType` (or mapped `ScaleMode`), optional `Mood`, `ComplexityLevel`.
2. **Output:** Return progression as `{ degree, symbol, quality, notes: PitchClass[] }[]` or equivalent Harmonia API shape.
3. **Conversion:** Map ChordGenerator `ChordObject` → Harmonia `ChordResponseItem`; normalize `notes` from Tonal strings to `PitchClass[]` (sharps) via `midiToPitchClass(midi)`.
4. **Mode mapping:** `ScaleType` → `Mode` (e.g. `natural_minor` → `aeolian`).
5. **Quality mapping:** ChordGenerator quality strings → Harmonia `ChordQuality` where applicable.

### What Stays Internal

- `harmonyEngine.ts` — Markov logic, mood profiles, degree sampling
- `voicing.ts` — Psychoacoustic voicing (Mud Cut, voice-leading)
- `midiExport.ts` — Can stay or move to `lib/`; consumes ChordObject, would need adapter output
- ChordGenerator UI components — Consume adapter or a dedicated ChordGenerator API, not `lib/theory` directly

---

## 6. Summary of Required Changes (For Future Refactor)

| Category | Action |
|----------|--------|
| **PitchClass** | Add enharmonic normalization (Tonal output → Harmonia sharps) in adapter |
| **ScaleType/Mode** | Map `ScaleType` ↔ `Mode` in adapter |
| **ChordQuality** | Map ChordGenerator qualities to Harmonia `ChordQuality` in adapter; document unsupported (sus2, add9, etc.) |
| **ChordObject** | Adapter converts to `ChordResponseItem` or equivalent |
| **Notes** | Convert `string[]` (Tonal) → `PitchClass[]` via MIDI round-trip or Tonal `Note.pc` + normalization |
| **Duplicate constants** | Consolidate `PITCH_CLASS_ORDER`; consider shared mode/degree tables |
| **Exports** | No ChordGenerator exports from `lib/theory`; adapter is the only public entry point |
| **Root validation** | Adapter validates `root` against `PitchClass` before calling ChordGenerator |

---

## 7. File Index

| Path | Role |
|------|------|
| `lib/theory/*` | Harmonia canonical theory |
| `ChordGenerator/.../src/lib/theory.ts` | ChordGenerator public API (generateProgression, applyVoicing, ChordObject) |
| `ChordGenerator/.../src/logic/harmonyEngine.ts` | Markov progression engine, Mode, Degree, ChordQuality, Mood |
| `ChordGenerator/.../src/audio/voicing.ts` | Voicing + Mud Cut |
| `ChordGenerator/.../src/lib/midiExport.ts` | MIDI export |
| `ChordGenerator/.../lib/music-theory.ts` | Deprecated D-minor helpers |
| `ChordGenerator/.../types/chord.ts` | Legacy Chord, Progression (romanNumeral) |
