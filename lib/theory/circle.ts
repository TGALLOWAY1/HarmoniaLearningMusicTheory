/**
 * Circle of Fifths Theory Helper
 * 
 * Provides functions for Circle of Fifths geometry, including:
 * - Key signature positions (clock positions)
 * - Relative major/minor relationships
 * - Neighbor keys (IV/V relationships)
 */

import type { PitchClass } from "./midiUtils";
import { getMajorScale } from "./scale";

export type CircleNode = {
  index: number;          // 0–11
  root: PitchClass;       // major key root (e.g. "C", "G", "D", ...)
  label: string;          // same as root for now
  relativeMinor: PitchClass;
};

/**
 * Circle order of major keys in fifths (single, sharps-focused representation for now).
 * Clockwise = sharps, counterclockwise = flats.
 * We're not trying to perfectly model enharmonic spellings yet; we just need a stable geometric order.
 */
const CIRCLE_MAJOR_ORDER: PitchClass[] = [
  "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F",
];

/**
 * Get the relative minor key for a given major key root.
 * The relative minor is the 6th degree of the major scale.
 * @param root - The major key root pitch class
 * @returns The relative minor pitch class
 * @example getRelativeMinor("C") -> "A"
 * @example getRelativeMinor("G") -> "E"
 */
export function getRelativeMinor(root: PitchClass): PitchClass {
  const scale = getMajorScale(root);
  const sixthDegree = scale.pitchClasses[5];
  return sixthDegree;
}

/**
 * Get all nodes in the Circle of Fifths.
 * @returns Array of CircleNode objects with index, root, label, and relativeMinor
 */
export function getCircleNodes(): CircleNode[] {
  return CIRCLE_MAJOR_ORDER.map((root, index) => ({
    index,
    root,
    label: root,
    relativeMinor: getRelativeMinor(root),
  }));
}

/**
 * Get the neighbor keys (left/right) for a given major key root.
 * In Circle-of-Fifths geometry, these represent IV (left) and V (right) relationships.
 * @param root - The major key root pitch class
 * @returns Object with root, left neighbor (IV), and right neighbor (V)
 * @throws Error if the root is not found in the circle
 * @example getNeighborsForKey("C") -> { root: "C", left: "F", right: "G" }
 * @example getNeighborsForKey("G") -> { root: "G", left: "C", right: "D" }
 */
export function getNeighborsForKey(root: PitchClass): {
  root: PitchClass;
  left: PitchClass;
  right: PitchClass;
} {
  const nodes = getCircleNodes();
  const idx = nodes.findIndex((n) => n.root === root);
  if (idx === -1) {
    throw new Error(`Unknown circle key: ${root}`);
  }

  const leftIndex = (idx - 1 + nodes.length) % nodes.length;
  const rightIndex = (idx + 1) % nodes.length;

  return {
    root,
    left: nodes[leftIndex].root,
    right: nodes[rightIndex].root,
  };
}

