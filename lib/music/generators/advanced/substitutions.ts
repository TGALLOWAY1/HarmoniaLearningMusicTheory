import { PITCH_CLASSES, type PitchClass } from "@/lib/theory/midiUtils";
import type { AdvancedProgressionOptions, PlannedAdvancedChord } from "./types";

function transposePitchClass(root: PitchClass, semitones: number): PitchClass {
  const index = PITCH_CLASSES.indexOf(root);
  return PITCH_CLASSES[(index + semitones + 120) % 12];
}

function toIntervals(root: PitchClass, notes: PitchClass[]): number[] {
  const rootIndex = PITCH_CLASSES.indexOf(root);
  return notes.map((note) => {
    const noteIndex = PITCH_CLASSES.indexOf(note);
    return (noteIndex - rootIndex + 12) % 12;
  });
}

function fromIntervals(root: PitchClass, intervals: number[]): PitchClass[] {
  return Array.from(new Set(intervals.map((interval) => transposePitchClass(root, interval))));
}

function buildDominant(root: PitchClass, degreeLabel: string, kind: PlannedAdvancedChord["kind"]): PlannedAdvancedChord {
  return {
    degreeLabel,
    symbol: `${root}7`,
    root,
    pitchClasses: fromIntervals(root, [0, 4, 7, 10]),
    kind,
    isDominant: true,
  };
}

export function injectSecondaryDominants(
  chords: PlannedAdvancedChord[],
  options: AdvancedProgressionOptions,
  random: () => number
): PlannedAdvancedChord[] {
  if (!options.useSecondaryDominants || chords.length < 2) {
    return chords;
  }

  const result: PlannedAdvancedChord[] = [];
  let insertions = 0;

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    if (i > 0 && insertions < 2 && random() > 0.64) {
      const secondaryRoot = transposePitchClass(chord.root, 7);
      result.push(buildDominant(secondaryRoot, `V/${chord.degreeLabel}`, "secondary-dominant"));
      insertions += 1;
    }
    result.push(chord);
  }

  if (insertions === 0) {
    const target = chords[chords.length - 1];
    const secondaryRoot = transposePitchClass(target.root, 7);
    result.splice(Math.max(0, result.length - 1), 0, buildDominant(secondaryRoot, `V/${target.degreeLabel}`, "secondary-dominant"));
  }

  return result;
}

export function applyTritoneSubstitutions(
  chords: PlannedAdvancedChord[],
  options: AdvancedProgressionOptions,
  random: () => number
): PlannedAdvancedChord[] {
  if (!options.useTritoneSubstitution) {
    return chords;
  }

  return chords.map((chord) => {
    if (!chord.isDominant || random() < 0.5) {
      return chord;
    }

    const originalIntervals = toIntervals(chord.root, chord.pitchClasses);
    const substitutedRoot = transposePitchClass(chord.root, 6);

    return {
      degreeLabel: `sub(${chord.degreeLabel})`,
      symbol: `${substitutedRoot}7`,
      root: substitutedRoot,
      pitchClasses: fromIntervals(substitutedRoot, originalIntervals),
      kind: "tritone-substitution",
      isDominant: true,
    } satisfies PlannedAdvancedChord;
  });
}

function chromaticDistance(from: PitchClass, to: PitchClass): number {
  const fromIndex = PITCH_CLASSES.indexOf(from);
  const toIndex = PITCH_CLASSES.indexOf(to);
  return (toIndex - fromIndex + 12) % 12;
}

export function insertPassingDiminished(
  chords: PlannedAdvancedChord[],
  options: AdvancedProgressionOptions,
  random: () => number
): PlannedAdvancedChord[] {
  if (!options.usePassingChords || chords.length < 2) {
    return chords;
  }

  const result: PlannedAdvancedChord[] = [];
  let insertions = 0;

  for (let i = 0; i < chords.length - 1; i++) {
    const current = chords[i];
    const next = chords[i + 1];
    result.push(current);

    const movement = chromaticDistance(current.root, next.root);
    const isWholeStep = movement === 2 || movement === 10;
    if (!isWholeStep || insertions >= 2 || random() < 0.42) {
      continue;
    }

    const step = movement === 2 ? 1 : -1;
    const passingRoot = transposePitchClass(current.root, step);
    result.push({
      degreeLabel: "pass°",
      symbol: `${passingRoot}°7`,
      root: passingRoot,
      pitchClasses: fromIntervals(passingRoot, [0, 3, 6, 9]),
      kind: "passing",
      isDominant: false,
    });
    insertions += 1;
  }

  result.push(chords[chords.length - 1]);
  return result;
}

export function insertSuspensions(
  chords: PlannedAdvancedChord[],
  options: AdvancedProgressionOptions,
  random: () => number
): PlannedAdvancedChord[] {
  if (!options.useSuspensions) {
    return chords;
  }

  const result: PlannedAdvancedChord[] = [];
  let insertions = 0;

  for (const chord of chords) {
    if (chord.isDominant && insertions < 2 && random() > 0.55) {
      result.push({
        degreeLabel: `${chord.degreeLabel}(sus4)`,
        symbol: `${chord.root}sus4`,
        root: chord.root,
        pitchClasses: fromIntervals(chord.root, [0, 5, 7, 10]),
        kind: "suspension",
        isDominant: true,
      });
      insertions += 1;
    }

    result.push(chord);
  }

  return result;
}
