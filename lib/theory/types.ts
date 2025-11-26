/**
 * Core Music Theory Types
 * 
 * Defines types for pitch classes, scales, and other music theory concepts.
 */

import type { PitchClass } from "./midiUtils";

export type ScaleType = "major" | "natural_minor";

export type ScaleDefinition = {
  root: PitchClass;
  type: ScaleType;
  pitchClasses: PitchClass[];
};

