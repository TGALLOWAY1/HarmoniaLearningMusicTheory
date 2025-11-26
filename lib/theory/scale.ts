/**
 * Scale Generation Functions
 * 
 * Provides functions to generate major and natural minor scales
 * based on a root pitch class.
 */

import type { PitchClass } from "./midiUtils";
import type { ScaleDefinition, ScaleType } from "./types";

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

// Scale intervals in semitones
const MAJOR_INTERVALS = [2, 2, 1, 2, 2, 2, 1]; // W-W-H-W-W-W-H
const NATURAL_MINOR_INTERVALS = [2, 1, 2, 2, 1, 2, 2]; // W-H-W-W-H-W-W

/**
 * Rotate pitch classes starting from a given root
 * Returns 12 pitch classes in order, wrapping around
 * @param start - The starting pitch class
 * @returns Array of 12 pitch classes starting from `start`
 */
function rotatePitchClasses(start: PitchClass): PitchClass[] {
  const startIndex = PITCH_CLASS_ORDER.indexOf(start);
  if (startIndex === -1) {
    throw new Error(`Invalid pitch class: ${start}`);
  }

  const rotated: PitchClass[] = [];
  for (let i = 0; i < 12; i++) {
    const index = (startIndex + i) % 12;
    rotated.push(PITCH_CLASS_ORDER[index]);
  }
  return rotated;
}

/**
 * Get a scale definition for a given root and scale type
 * @param root - The root pitch class of the scale
 * @param type - The type of scale: "major" or "natural_minor"
 * @returns ScaleDefinition with root, type, and ordered pitch classes
 * @example getScaleDefinition("C", "major") -> { root: "C", type: "major", pitchClasses: ["C", "D", "E", "F", "G", "A", "B"] }
 * @example getScaleDefinition("A", "natural_minor") -> { root: "A", type: "natural_minor", pitchClasses: ["A", "B", "C", "D", "E", "F", "G"] }
 */
export function getScaleDefinition(
  root: PitchClass,
  type: ScaleType
): ScaleDefinition {
  // Choose the interval set based on scale type
  const intervals =
    type === "major" ? MAJOR_INTERVALS : NATURAL_MINOR_INTERVALS;

  // Get rotated pitch classes starting from root
  const rotatedPitchClasses = rotatePitchClasses(root);

  // Build the scale by walking through intervals
  // A scale has 7 notes, so we need 6 intervals (the 7th note is the octave, which we exclude)
  const pitchClasses: PitchClass[] = [root]; // Start with root
  let currentIndex = 0;

  // Use all but the last interval to get 7 unique pitch classes
  for (let i = 0; i < intervals.length - 1; i++) {
    currentIndex = (currentIndex + intervals[i]) % 12;
    pitchClasses.push(rotatedPitchClasses[currentIndex]);
  }

  return {
    root,
    type,
    pitchClasses,
  };
}

/**
 * Get a major scale definition
 * @param root - The root pitch class of the major scale
 * @returns ScaleDefinition for the major scale
 * @example getMajorScale("C") -> { root: "C", type: "major", pitchClasses: ["C", "D", "E", "F", "G", "A", "B"] }
 */
export function getMajorScale(root: PitchClass): ScaleDefinition {
  return getScaleDefinition(root, "major");
}

/**
 * Get a natural minor scale definition
 * @param root - The root pitch class of the natural minor scale
 * @returns ScaleDefinition for the natural minor scale
 * @example getNaturalMinorScale("A") -> { root: "A", type: "natural_minor", pitchClasses: ["A", "B", "C", "D", "E", "F", "G"] }
 */
export function getNaturalMinorScale(root: PitchClass): ScaleDefinition {
  return getScaleDefinition(root, "natural_minor");
}

