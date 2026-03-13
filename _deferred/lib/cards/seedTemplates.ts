/**
 * Pure template definitions for seeding. No DB dependency.
 * Extracted for validation and to avoid importing prisma in tests.
 */
import type { PitchClass } from "../theory/midiUtils";
import { getNeighborsForKey } from "../theory/circle";
import {
  getScaleDefinition,
  getDiatonicChords,
  buildTriadFromRoot,
  type TriadQuality,
} from "../theory";
import {
  generateScaleSpellingTemplates,
  generateDiatonicChordIdTemplates,
  generateDegreeToChordTemplates,
  generateChordToDegreeTemplates,
  generateModeCharacterTemplates,
  generateProgressionPredictionTemplates,
  type CardTemplateSeed,
} from "./generators/advancedGenerators";
import type {
  ScaleSpellingMeta,
  DiatonicChordIdMeta,
  DegreeToChordMeta,
  ChordToDegreeMeta,
  ModeCharacterMeta,
  ProgressionPredictionMeta,
  TensionSelectionMeta,
} from "./advancedCardMeta";

export type TemplateDefinition = {
  slug: string;
  kind: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
  meta: unknown;
  milestoneKey: string;
};

function generateCircleNeighborCards(): TemplateDefinition[] {
  const allPitchClasses: PitchClass[] = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  ];

  const makeCard = (
    slug: string,
    majorRoot: PitchClass,
    correct: PitchClass,
    question: string,
    direction: "clockwise" | "counterclockwise"
  ): TemplateDefinition => {
    const distractors = allPitchClasses
      .filter((p) => p !== correct && p !== majorRoot)
      .slice(0, 3);
    const options = [correct, ...distractors];
    return {
      slug,
      kind: "circle_neighbor_key",
      question,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
      meta: { majorRoot, direction },
      milestoneKey: "CIRCLE_OF_FIFTHS",
    };
  };

  const cards: TemplateDefinition[] = [];
  const dNeighbors = getNeighborsForKey("D");
  cards.push(makeCard("neighbor-of-d-major", "D", dNeighbors.right, "What is the next key clockwise from D major on the circle of fifths?", "clockwise"));
  cards.push(makeCard("neighbor-d-major-counterclockwise", "D", dNeighbors.left, "What is the next key counterclockwise from D major on the circle of fifths?", "counterclockwise"));
  const cNeighbors = getNeighborsForKey("C");
  cards.push(makeCard("neighbor-of-c-major", "C", cNeighbors.left, "What is the next key counterclockwise from C major on the circle of fifths?", "counterclockwise"));
  cards.push(makeCard("neighbor-c-major-clockwise", "C", cNeighbors.right, "What is the next key clockwise from C major on the circle of fifths?", "clockwise"));
  const gNeighbors = getNeighborsForKey("G");
  cards.push(makeCard("neighbor-of-g-major", "G", gNeighbors.right, "What is the next key clockwise from G major on the circle of fifths?", "clockwise"));
  cards.push(makeCard("neighbor-g-major-counterclockwise", "G", gNeighbors.left, "What is the next key counterclockwise from G major on the circle of fifths?", "counterclockwise"));
  return cards;
}

const STATIC_CARDS: TemplateDefinition[] = [
  {
    slug: "c-major-chord-notes",
    kind: "notes_from_chord",
    question: "Which notes make a C major triad?",
    optionA: "C – E – G",
    optionB: "C – D# – G",
    optionC: "C – F – A",
    optionD: "C – E – A",
    correctIndex: 0,
    meta: { root: "C", quality: "maj", type: "triad", notes: ["C", "E", "G"] },
    milestoneKey: "TRIADS",
  },
  {
    slug: "which-chord-c-e-g",
    kind: "chord_from_notes",
    question: "Which chord is built from C – E – G?",
    optionA: "C major",
    optionB: "A minor",
    optionC: "F major",
    optionD: "G major",
    correctIndex: 0,
    meta: { root: "C", quality: "maj", notes: ["C", "E", "G"] },
    milestoneKey: "TRIADS",
  },
  {
    slug: "key-signature-one-sharp",
    kind: "key_signature",
    question: "Which major key has exactly one sharp?",
    optionA: "G major",
    optionB: "D major",
    optionC: "F major",
    optionD: "C major",
    correctIndex: 0,
    meta: { sharps: 1 },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  {
    slug: "c-at-12-oclock",
    kind: "circle_geometry",
    question: "Which key sits at 12 o'clock on the circle of fifths?",
    optionA: "C",
    optionB: "G",
    optionC: "F",
    optionD: "D",
    correctIndex: 0,
    meta: { clockPosition: 12, majorRoot: "C" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  {
    slug: "relative-minor-of-g",
    kind: "circle_relative_minor",
    question: "What is the relative minor of G major?",
    optionA: "E minor",
    optionB: "D minor",
    optionC: "B minor",
    optionD: "A minor",
    correctIndex: 0,
    meta: { majorRoot: "G" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  {
    slug: "relative-minor-of-c",
    kind: "circle_relative_minor",
    question: "What is the relative minor of C major?",
    optionA: "A minor",
    optionB: "E minor",
    optionC: "D minor",
    optionD: "G minor",
    correctIndex: 0,
    meta: { majorRoot: "C" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  {
    slug: "relative-minor-of-d",
    kind: "circle_relative_minor",
    question: "What is the relative minor of D major?",
    optionA: "B minor",
    optionB: "A minor",
    optionC: "E minor",
    optionD: "F# minor",
    correctIndex: 0,
    meta: { majorRoot: "D" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  ...generateCircleNeighborCards(),
];

export function generateOptionsForSeed(seed: CardTemplateSeed): { optionA: string; optionB: string; optionC: string; optionD: string; correctIndex: number } {
  const allPitchClasses: PitchClass[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  if (seed.kind === "scale_spelling") {
    const meta = seed.meta as ScaleSpellingMeta;
    const scale = getScaleDefinition(meta.root, meta.type);
    const correctNotes = scale.pitchClasses;
    const fmt = (n: PitchClass[]) => n.join(" – ");
    const swapped = meta.type === "major" ? getScaleDefinition(meta.root, "natural_minor").pitchClasses : getScaleDefinition(meta.root, "major").pitchClasses;
    const shifted = correctNotes.map((pc) => allPitchClasses[(allPitchClasses.indexOf(pc) + 1) % 12]);
    const correctStr = fmt(correctNotes);
    const swappedStr = fmt(swapped);
    const shiftedStr = fmt(shifted);
    const baseMissing = correctNotes.slice(0, -1);
    const used = new Set([correctStr, swappedStr, shiftedStr]);
    let missingStr = "";
    for (const replacement of allPitchClasses) {
      if (baseMissing.includes(replacement)) continue;
      const candidate = fmt([...baseMissing, replacement]);
      if (!used.has(candidate)) {
        missingStr = candidate;
        break;
      }
    }
    if (!missingStr) {
      missingStr = fmt([...baseMissing, allPitchClasses.find((p) => !baseMissing.includes(p))!]);
    }
    return { optionA: correctStr, optionB: shiftedStr, optionC: swappedStr, optionD: missingStr, correctIndex: 0 };
  }
  const pickOptions = (correct: string, others: string[]) => {
    const opts = [correct, ...others.sort((a, b) => a.localeCompare(b)).slice(0, 3)];
    return { optionA: opts[0], optionB: opts[1], optionC: opts[2], optionD: opts[3], correctIndex: 0 };
  };
  if (seed.kind === "diatonic_chord_id") {
    const meta = seed.meta as DiatonicChordIdMeta;
    const ds = getDiatonicChords(meta.keyRoot, meta.keyType);
    const degrees = ds.triads.map((t) => t.degree);
    return pickOptions(meta.degree, degrees.filter((d) => d !== meta.degree));
  }
  if (seed.kind === "degree_to_chord") {
    const meta = seed.meta as DegreeToChordMeta;
    const ds = getDiatonicChords(meta.keyRoot, meta.keyType);
    const chords = ds.triads.map((t) => `${t.triad.root} ${t.triad.quality === "maj" ? "major" : t.triad.quality === "min" ? "minor" : t.triad.quality === "dim" ? "diminished" : "augmented"}`);
    return pickOptions(meta.correctChord, chords.filter((c) => c !== meta.correctChord));
  }
  if (seed.kind === "chord_to_degree") {
    const meta = seed.meta as ChordToDegreeMeta;
    const ds = getDiatonicChords(meta.keyRoot, meta.keyType);
    const degrees = ds.triads.map((t) => t.degree);
    return pickOptions(meta.correctDegree, degrees.filter((d) => d !== meta.correctDegree));
  }
  if (seed.kind === "mode_character") {
    const meta = seed.meta as ModeCharacterMeta;
    const chars = ["Raised 6th", "Lowered 7th", "Lowered 2nd", "Raised 4th", "Lowered 3rd"];
    return pickOptions(meta.characteristic, chars.filter((c) => c !== meta.characteristic));
  }
  if (seed.kind === "progression_prediction") {
    const meta = seed.meta as ProgressionPredictionMeta;
    const ds = getDiatonicChords(meta.keyRoot, meta.keyType);
    const degrees = ds.triads.map((t) => t.degree);
    return pickOptions(meta.correctNext, degrees.filter((d) => d !== meta.correctNext));
  }
  if (seed.kind === "tension_selection") {
    const meta = seed.meta as TensionSelectionMeta;
    const tensions = ["9th", "11th", "13th", "b9", "#11", "b13"];
    return pickOptions(meta.correctTension, tensions.filter((t) => t !== meta.correctTension));
  }
  return { optionA: "Option A", optionB: "Option B", optionC: "Option C", optionD: "Option D", correctIndex: 0 };
}

export function generateSlug(seed: CardTemplateSeed, index: number): string {
  const base = seed.kind.replace(/_/g, "-");
  if (seed.kind === "scale_spelling") {
    const m = seed.meta as ScaleSpellingMeta;
    return `${base}-${m.root.toLowerCase()}-${m.type}-${index}`;
  }
  if (seed.kind === "diatonic_chord_id") {
    const m = seed.meta as DiatonicChordIdMeta;
    return `${base}-${m.keyRoot.toLowerCase()}-${m.keyType}-${m.degree.toLowerCase()}-${index}`;
  }
  if (seed.kind === "degree_to_chord") {
    const m = seed.meta as DegreeToChordMeta;
    return `${base}-${m.keyRoot.toLowerCase()}-${m.degree.toLowerCase()}-${index}`;
  }
  if (seed.kind === "chord_to_degree") {
    const m = seed.meta as ChordToDegreeMeta;
    return `${base}-${m.keyRoot.toLowerCase()}-${m.chord.toLowerCase().replace(/\s+/g, "-")}-${index}`;
  }
  if (seed.kind === "mode_character") {
    const m = seed.meta as ModeCharacterMeta;
    return `${base}-${m.mode}-${m.root.toLowerCase()}-${index}`;
  }
  if (seed.kind === "progression_prediction") {
    const m = seed.meta as ProgressionPredictionMeta;
    return `${base}-${m.keyRoot.toLowerCase()}-${m.currentChords.join("-").toLowerCase()}-${index}`;
  }
  if (seed.kind === "tension_selection") {
    const m = seed.meta as TensionSelectionMeta;
    return `${base}-${m.keyRoot.toLowerCase()}-${m.chord.toLowerCase().replace(/\s+/g, "-")}-${index}`;
  }
  return `${base}-${index}`;
}

export function getAllAdvancedCards(): Array<{ seed: CardTemplateSeed; milestoneKey: string }> {
  const foundation = generateScaleSpellingTemplates().filter((c) => c.kind === "scale_spelling" && (c.meta as ScaleSpellingMeta).type === "major" && c.milestoneKey === "FOUNDATION");
  const naturalMinor = generateScaleSpellingTemplates().filter((c) => {
    if (c.kind !== "scale_spelling") return false;
    const m = c.meta as ScaleSpellingMeta;
    return c.milestoneKey === "NATURAL_MINOR" && ["natural_minor", "dorian", "mixolydian", "phrygian"].includes(m.type);
  });
  const triad = generateDiatonicChordIdTemplates().filter((c) => c.kind === "diatonic_chord_id" && c.milestoneKey === "DIATONIC_TRIADS" && ["C", "G", "F", "D", "A", "E"].includes((c.meta as DiatonicChordIdMeta).keyRoot));
  const diatonic = [
    ...generateDiatonicChordIdTemplates().filter((c) => c.milestoneKey === "DIATONIC_TRIADS"),
    ...generateDegreeToChordTemplates().filter((c) => c.milestoneKey === "DIATONIC_TRIADS"),
  ];
  const circle = generateProgressionPredictionTemplates().filter((c) => c.milestoneKey === "DIATONIC_TRIADS");
  const seventh = generateChordToDegreeTemplates().filter((c) => c.milestoneKey === "DIATONIC_TRIADS");
  const mode = generateModeCharacterTemplates().filter((c) => c.milestoneKey === "MODES");
  return [
    ...foundation.map((s) => ({ seed: s, milestoneKey: "FOUNDATION" })),
    ...naturalMinor.map((s) => ({ seed: s, milestoneKey: "NATURAL_MINOR" })),
    ...triad.map((s) => ({ seed: s, milestoneKey: "TRIADS" })),
    ...diatonic.map((s) => ({ seed: s, milestoneKey: "DIATONIC_TRIADS" })),
    ...circle.map((s) => ({ seed: s, milestoneKey: "CIRCLE_OF_FIFTHS" })),
    ...seventh.map((s) => ({ seed: s, milestoneKey: "SEVENTH_CHORDS" })),
    ...mode.map((s) => ({ seed: s, milestoneKey: "MODES" })),
  ];
}

/** All template definitions for integrity validation. No DB. */
export function getAllTemplateDefinitionsForValidation(): TemplateDefinition[] {
  const cMajor = buildTriadFromRoot("C", "maj");
  const staticWithNotes = STATIC_CARDS.map((c) => {
    const meta = { ...(c.meta as object) };
    if (c.slug === "c-major-chord-notes") (meta as Record<string, unknown>).notes = cMajor.pitchClasses;
    if (c.slug === "which-chord-c-e-g") (meta as Record<string, unknown>).notes = cMajor.pitchClasses;
    return { ...c, meta };
  });

  const advanced: TemplateDefinition[] = [];
  const allAdvanced = getAllAdvancedCards();
  for (let i = 0; i < allAdvanced.length; i++) {
    const { seed, milestoneKey } = allAdvanced[i];
    const options = generateOptionsForSeed(seed);
    advanced.push({
      slug: generateSlug(seed, i),
      kind: seed.kind,
      question: seed.prompt,
      optionA: options.optionA,
      optionB: options.optionB,
      optionC: options.optionC,
      optionD: options.optionD,
      correctIndex: options.correctIndex,
      meta: seed.meta,
      milestoneKey,
    });
  }

  return [...staticWithNotes, ...advanced];
}

/** Static cards for seed (used by prisma seed). */
export { STATIC_CARDS };
