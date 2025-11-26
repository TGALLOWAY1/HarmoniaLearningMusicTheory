/**
 * Chord Generation Functions
 * 
 * Provides functions to generate triads, seventh chords, and diatonic chord sets
 * based on scales and scale degrees.
 */

import type { PitchClass } from "./midiUtils";
import type { ScaleDefinition, ScaleType } from "./types";
import { getMajorScale, getNaturalMinorScale } from "./scale";

export type TriadQuality = "maj" | "min" | "dim" | "aug";

export type SeventhQuality = "maj7" | "min7" | "dom7" | "half-dim7" | "dim7";

export type Triad = {
  root: PitchClass;
  quality: TriadQuality;
  pitchClasses: PitchClass[]; // length 3
};

export type SeventhChord = {
  root: PitchClass;
  quality: SeventhQuality;
  pitchClasses: PitchClass[]; // length 4
};

export type RomanNumeral =
  | "I"
  | "ii"
  | "iii"
  | "IV"
  | "V"
  | "vi"
  | "vii°"
  | "i"
  | "ii°"
  | "III"
  | "iv"
  | "v"
  | "VI"
  | "VII";

export type DiatonicTriad = {
  degree: RomanNumeral;
  triad: Triad;
};

export type DiatonicSeventh = {
  degree: RomanNumeral;
  seventh: SeventhChord;
};

export type DiatonicChordSet = {
  keyRoot: PitchClass;
  keyType: ScaleType;
  triads: DiatonicTriad[];
  sevenths: DiatonicSeventh[];
};

const PITCH_CLASS_ORDER: PitchClass[] = [
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

/**
 * Calculate the semitone interval between two pitch classes
 * @param from - Starting pitch class
 * @param to - Ending pitch class
 * @returns Number of semitones (0-11)
 */
function semitoneInterval(from: PitchClass, to: PitchClass): number {
  const fromIndex = PITCH_CLASS_ORDER.indexOf(from);
  const toIndex = PITCH_CLASS_ORDER.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`Invalid pitch class: ${from} or ${to}`);
  }
  return (toIndex - fromIndex + 12) % 12;
}

/**
 * Determine triad quality based on intervals
 * @param root - Root pitch class
 * @param third - Third pitch class
 * @param fifth - Fifth pitch class
 * @returns TriadQuality
 */
function determineTriadQuality(
  root: PitchClass,
  third: PitchClass,
  fifth: PitchClass
): TriadQuality {
  const rootToThird = semitoneInterval(root, third);
  const thirdToFifth = semitoneInterval(third, fifth);

  // Major third = 4 semitones, minor third = 3 semitones
  const isMajorThird = rootToThird === 4;
  const isMinorThird = rootToThird === 3;
  const isMajorThirdAbove = thirdToFifth === 4;
  const isMinorThirdAbove = thirdToFifth === 3;

  if (isMajorThird && isMinorThirdAbove) {
    return "maj"; // Major triad: M3 + m3
  }
  if (isMinorThird && isMajorThirdAbove) {
    return "min"; // Minor triad: m3 + M3
  }
  if (isMinorThird && isMinorThirdAbove) {
    return "dim"; // Diminished triad: m3 + m3
  }
  if (isMajorThird && isMajorThirdAbove) {
    return "aug"; // Augmented triad: M3 + M3
  }

  // Fallback (shouldn't happen with diatonic chords)
  return "maj";
}

/**
 * Determine seventh chord quality based on intervals
 * @param root - Root pitch class
 * @param third - Third pitch class
 * @param fifth - Fifth pitch class
 * @param seventh - Seventh pitch class
 * @returns SeventhQuality
 */
function determineSeventhQuality(
  root: PitchClass,
  third: PitchClass,
  fifth: PitchClass,
  seventh: PitchClass
): SeventhQuality {
  const rootToThird = semitoneInterval(root, third);
  const thirdToFifth = semitoneInterval(third, fifth);
  const fifthToSeventh = semitoneInterval(fifth, seventh);

  // Check all three intervals together to determine quality
  // maj7: M3 + m3 + M3 (e.g., C E G B) -> 4, 3, 4
  if (rootToThird === 4 && thirdToFifth === 3 && fifthToSeventh === 4) {
    return "maj7";
  }

  // min7: m3 + M3 + m3 (e.g., C Eb G Bb) -> 3, 4, 3
  if (rootToThird === 3 && thirdToFifth === 4 && fifthToSeventh === 3) {
    return "min7";
  }

  // dom7: M3 + m3 + m3 (e.g., C E G Bb) -> 4, 3, 3
  if (rootToThird === 4 && thirdToFifth === 3 && fifthToSeventh === 3) {
    return "dom7";
  }

  // half-dim7: m3 + m3 + M3 (e.g., B D F A) -> 3, 3, 4
  if (rootToThird === 3 && thirdToFifth === 3 && fifthToSeventh === 4) {
    return "half-dim7";
  }

  // dim7: m3 + m3 + m3 (e.g., B D F Ab) -> 3, 3, 3
  if (rootToThird === 3 && thirdToFifth === 3 && fifthToSeventh === 3) {
    return "dim7";
  }

  // Fallback to min7 (most common in natural minor)
  return "min7";
}

/**
 * Build a triad from a scale using scale-degree stacking
 * @param scale - The scale definition
 * @param scaleDegreeIndex - 0-based scale degree (0 = I, 1 = ii, etc.)
 * @returns Triad with root, quality, and pitch classes
 */
export function buildTriadFromScale(
  scale: ScaleDefinition,
  scaleDegreeIndex: number
): Triad {
  if (scaleDegreeIndex < 0 || scaleDegreeIndex >= 7) {
    throw new Error(
      `Scale degree index must be between 0 and 6, got ${scaleDegreeIndex}`
    );
  }

  const root = scale.pitchClasses[scaleDegreeIndex];
  const third = scale.pitchClasses[(scaleDegreeIndex + 2) % 7];
  const fifth = scale.pitchClasses[(scaleDegreeIndex + 4) % 7];

  const quality = determineTriadQuality(root, third, fifth);

  return {
    root,
    quality,
    pitchClasses: [root, third, fifth],
  };
}

/**
 * Build a seventh chord from a scale using scale-degree stacking
 * @param scale - The scale definition
 * @param scaleDegreeIndex - 0-based scale degree (0 = I, 1 = ii, etc.)
 * @returns SeventhChord with root, quality, and pitch classes
 */
export function buildSeventhFromScale(
  scale: ScaleDefinition,
  scaleDegreeIndex: number
): SeventhChord {
  if (scaleDegreeIndex < 0 || scaleDegreeIndex >= 7) {
    throw new Error(
      `Scale degree index must be between 0 and 6, got ${scaleDegreeIndex}`
    );
  }

  const root = scale.pitchClasses[scaleDegreeIndex];
  const third = scale.pitchClasses[(scaleDegreeIndex + 2) % 7];
  const fifth = scale.pitchClasses[(scaleDegreeIndex + 4) % 7];
  const seventh = scale.pitchClasses[(scaleDegreeIndex + 6) % 7];

  const quality = determineSeventhQuality(root, third, fifth, seventh);

  return {
    root,
    quality,
    pitchClasses: [root, third, fifth, seventh],
  };
}

/**
 * Get Roman numeral for a scale degree in a given key
 * @param degreeIndex - 0-based scale degree
 * @param keyType - Type of key (major or natural_minor)
 * @returns Roman numeral string
 */
function getRomanNumeral(
  degreeIndex: number,
  keyType: ScaleType
): RomanNumeral {
  if (keyType === "major") {
    const majorNumerals: RomanNumeral[] = [
      "I",
      "ii",
      "iii",
      "IV",
      "V",
      "vi",
      "vii°",
    ];
    return majorNumerals[degreeIndex];
  } else {
    // natural_minor
    const minorNumerals: RomanNumeral[] = [
      "i",
      "ii°",
      "III",
      "iv",
      "v",
      "VI",
      "VII",
    ];
    return minorNumerals[degreeIndex];
  }
}

/**
 * Get all diatonic chords (triads and sevenths) for a given key
 * @param keyRoot - Root pitch class of the key
 * @param keyType - Type of key (major or natural_minor)
 * @returns DiatonicChordSet with triads and sevenths for all 7 scale degrees
 */
export function getDiatonicChords(
  keyRoot: PitchClass,
  keyType: ScaleType
): DiatonicChordSet {
  // Get the scale
  const scale =
    keyType === "major"
      ? getMajorScale(keyRoot)
      : getNaturalMinorScale(keyRoot);

  // Build triads and sevenths for each scale degree
  const triads: DiatonicTriad[] = [];
  const sevenths: DiatonicSeventh[] = [];

  for (let i = 0; i < 7; i++) {
    const degree = getRomanNumeral(i, keyType);
    const triad = buildTriadFromScale(scale, i);
    const seventh = buildSeventhFromScale(scale, i);

    triads.push({ degree, triad });
    sevenths.push({ degree, seventh });
  }

  return {
    keyRoot,
    keyType,
    triads,
    sevenths,
  };
}

