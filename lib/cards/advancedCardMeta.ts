/**
 * Advanced Card Meta Types
 * 
 * Defines the meta field shapes for advanced flashcard kinds.
 * These types ensure type safety when working with card metadata.
 */

import type { PitchClass } from "../theory/midiUtils";
import type { ScaleType } from "../theory/types";

/**
 * Meta for scale_spelling cards
 * Question: "Spell the [type] scale starting on [root]"
 */
export type ScaleSpellingMeta = {
  root: PitchClass;
  type: ScaleType; // "major" | "natural_minor" | "dorian" | "mixolydian" | "phrygian"
};

/**
 * Meta for diatonic_chord_id cards
 * Question: "Which diatonic chord in [key] is [notes]?"
 * Options: Roman numerals like "I", "ii", "iii", "IV", "V", "vi", "vii°"
 */
export type DiatonicChordIdMeta = {
  keyRoot: PitchClass;
  keyType: "major" | "natural_minor";
  degree: string; // "I", "ii", "iii", "IV", "V", "vi", "vii°", etc.
  notes: PitchClass[]; // The pitch classes that make up this chord
};

/**
 * Meta for degree_to_chord cards
 * Question: "What chord is [degree] in [key]?"
 * Options: Chord names like "C major", "D minor", etc.
 */
export type DegreeToChordMeta = {
  keyRoot: PitchClass;
  keyType: "major" | "natural_minor";
  degree: string; // "I", "ii", "iii", "IV", "V", "vi", "vii°", etc.
  correctChord: string; // The correct chord name (e.g., "C major", "D minor")
};

/**
 * Meta for chord_to_degree cards
 * Question: "What is [chord] in [key]?"
 * Options: Roman numerals like "I", "ii", "iii", "IV", "V", "vi", "vii°"
 */
export type ChordToDegreeMeta = {
  keyRoot: PitchClass;
  keyType: "major" | "natural_minor";
  chord: string; // Chord name (e.g., "C major", "D minor")
  correctDegree: string; // The correct Roman numeral (e.g., "I", "ii")
};

/**
 * Meta for mode_character cards
 * Question: "What is the characteristic note/interval of [mode]?"
 * Options: Descriptions like "Raised 6th", "Lowered 7th", "Lowered 2nd", etc.
 */
export type ModeCharacterMeta = {
  mode: ScaleType; // "dorian" | "mixolydian" | "phrygian" | "natural_minor"
  root: PitchClass; // Optional: specific root for context
  characteristic: string; // Description of the characteristic feature (e.g., "Raised 6th", "Lowered 7th")
};

/**
 * Meta for progression_prediction cards
 * Question: "In [key], after [currentChords], what chord typically comes next?"
 * Options: Roman numerals like "I", "ii", "iii", "IV", "V", "vi", "vii°"
 */
export type ProgressionPredictionMeta = {
  keyRoot: PitchClass;
  keyType: "major" | "natural_minor";
  currentChords: string[]; // Array of Roman numerals, e.g., ["I", "vi"] or ["I", "V", "vi"]
  correctNext: string; // The correct next chord as Roman numeral (e.g., "IV", "V")
};

/**
 * Meta for tension_selection cards
 * Question: "Which tension works best over [chord] in [key]?"
 * Options: Tension descriptions like "9th", "11th", "13th", "b9", "#11", etc.
 */
export type TensionSelectionMeta = {
  keyRoot: PitchClass;
  keyType: "major" | "natural_minor";
  chord: string; // Chord name (e.g., "C major", "D minor")
  degree: string; // Roman numeral (e.g., "I", "V")
  correctTension: string; // The correct tension (e.g., "9th", "11th", "13th", "b9", "#11")
};

/**
 * Union type of all advanced card meta types
 * Used for type-safe narrowing in card renderers
 */
export type AdvancedCardMeta =
  | ScaleSpellingMeta
  | DiatonicChordIdMeta
  | DegreeToChordMeta
  | ChordToDegreeMeta
  | ModeCharacterMeta
  | ProgressionPredictionMeta
  | TensionSelectionMeta;

/**
 * Type guard functions for narrowing card meta types
 */
export function isScaleSpellingMeta(
  meta: unknown,
  kind: string
): meta is ScaleSpellingMeta {
  return kind === "scale_spelling";
}

export function isDiatonicChordIdMeta(
  meta: unknown,
  kind: string
): meta is DiatonicChordIdMeta {
  return kind === "diatonic_chord_id";
}

export function isDegreeToChordMeta(
  meta: unknown,
  kind: string
): meta is DegreeToChordMeta {
  return kind === "degree_to_chord";
}

export function isChordToDegreeMeta(
  meta: unknown,
  kind: string
): meta is ChordToDegreeMeta {
  return kind === "chord_to_degree";
}

export function isModeCharacterMeta(
  meta: unknown,
  kind: string
): meta is ModeCharacterMeta {
  return kind === "mode_character";
}

export function isProgressionPredictionMeta(
  meta: unknown,
  kind: string
): meta is ProgressionPredictionMeta {
  return kind === "progression_prediction";
}

export function isTensionSelectionMeta(
  meta: unknown,
  kind: string
): meta is TensionSelectionMeta {
  return kind === "tension_selection";
}

