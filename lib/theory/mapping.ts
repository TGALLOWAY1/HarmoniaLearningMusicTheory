/**
 * Mapping Functions
 * 
 * Provides functions to map pitch-class-based scales and chords to
 * single-octave MIDI notes for use with the PianoRoll component.
 */

import type { ScaleDefinition } from "./types";
import type { Triad, SeventhChord } from "./chord";
import { pitchClassesToMidi } from "./midiUtils";

export type MappedScale = {
  definition: ScaleDefinition;
  octave: number;
  midiNotes: number[];
};

export type MappedTriad = {
  triad: Triad;
  octave: number;
  midiNotes: number[];
};

export type MappedSeventhChord = {
  chord: SeventhChord;
  octave: number;
  midiNotes: number[];
};

/**
 * Map a scale definition to MIDI notes in a single octave
 * @param scale - Scale definition with pitch classes
 * @param octave - Target octave number (e.g., 3 for C3-B3)
 * @returns MappedScale with definition, octave, and MIDI notes
 * @example mapScaleToMidi(getMajorScale("C"), 3) -> { definition: {...}, octave: 3, midiNotes: [48, 50, 52, 53, 55, 57, 59] }
 */
export function mapScaleToMidi(
  scale: ScaleDefinition,
  octave: number
): MappedScale {
  return {
    definition: scale,
    octave,
    midiNotes: pitchClassesToMidi(scale.pitchClasses, octave),
  };
}

/**
 * Map a triad to MIDI notes in a single octave
 * @param triad - Triad with pitch classes
 * @param octave - Target octave number (e.g., 3 for C3-B3)
 * @returns MappedTriad with triad, octave, and MIDI notes
 * @example mapTriadToMidi({ root: "C", quality: "maj", pitchClasses: ["C", "E", "G"] }, 3) -> { triad: {...}, octave: 3, midiNotes: [48, 52, 55] }
 */
export function mapTriadToMidi(
  triad: Triad,
  octave: number
): MappedTriad {
  return {
    triad,
    octave,
    midiNotes: pitchClassesToMidi(triad.pitchClasses, octave),
  };
}

/**
 * Map a seventh chord to MIDI notes in a single octave
 * @param chord - Seventh chord with pitch classes
 * @param octave - Target octave number (e.g., 3 for C3-B3)
 * @returns MappedSeventhChord with chord, octave, and MIDI notes
 * @example mapSeventhToMidi({ root: "C", quality: "maj7", pitchClasses: ["C", "E", "G", "B"] }, 3) -> { chord: {...}, octave: 3, midiNotes: [48, 52, 55, 59] }
 */
export function mapSeventhToMidi(
  chord: SeventhChord,
  octave: number
): MappedSeventhChord {
  return {
    chord,
    octave,
    midiNotes: pitchClassesToMidi(chord.pitchClasses, octave),
  };
}

