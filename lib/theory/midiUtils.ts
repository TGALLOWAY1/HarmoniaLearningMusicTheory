/**
 * MIDI Utility Functions
 * 
 * Provides utilities for converting MIDI note numbers to pitch classes,
 * octaves, note names, and identifying key types (white/black).
 * 
 * Standard MIDI mapping:
 * - MIDI 60 = C4 (middle C)
 * - Octave formula: Math.floor(midi / 12) - 1
 * - Pitch class derived from midi % 12
 */

export type PitchClass =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export type NoteName = `${PitchClass}${number}`; // e.g. "C3", "C#4"

const PITCH_CLASSES: PitchClass[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Black keys are at pitch class indices: 1, 3, 6, 8, 10 (C#, D#, F#, G#, A#)
const BLACK_KEY_INDICES = new Set([1, 3, 6, 8, 10]);

/**
 * Convert MIDI note number to pitch class
 * @param midi - MIDI note number (0-127)
 * @returns Pitch class (C, C#, D, etc.)
 * @example midiToPitchClass(60) -> "C"
 * @example midiToPitchClass(61) -> "C#"
 */
export function midiToPitchClass(midi: number): PitchClass {
  const pitchClassIndex = midi % 12;
  return PITCH_CLASSES[pitchClassIndex];
}

/**
 * Convert pitch class and octave to MIDI note number
 * Inverse of midiToPitchClass and midiToOctave
 * @param pitchClass - Pitch class (C, C#, D, etc.)
 * @param octave - Octave number (e.g., 3 for C3)
 * @returns MIDI note number
 * @example pitchClassToMidi("C", 3) -> 48 (C3)
 * @example pitchClassToMidi("C#", 3) -> 49 (C#3)
 * @example pitchClassToMidi("C", 4) -> 60 (C4)
 */
export function pitchClassToMidi(
  pitchClass: PitchClass,
  octave: number
): number {
  const pitchClassIndex = PITCH_CLASSES.indexOf(pitchClass);
  if (pitchClassIndex === -1) {
    throw new Error(`Invalid pitch class: ${pitchClass}`);
  }
  // MIDI note for C of target octave: (octave + 1) * 12
  const octaveC = (octave + 1) * 12;
  return octaveC + pitchClassIndex;
}

/**
 * Convert MIDI note number to octave number
 * Standard formula: Math.floor(midi / 12) - 1
 * @param midi - MIDI note number (0-127)
 * @returns Octave number (MIDI 60 = C4, so returns 4)
 * @example midiToOctave(60) -> 4
 * @example midiToOctave(48) -> 3
 */
export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/**
 * Convert MIDI note number to full note name with octave
 * @param midi - MIDI note number (0-127)
 * @returns Note name like "C4", "C#4", "D3"
 * @example midiToNoteName(60) -> "C4"
 * @example midiToNoteName(61) -> "C#4"
 * @example midiToNoteName(48) -> "C3"
 */
export function midiToNoteName(midi: number): NoteName {
  const pitchClass = midiToPitchClass(midi);
  const octave = midiToOctave(midi);
  return `${pitchClass}${octave}` as NoteName;
}

/**
 * Check if a MIDI note is a black key (sharp/flat)
 * Black keys are: C#, D#, F#, G#, A#
 * @param midi - MIDI note number (0-127)
 * @returns true if the note is a black key
 * @example isBlackKey(61) -> true (C#)
 * @example isBlackKey(60) -> false (C)
 */
export function isBlackKey(midi: number): boolean {
  const pitchClassIndex = midi % 12;
  return BLACK_KEY_INDICES.has(pitchClassIndex);
}

/**
 * Check if a MIDI note is a white key
 * @param midi - MIDI note number (0-127)
 * @returns true if the note is a white key
 * @example isWhiteKey(60) -> true (C)
 * @example isWhiteKey(61) -> false (C#)
 */
export function isWhiteKey(midi: number): boolean {
  return !isBlackKey(midi);
}

/**
 * Generate an array of MIDI note numbers in a given range (inclusive)
 * @param lowest - Lowest MIDI note number (inclusive)
 * @param highest - Highest MIDI note number (inclusive)
 * @returns Array of MIDI note numbers from lowest to highest
 * @example generateMidiRange(48, 60) -> [48, 49, 50, ..., 60]
 */
export function generateMidiRange(lowest: number, highest: number): number[] {
  const notes: number[] = [];
  for (let midi = lowest; midi <= highest; midi++) {
    notes.push(midi);
  }
  return notes;
}

/**
 * Map a MIDI note to a canonical octave (default: octave 3, C3-B3 = 48-59)
 * This ensures each pitch class appears only once in the target octave.
 * @param midi - MIDI note number (0-127)
 * @param targetOctave - Target octave number (default: 3)
 * @returns MIDI note number in the target octave with the same pitch class
 * @example mapToOctave(60) -> 48 (C4 -> C3)
 * @example mapToOctave(61) -> 49 (C#4 -> C#3)
 * @example mapToOctave(48) -> 48 (C3 -> C3, already in target)
 */
export function mapToOctave(midi: number, targetOctave: number = 3): number {
  const pitchClassIndex = midi % 12;
  // MIDI note for C of target octave: (targetOctave + 1) * 12
  const targetOctaveC = (targetOctave + 1) * 12;
  return targetOctaveC + pitchClassIndex;
}

/**
 * Map an array of MIDI notes to a canonical octave, removing duplicates
 * @param midiNotes - Array of MIDI note numbers
 * @param targetOctave - Target octave number (default: 3)
 * @returns Array of unique MIDI note numbers in the target octave
 * @example mapNotesToOctave([48, 60, 72]) -> [48] (all C notes map to C3)
 * @example mapNotesToOctave([48, 52, 55, 60, 64, 67]) -> [48, 52, 55] (C, E, G in octave 3)
 */
export function mapNotesToOctave(
  midiNotes: number[],
  targetOctave: number = 3
): number[] {
  const mapped = midiNotes.map((note) => mapToOctave(note, targetOctave));
  // Remove duplicates by converting to Set and back to array
  return Array.from(new Set(mapped)).sort((a, b) => a - b);
}

