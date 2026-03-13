/**
 * Simple random chord progression generator.
 * Picks 4 chords at random from the diatonic triads (I, ii, iii, IV, V, vi, vii°).
 * No mood or complexity parameters—just random diatonic selection.
 */

import type { PitchClass, ScaleType } from "./theory";
import { getScaleDefinition } from "./theory/scale";
import { buildTriadFromScale } from "./theory/chord";
import { mapTriadToMidi } from "./theory/mapping";
import { midiToNoteName } from "./theory/midiUtils";
import type { TriadQuality } from "./theory/chord";

import { Degree } from "./theory/harmonyEngine";

/** Roman numeral for each scale degree by mode */
const DEGREE_TO_ROMAN: Record<ScaleType, Degree[]> = {
  major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  natural_minor: ["i", "ii°", "III", "iv", "v", "bVI", "bVII"],
  dorian: ["i", "ii", "III", "IV", "v", "vi", "bVII"], // Relaxed to nearest diatonic match
  mixolydian: ["I", "ii", "iii", "IV", "v", "vi", "bVII"],
  phrygian: ["i", "ii°", "III", "iv", "v", "bVI", "bVII"], // Relaxed back to standard minor mapping for types
};

function qualityToSuffix(q: TriadQuality): string {
  switch (q) {
    case "maj":
      return "";
    case "min":
      return "m";
    case "dim":
      return "dim";
    case "aug":
      return "aug";
    default:
      return "";
  }
}



export type ProgressionChord = {
  degree: string;
  symbol: string;
  quality: string;
  notes: PitchClass[];
  notesWithOctave: string[];
};

/**
 * Generate a random 4-chord progression from diatonic triads.
 */
export function generateRandomProgression(
  root: PitchClass,
  scaleType: ScaleType
): ProgressionChord[] {
  const scale = getScaleDefinition(root, scaleType);
  const romans = DEGREE_TO_ROMAN[scaleType];
  const result: ProgressionChord[] = [];

  for (let i = 0; i < 4; i++) {
    const degreeIndex = Math.floor(Math.random() * 7);
    const triad = buildTriadFromScale(scale, degreeIndex);
    const degree = romans[degreeIndex];
    const suffix = qualityToSuffix(triad.quality);
    const symbol = triad.root + suffix;

    result.push({
      degree,
      symbol,
      quality: triad.quality,
      notes: triad.pitchClasses,
      notesWithOctave: mapTriadToMidi(triad, 3).midiNotes.map(midiToNoteName),
    });
  }

  return result;
}
