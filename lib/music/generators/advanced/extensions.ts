import { PITCH_CLASSES, type PitchClass } from "@/lib/theory/midiUtils";
import type { AdvancedComplexity } from "./types";

export type QualityHint = "maj" | "min" | "dim" | "dom";

export type ExtensionInput = {
  root: PitchClass;
  basePitchClasses: PitchClass[];
  complexity: AdvancedComplexity;
  qualityHint: QualityHint;
  isDominant: boolean;
  random: () => number;
};

function pitchClassOffset(root: PitchClass, semitones: number): PitchClass {
  const rootIndex = PITCH_CLASSES.indexOf(root);
  const index = (rootIndex + semitones + 120) % 12;
  return PITCH_CLASSES[index];
}

function intervalFromRoot(root: PitchClass, note: PitchClass): number {
  const rootIndex = PITCH_CLASSES.indexOf(root);
  const noteIndex = PITCH_CLASSES.indexOf(note);
  return (noteIndex - rootIndex + 12) % 12;
}

function uniquePitchClasses(root: PitchClass, intervals: number[]): PitchClass[] {
  const sortedUnique = Array.from(new Set(intervals.map((interval) => (interval + 120) % 12))).sort((a, b) => a - b);
  return sortedUnique.map((interval) => pitchClassOffset(root, interval));
}

function preferredSeventh(qualityHint: QualityHint): number {
  if (qualityHint === "maj") return 11;
  if (qualityHint === "dim") return 9;
  return 10;
}

export function applyComplexityExtensions(input: ExtensionInput): PitchClass[] {
  const { root, basePitchClasses, complexity, qualityHint, isDominant, random } = input;

  const intervals = basePitchClasses.map((pc) => intervalFromRoot(root, pc));

  if (complexity >= 2) {
    intervals.push(preferredSeventh(qualityHint));
  }

  if (complexity >= 3 && qualityHint !== "dim") {
    intervals.push(2); // add9
    if (qualityHint === "maj" || qualityHint === "dom") {
      intervals.push(9); // add13
    }
  }

  if (complexity >= 4 && isDominant) {
    const alterations = [1, 3, 8] as const; // b9, #9, b13
    const picked = alterations[Math.floor(random() * alterations.length)] ?? 1;
    intervals.push(picked);
    if (random() > 0.55) {
      intervals.push(1);
    }
  }

  return uniquePitchClasses(root, intervals);
}

export function getComplexitySuffix(complexity: AdvancedComplexity, isDominant: boolean): string {
  if (complexity === 1) return "";
  if (complexity === 2) return "7";
  if (complexity === 3) return "9";
  if (isDominant && complexity >= 4) return "7alt";
  return "9";
}
