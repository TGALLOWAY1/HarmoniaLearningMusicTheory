import { PITCH_CLASSES, pitchClassToMidi, type PitchClass } from "@/lib/theory/midiUtils";
import type { PlannedAdvancedChord, VoicingCandidateContext, VoicingStyle } from "./types";

function toIntervals(root: PitchClass, notes: PitchClass[]): number[] {
  const rootIndex = PITCH_CLASSES.indexOf(root);
  const intervals = notes.map((note) => {
    const noteIndex = PITCH_CLASSES.indexOf(note);
    return (noteIndex - rootIndex + 12) % 12;
  });

  if (!intervals.includes(0)) {
    intervals.unshift(0);
  }

  return Array.from(new Set(intervals)).sort((a, b) => a - b);
}

function buildStackedVoicing(rootMidi: number, intervals: number[], voiceCount: number): number[] {
  const expandedIntervals: number[] = [];
  let octaveLayer = 0;

  while (expandedIntervals.length < voiceCount) {
    for (const interval of intervals) {
      if (expandedIntervals.length >= voiceCount) {
        break;
      }
      expandedIntervals.push(interval + octaveLayer * 12);
    }
    octaveLayer += 1;
  }

  return expandedIntervals.map((interval) => rootMidi + interval).sort((a, b) => a - b);
}

function invert(notes: number[], inversion: number): number[] {
  const inverted = [...notes];
  for (let i = 0; i < inversion; i++) {
    const first = inverted.shift();
    if (first === undefined) {
      break;
    }
    inverted.push(first + 12);
  }
  return inverted.sort((a, b) => a - b);
}

function applyStyle(notes: number[], style: VoicingStyle): number[] {
  const voiced = [...notes].sort((a, b) => a - b);

  switch (style) {
    case "closed":
      return voiced;
    case "open": {
      if (voiced.length >= 3) {
        voiced[1] += 12;
      }
      return voiced.sort((a, b) => a - b);
    }
    case "drop2": {
      if (voiced.length >= 2) {
        const idx = voiced.length - 2;
        voiced[idx] -= 12;
      }
      return voiced.sort((a, b) => a - b);
    }
    case "drop3": {
      if (voiced.length >= 3) {
        const idx = voiced.length - 3;
        voiced[idx] -= 12;
      }
      return voiced.sort((a, b) => a - b);
    }
    case "spread": {
      for (let i = 1; i < voiced.length; i += 2) {
        voiced[i] += 12;
      }
      return voiced.sort((a, b) => a - b);
    }
    case "auto":
      return voiced;
    default:
      return voiced;
  }
}

function enforceAscending(notes: number[]): number[] {
  const result = [...notes].sort((a, b) => a - b);
  for (let i = 1; i < result.length; i++) {
    while (result[i] <= result[i - 1]) {
      result[i] += 12;
    }
  }
  return result;
}

export function normalizeVoicingToRange(notes: number[], rangeLow: number, rangeHigh: number): number[] | null {
  const voiced = enforceAscending(notes);

  let guard = 0;
  while (voiced[0] < rangeLow && guard < 16) {
    for (let i = 0; i < voiced.length; i++) {
      voiced[i] += 12;
    }
    guard += 1;
  }

  guard = 0;
  while (voiced[voiced.length - 1] > rangeHigh && guard < 16) {
    for (let i = 0; i < voiced.length; i++) {
      voiced[i] -= 12;
    }
    guard += 1;
  }

  const normalized = enforceAscending(voiced);

  if (normalized[0] < rangeLow || normalized[normalized.length - 1] > rangeHigh) {
    return null;
  }

  return normalized;
}

function stylesForContext(style: VoicingStyle, voiceCount: number): VoicingStyle[] {
  if (style !== "auto") {
    return [style];
  }

  const styles: VoicingStyle[] = ["closed", "open", "drop2", "spread"];
  if (voiceCount >= 4) {
    styles.push("drop3");
  }
  return styles;
}

function possibleOctaves(rangeLow: number, rangeHigh: number): number[] {
  const lowOct = Math.floor(rangeLow / 12) - 2;
  const highOct = Math.floor(rangeHigh / 12);
  const octaves: number[] = [];

  for (let octave = lowOct; octave <= highOct; octave++) {
    octaves.push(octave);
  }

  return octaves;
}

export function generateVoicingCandidates(
  chord: PlannedAdvancedChord,
  context: VoicingCandidateContext
): number[][] {
  const intervals = toIntervals(chord.root, chord.pitchClasses);
  const candidates: number[][] = [];
  const octaves = possibleOctaves(context.rangeLow, context.rangeHigh);

  for (const style of stylesForContext(context.style, context.voiceCount)) {
    for (const octave of octaves) {
      const rootMidi = pitchClassToMidi(chord.root, octave);
      const base = buildStackedVoicing(rootMidi, intervals, context.voiceCount);

      const inversionLimit = Math.min(3, Math.max(1, base.length - 1));
      for (let inversion = 0; inversion <= inversionLimit; inversion++) {
        const inverted = invert(base, inversion);
        const styled = applyStyle(inverted, style);
        const normalized = normalizeVoicingToRange(styled, context.rangeLow, context.rangeHigh);
        if (normalized) {
          candidates.push(normalized);
        }
      }
    }
  }

  const dedup = new Map<string, number[]>();
  for (const candidate of candidates) {
    dedup.set(candidate.join("-"), candidate);
  }

  return Array.from(dedup.values());
}
