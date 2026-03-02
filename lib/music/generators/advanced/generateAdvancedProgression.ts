import {
  buildSeventhFromScale,
  buildTriadFromScale,
  formatChordSymbol,
  type SeventhQuality,
  type TriadQuality,
} from "@/lib/theory/chord";
import { midiToNoteName, PITCH_CLASSES, type PitchClass } from "@/lib/theory/midiUtils";
import { getScaleDefinition } from "@/lib/theory/scale";
import type { ScaleType } from "@/lib/theory/types";

import { applyComplexityExtensions, type QualityHint } from "./extensions";
import {
  applyTritoneSubstitutions,
  injectSecondaryDominants,
  insertPassingDiminished,
  insertSuspensions,
} from "./substitutions";
import type {
  AdvancedProgressionOptions,
  AdvancedProgressionResult,
  PlannedAdvancedChord,
} from "./types";
import { pickBestVoiceLedCandidate } from "./voiceLeading";
import { generateVoicingCandidates } from "./voicing";

const MODE_TO_SCALE_TYPE: Record<AdvancedProgressionOptions["mode"], ScaleType> = {
  ionian: "major",
  aeolian: "natural_minor",
  dorian: "dorian",
  mixolydian: "mixolydian",
  phrygian: "phrygian",
};

const MAJORISH_ROMANS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"] as const;
const MINORISH_ROMANS = ["i", "ii°", "III", "iv", "v", "bVI", "bVII"] as const;

const MAJORISH_TEMPLATES: number[][] = [
  [0, 3, 4, 0],
  [0, 5, 3, 4],
  [0, 1, 4, 0],
  [0, 5, 1, 4],
  [0, 3, 1, 4],
];

const MINORISH_TEMPLATES: number[][] = [
  [0, 5, 3, 6],
  [0, 3, 6, 4],
  [0, 6, 5, 4],
  [0, 5, 1, 4],
  [0, 3, 4, 0],
];

function clampVoiceRange(low: number, high: number): { low: number; high: number } {
  if (low <= high) {
    return { low, high };
  }
  return { low: high, high: low };
}

function createSeededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function transposePitchClass(root: PitchClass, semitones: number): PitchClass {
  const index = PITCH_CLASSES.indexOf(root);
  return PITCH_CLASSES[(index + semitones + 120) % 12];
}

function dominantPitchClasses(root: PitchClass): PitchClass[] {
  return [
    root,
    transposePitchClass(root, 4),
    transposePitchClass(root, 7),
    transposePitchClass(root, 10),
  ];
}

function adaptLength(template: number[], numChords: number, random: () => number): number[] {
  if (numChords <= 0) {
    return [];
  }

  if (template.length === numChords) {
    return [...template];
  }

  if (template.length > numChords) {
    return template.slice(0, numChords);
  }

  const padded = [...template];
  const continuationPool = [1, 3, 5, 4, 6, 0];

  while (padded.length < numChords) {
    const idx = Math.floor(random() * continuationPool.length);
    padded.push(continuationPool[idx] ?? 0);
  }

  return padded;
}

function familyForDegreeIndex(degreeIndex: number): "tonic" | "subdominant" | "dominant" | null {
  if ([0, 2, 5].includes(degreeIndex)) return "tonic";
  if ([1, 3].includes(degreeIndex)) return "subdominant";
  if ([4, 6].includes(degreeIndex)) return "dominant";
  return null;
}

function familyAlternates(degreeIndex: number): number[] {
  const family = familyForDegreeIndex(degreeIndex);
  if (family === "tonic") return [0, 2, 5].filter((idx) => idx !== degreeIndex);
  if (family === "subdominant") return [1, 3].filter((idx) => idx !== degreeIndex);
  if (family === "dominant") return [4, 6].filter((idx) => idx !== degreeIndex);
  return [];
}

function maybeApplyFunctionalSwap(
  degreeIndices: number[],
  enabled: boolean,
  random: () => number
): { indices: number[]; swappedIndex: number | null } {
  if (!enabled || degreeIndices.length < 3) {
    return { indices: degreeIndices, swappedIndex: null };
  }

  if (random() < 0.45) {
    return { indices: degreeIndices, swappedIndex: null };
  }

  const interior = Array.from({ length: Math.max(0, degreeIndices.length - 2) }, (_, i) => i + 1);
  const interiorPick = interior[Math.floor(random() * interior.length)];

  if (interiorPick === undefined) {
    return { indices: degreeIndices, swappedIndex: null };
  }

  const current = degreeIndices[interiorPick] ?? 0;
  const alternates = familyAlternates(current);
  if (alternates.length === 0) {
    return { indices: degreeIndices, swappedIndex: null };
  }

  const replacement = alternates[Math.floor(random() * alternates.length)] ?? current;
  const next = [...degreeIndices];
  next[interiorPick] = replacement;

  return {
    indices: next,
    swappedIndex: interiorPick,
  };
}

function mapTriadToSymbolQuality(quality: TriadQuality): string {
  switch (quality) {
    case "maj":
      return "maj";
    case "min":
      return "min";
    case "dim":
      return "dim";
    case "aug":
      return "aug";
    default:
      return "maj";
  }
}

function mapSeventhToSymbolQuality(quality: SeventhQuality): string {
  switch (quality) {
    case "maj7":
      return "maj7";
    case "min7":
      return "min7";
    case "dom7":
      return "dom7";
    case "half-dim7":
      return "half-dim7";
    case "dim7":
      return "dim7";
    default:
      return "maj7";
  }
}

function qualityHintFromTriad(quality: TriadQuality, isDominant: boolean): QualityHint {
  if (isDominant) return "dom";
  if (quality === "maj") return "maj";
  if (quality === "dim") return "dim";
  return "min";
}

function buildDiatonicChordPlan(params: {
  root: PitchClass;
  degreeLabel: string;
  degreeIndex: number;
  scale: ReturnType<typeof getScaleDefinition>;
  complexity: AdvancedProgressionOptions["complexity"];
  random: () => number;
  kind: PlannedAdvancedChord["kind"];
}): PlannedAdvancedChord {
  const { root, degreeLabel, degreeIndex, scale, complexity, random, kind } = params;

  const triad = buildTriadFromScale(scale, degreeIndex);
  const seventh = buildSeventhFromScale(scale, degreeIndex);

  // In advanced mode, treat degree 5 as a dominant center to improve directed motion.
  const isDominant = degreeIndex === 4 || degreeLabel.startsWith("V/") || degreeLabel.startsWith("sub(V");
  const triadQuality = isDominant ? "maj" : triad.quality;
  const qualityHint = qualityHintFromTriad(triad.quality, isDominant);

  const basePitchClasses =
    complexity === 1
      ? buildTriadFromScale(scale, degreeIndex).pitchClasses
      : isDominant
        ? dominantPitchClasses(root)
        : buildSeventhFromScale(scale, degreeIndex).pitchClasses;

  const expandedPitchClasses = applyComplexityExtensions({
    root,
    basePitchClasses,
    complexity,
    qualityHint,
    isDominant,
    random,
  });

  let symbolQuality: string;
  if (complexity === 1) {
    symbolQuality = mapTriadToSymbolQuality(triadQuality);
  } else if (isDominant) {
    symbolQuality = "dom7";
  } else {
    symbolQuality = mapSeventhToSymbolQuality(seventh.quality);
  }

  let symbol = formatChordSymbol(root, symbolQuality);

  if (complexity === 3 && qualityHint !== "dim") {
    symbol = `${symbol}(9)`;
  }

  if (complexity >= 4 && isDominant) {
    symbol = `${root}7alt`;
  }

  if (complexity >= 3 && qualityHint === "maj" && random() > 0.72) {
    symbol = `${symbol}(13)`;
  }

  return {
    degreeLabel,
    symbol,
    root,
    pitchClasses: expandedPitchClasses,
    kind,
    isDominant,
  };
}

function limitLength(chords: PlannedAdvancedChord[], maxLength: number): PlannedAdvancedChord[] {
  if (chords.length <= maxLength) {
    return chords;
  }
  return chords.slice(0, maxLength);
}

export function generateAdvancedProgression(
  options: AdvancedProgressionOptions
): AdvancedProgressionResult {
  const numChords = options.numChords ?? 4;
  const scaleType = MODE_TO_SCALE_TYPE[options.mode] ?? "major";
  const romans = options.mode === "ionian" || options.mode === "mixolydian" ? MAJORISH_ROMANS : MINORISH_ROMANS;

  const seed = options.seed ?? Math.floor(Math.random() * 2_147_483_647);
  const random = createSeededRandom(seed);

  const chosenTemplatePool = options.mode === "ionian" || options.mode === "mixolydian" ? MAJORISH_TEMPLATES : MINORISH_TEMPLATES;
  const template = chosenTemplatePool[Math.floor(random() * chosenTemplatePool.length)] ?? chosenTemplatePool[0];

  const baseDegreeIndices = adaptLength(template, numChords, random);
  const functionalSwap = maybeApplyFunctionalSwap(
    baseDegreeIndices,
    options.useFunctionalSubstitutions ?? options.complexity >= 3,
    random
  );

  const scale = getScaleDefinition(options.rootKey, scaleType);
  const plannedDiatonic = functionalSwap.indices.map((degreeIndex, idx) => {
    const root = scale.pitchClasses[degreeIndex] ?? scale.pitchClasses[0];
    const degreeLabel = romans[degreeIndex] ?? romans[0];

    return buildDiatonicChordPlan({
      root,
      degreeLabel,
      degreeIndex,
      scale,
      complexity: options.complexity,
      random,
      kind: functionalSwap.swappedIndex === idx ? "functional-substitution" : "diatonic",
    });
  });

  let planned = plannedDiatonic;
  planned = injectSecondaryDominants(planned, options, random);
  planned = applyTritoneSubstitutions(planned, options, random);
  planned = insertPassingDiminished(planned, options, random);
  planned = insertSuspensions(planned, options, random);

  planned = limitLength(planned, Math.max(numChords, 4) + 4);

  const { low, high } = clampVoiceRange(options.rangeLow, options.rangeHigh);
  const center = (low + high) / 2;

  const voiced = [] as AdvancedProgressionResult["chords"];
  const costs: number[] = [];
  let previousVoicing: number[] | null = null;

  for (const chord of planned) {
    const candidates = generateVoicingCandidates(chord, {
      style: options.voicingStyle,
      voiceCount: options.voiceCount,
      rangeLow: low,
      rangeHigh: high,
    });

    const selection = pickBestVoiceLedCandidate(previousVoicing, candidates, center);
    const finalVoicing = [...selection.voicing].sort((a, b) => a - b);

    voiced.push({
      degreeLabel: chord.degreeLabel,
      symbol: chord.symbol,
      midi: finalVoicing,
      notes: finalVoicing.map((midi) => midiToNoteName(midi)),
    });

    costs.push(selection.cost);
    previousVoicing = finalVoicing;
  }

  return {
    chords: voiced,
    labels: voiced.map((chord) => `${chord.degreeLabel} - ${chord.symbol}`),
    debug: {
      seed,
      planned,
      voiceLeadingCosts: costs,
    },
  };
}
