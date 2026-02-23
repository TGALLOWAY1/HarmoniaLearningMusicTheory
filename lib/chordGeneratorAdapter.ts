/**
 * ChordGenerator Adapter
 *
 * This is the ONLY public entrypoint to ChordGenerator.
 * Never import from ChordGenerator/** outside this file.
 * See docs/chordgenerator-adapter-policy.md
 */

import type { PitchClass } from "./theory/midiUtils";
import type { ScaleType } from "./theory/types";
import { midiToPitchClass } from "./theory/midiUtils";
import { Note } from "@tonaljs/tonal";
import {
  generateProgressionWithMode,
  type Mood,
  type ComplexityLevel,
} from "../ChordGenerator/Harmonia Chord Progression Generator/src/lib/theory";

/** Harmonia-shaped chord in a progression */
export type ChordProgressionItem = {
  degree: string;
  symbol: string;
  quality: string;
  notes: PitchClass[];
};

/** Map ChordGenerator quality strings to Harmonia-style quality */
function mapQualityToHarmonia(cgQuality: string): string {
  const map: Record<string, string> = {
    "": "maj",
    m: "min",
    dim: "dim",
    maj7: "maj7",
    m7: "min7",
    "7": "dom7",
    sus2: "sus2",
    sus4: "sus4",
    add9: "add9",
    "m(add9)": "m(add9)",
    "maj(add9)": "maj(add9)",
  };
  return map[cgQuality] ?? cgQuality;
}

/** Convert Tonal note string (e.g. "Bb4") to Harmonia PitchClass (sharps-only) */
function noteToPitchClass(noteName: string): PitchClass {
  const midi = Note.midi(noteName);
  if (typeof midi !== "number") {
    throw new Error(`Invalid note: ${noteName}`);
  }
  return midiToPitchClass(midi);
}

/** Map Harmonia ScaleType to ChordGenerator Mode */
function scaleTypeToMode(scaleType: ScaleType): "ionian" | "aeolian" | "dorian" | "mixolydian" | "phrygian" {
  const map: Record<ScaleType, "ionian" | "aeolian" | "dorian" | "mixolydian" | "phrygian"> = {
    major: "ionian",
    natural_minor: "aeolian",
    dorian: "dorian",
    mixolydian: "mixolydian",
    phrygian: "phrygian",
  };
  return map[scaleType];
}

/**
 * Generate a chord progression using ChordGenerator, returning Harmonia-shaped data.
 *
 * @param root - Pitch class (Harmonia sharps-only)
 * @param scaleType - Harmonia ScaleType
 * @param options - Optional mood and complexity (ChordGenerator-specific)
 */
export function generateChordProgression(
  root: PitchClass,
  scaleType: ScaleType,
  options?: { mood?: Mood; complexity?: ComplexityLevel }
): ChordProgressionItem[] {
  const mode = scaleTypeToMode(scaleType);
  const mood = options?.mood ?? "neutral";
  const complexity = options?.complexity ?? 1;

  const raw = generateProgressionWithMode(root, mode, mood, complexity);

  return raw.map((chord) => ({
    degree: chord.roman,
    symbol: chord.symbol,
    quality: mapQualityToHarmonia(inferQualityFromSymbol(chord.symbol)),
    notes: chord.notes.map((n) => noteToPitchClass(n)),
  }));
}

/** Extract suffix from chord symbol (e.g. "Cm7" -> "m7") and return CG quality for mapping */
function inferQualityFromSymbol(symbol: string): string {
  const m = symbol.match(/^[A-G][#b]?(.*)$/);
  const suffix = m?.[1] ?? "";
  const suffixToCgQuality: Record<string, string> = {
    "": "",
    m: "m",
    dim: "dim",
    maj7: "maj7",
    m7: "m7",
    "7": "7",
    sus2: "sus2",
    sus4: "sus4",
    add9: "add9",
    madd9: "m(add9)",
    maj9: "maj(add9)",
  };
  return suffixToCgQuality[suffix] ?? suffix;
}
