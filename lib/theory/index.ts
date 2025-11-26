/**
 * Music Theory Utilities
 * 
 * This module contains functions for music theory calculations including
 * scales, chords, and harmonic relationships.
 */

// Export MIDI utilities
export {
  midiToPitchClass,
  midiToOctave,
  midiToNoteName,
  isBlackKey,
  isWhiteKey,
  generateMidiRange,
  mapToOctave,
  mapNotesToOctave,
  pitchClassToMidi,
  pitchClassesToMidi,
  type PitchClass,
  type NoteName,
} from "./midiUtils";

// Export types
export * from "./types";

// Export scale functions
export * from "./scale";

// Export chord functions
export * from "./chord";

// Export mapping functions
export * from "./mapping";

