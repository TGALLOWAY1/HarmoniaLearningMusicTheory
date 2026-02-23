/**
 * Shared seed logic for dev (destructive) and prod (non-destructive) modes.
 * seed.dev: wipes and reseeds.
 * seed.prod: upserts baseline content only; NEVER touches attempts/states.
 */

import { prisma } from "../lib/db";
import {
  generateScaleSpellingTemplates,
  generateDiatonicChordIdTemplates,
  generateDegreeToChordTemplates,
  generateChordToDegreeTemplates,
  generateModeCharacterTemplates,
  generateProgressionPredictionTemplates,
  type CardTemplateSeed,
} from "../lib/cards/generators/advancedGenerators";
import {
  getScaleDefinition,
  getDiatonicChords,
  buildTriadFromRoot,
  type TriadQuality,
} from "../lib/theory";
import type { PitchClass } from "../lib/theory/midiUtils";
import type { ScaleType } from "../lib/theory/types";
import type {
  ScaleSpellingMeta,
  DiatonicChordIdMeta,
  DegreeToChordMeta,
  ChordToDegreeMeta,
  ModeCharacterMeta,
  ProgressionPredictionMeta,
  TensionSelectionMeta,
} from "../lib/cards/advancedCardMeta";
import type { ScaleMembership } from "../lib/cards/basicCardMeta";

export type SeedMode = "dev" | "prod";

const STATIC_CARDS = [
  {
    slug: "c-major-chord-notes",
    kind: "notes_from_chord",
    question: "Which notes make a C major triad?",
    optionA: "C – E – G",
    optionB: "C – D# – G",
    optionC: "C – F – A",
    optionD: "C – E – A",
    correctIndex: 0,
    meta: { root: "C", quality: "maj", type: "triad", notes: ["C", "E", "G"] as PitchClass[] },
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
    meta: { root: "C", quality: "maj", notes: ["C", "E", "G"] as PitchClass[] },
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
    meta: { clockPosition: 12 },
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
  {
    slug: "neighbor-of-d-major",
    kind: "circle_neighbor_key",
    question: "Which of these is a neighbor (IV or V) of D major on the circle?",
    optionA: "C",
    optionB: "G",
    optionC: "F",
    optionD: "A",
    correctIndex: 3,
    meta: { majorRoot: "D" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  {
    slug: "neighbor-of-c-major",
    kind: "circle_neighbor_key",
    question: "Which of these is a neighbor (IV or V) of C major on the circle?",
    optionA: "F",
    optionB: "G",
    optionC: "D",
    optionD: "A",
    correctIndex: 0,
    meta: { majorRoot: "C" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
  {
    slug: "neighbor-of-g-major",
    kind: "circle_neighbor_key",
    question: "Which of these is a neighbor (IV or V) of G major on the circle?",
    optionA: "C",
    optionB: "D",
    optionC: "F",
    optionD: "A",
    correctIndex: 0,
    meta: { majorRoot: "G" },
    milestoneKey: "CIRCLE_OF_FIFTHS",
  },
];

const MILESTONES = [
  { key: "FOUNDATION", title: "Notes, intervals & major scale", description: "Learn natural notes, sharps/flats, whole/half steps, and how to build the major scale.", order: 1, isUnlocked: true, isCompleted: false, progress: 0 },
  { key: "NATURAL_MINOR", title: "Natural minor & relative keys", description: "Understand natural minor scales and how they relate to their relative majors.", order: 2, isUnlocked: false, isCompleted: false, progress: 0 },
  { key: "TRIADS", title: "Major & minor triads", description: "Build and recognize basic triads that show up constantly in EDM and bass music.", order: 3, isUnlocked: false, isCompleted: false, progress: 0 },
  { key: "DIATONIC_TRIADS", title: "Diatonic chords in a key", description: "Map the chords inside a key with Roman numerals, and see them on the piano roll.", order: 4, isUnlocked: false, isCompleted: false, progress: 0 },
  { key: "CIRCLE_OF_FIFTHS", title: "Circle of fifths", description: "Use the circle to navigate keys, find neighbors, and connect harmony visually.", order: 5, isUnlocked: false, isCompleted: false, progress: 0 },
  { key: "SEVENTH_CHORDS", title: "Seventh chords", description: "Add 7ths to your chords for richer harmonies and more expressive EDM progressions.", order: 6, isUnlocked: false, isCompleted: false, progress: 0 },
  { key: "MODES", title: "Useful modes for bass music", description: "Explore Dorian, Mixolydian and Phrygian, and how they color bass-heavy tracks.", order: 7, isUnlocked: false, isCompleted: false, progress: 0 },
  { key: "ADVANCED", title: "Advanced harmony", description: "Dim / aug chords, borrowed chords and secondary dominants (future expansion).", order: 8, isUnlocked: false, isCompleted: false, progress: 0 },
];

function identifyTriadFromNotes(notes: PitchClass[]): { root: PitchClass; quality: TriadQuality } | null {
  if (notes.length !== 3) return null;
  const allPitchClasses: PitchClass[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  for (const potentialRoot of notes) {
    try {
      for (const quality of ["maj", "min", "dim", "aug"] as TriadQuality[]) {
        const triad = buildTriadFromRoot(potentialRoot, quality);
        const triadNotes = new Set(triad.pitchClasses);
        const inputNotes = new Set(notes);
        if (triadNotes.size === inputNotes.size && [...triadNotes].every((n) => inputNotes.has(n))) {
          return { root: potentialRoot, quality };
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function notesMatch(notes1: PitchClass[], notes2: PitchClass[]): boolean {
  if (notes1.length !== notes2.length) return false;
  const set1 = new Set(notes1);
  const set2 = new Set(notes2);
  return set1.size === set2.size && [...set1].every((n) => set2.has(n));
}

async function attachScaleMemberships() {
  const chordCards = await prisma.cardTemplate.findMany({
    where: { kind: { in: ["notes_from_chord", "chord_from_notes"] } },
  });
  if (chordCards.length === 0) return;
  const allPitchClasses: PitchClass[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const keyTypes: Array<{ type: ScaleType }> = [{ type: "major" }, { type: "natural_minor" }];
  for (const card of chordCards) {
    if (!card.meta || typeof card.meta !== "object") continue;
    const meta = card.meta as Record<string, unknown>;
    let chordRoot: PitchClass | null = null;
    let chordQuality: TriadQuality | null = null;
    let chordNotes: PitchClass[] | null = null;
    if (card.kind === "notes_from_chord" && meta.root && meta.quality) {
      chordRoot = meta.root as PitchClass;
      chordQuality = meta.quality as TriadQuality;
      try {
        chordNotes = buildTriadFromRoot(chordRoot, chordQuality).pitchClasses;
      } catch {
        continue;
      }
    } else if (card.kind === "chord_from_notes" && meta.notes && Array.isArray(meta.notes)) {
      chordNotes = meta.notes as PitchClass[];
      const id = identifyTriadFromNotes(chordNotes);
      if (!id) continue;
      chordRoot = id.root;
      chordQuality = id.quality;
    } else continue;
    if (!chordRoot || !chordQuality || !chordNotes) continue;
    const scaleMemberships: ScaleMembership[] = [];
    for (const keyRoot of allPitchClasses) {
      for (const { type: keyType } of keyTypes) {
        try {
          const diatonicSet = getDiatonicChords(keyRoot, keyType);
          for (const { degree, triad } of diatonicSet.triads) {
            if (triad.root === chordRoot && triad.quality === chordQuality && notesMatch(triad.pitchClasses, chordNotes)) {
              scaleMemberships.push({ keyRoot, keyType: keyType === "major" ? "major" : "natural_minor", degree });
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }
    if (scaleMemberships.length > 0) {
      await prisma.cardTemplate.update({
        where: { id: card.id },
        data: { meta: { ...meta, root: chordRoot, quality: chordQuality, notes: chordNotes, scaleMemberships } },
      });
    }
  }
  console.log(`Attached scale memberships to ${chordCards.length} chord-based cards`);
}

function generateOptionsForSeed(seed: CardTemplateSeed): { optionA: string; optionB: string; optionC: string; optionD: string; correctIndex: number } {
  const allPitchClasses: PitchClass[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  if (seed.kind === "scale_spelling") {
    const meta = seed.meta as ScaleSpellingMeta;
    const scale = getScaleDefinition(meta.root, meta.type);
    const correctNotes = scale.pitchClasses;
    const fmt = (n: PitchClass[]) => n.join(" – ");
    const swapped = meta.type === "major" ? getScaleDefinition(meta.root, "natural_minor").pitchClasses : meta.type === "natural_minor" ? getScaleDefinition(meta.root, "major").pitchClasses : getScaleDefinition(meta.root, "major").pitchClasses;
    const shifted = correctNotes.map((pc) => allPitchClasses[(allPitchClasses.indexOf(pc) + 1) % 12]);
    const missing = [...correctNotes];
    missing.pop();
    missing.push(allPitchClasses.find((p) => !missing.includes(p))!);
    return { optionA: fmt(correctNotes), optionB: fmt(shifted), optionC: fmt(swapped), optionD: fmt(missing), correctIndex: 0 };
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

function generateSlug(seed: CardTemplateSeed, index: number): string {
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

function getAllAdvancedCards(): Array<{ seed: CardTemplateSeed; milestoneKey: string }> {
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

async function seedAdvancedCards(mode: SeedMode) {
  const allAdvancedCards = getAllAdvancedCards();
  let count = 0;
  for (let i = 0; i < allAdvancedCards.length; i++) {
    const { seed, milestoneKey } = allAdvancedCards[i];
    const options = generateOptionsForSeed(seed);
    const slug = generateSlug(seed, i);
    const data = {
      slug,
      kind: seed.kind,
      question: seed.prompt,
      optionA: options.optionA,
      optionB: options.optionB,
      optionC: options.optionC,
      optionD: options.optionD,
      correctIndex: options.correctIndex,
      meta: seed.meta as object,
      milestoneKey,
    };
    try {
      if (mode === "prod") {
        await prisma.cardTemplate.upsert({
          where: { slug },
          update: { ...data, updatedAt: new Date() },
          create: data,
        });
      } else {
        await prisma.cardTemplate.create({ data });
      }
      count++;
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code !== "P2002") console.error(`Error creating card ${slug}:`, e);
    }
  }
  console.log(`Seeded ${count} advanced flashcard cards`);
}

export async function runSeed(mode: SeedMode) {
  if (mode === "dev") {
    await prisma.cardAttempt.deleteMany();
    await prisma.cardState.deleteMany();
    await prisma.cardTemplate.deleteMany();
    await prisma.milestone.deleteMany();
  }

  if (mode === "dev") {
    const cMajor = buildTriadFromRoot("C", "maj");
    for (const card of STATIC_CARDS) {
      const meta = card.meta as Record<string, unknown>;
      if (card.slug === "c-major-chord-notes") (meta as Record<string, unknown>).notes = cMajor.pitchClasses;
      if (card.slug === "which-chord-c-e-g") (meta as Record<string, unknown>).notes = cMajor.pitchClasses;
      await prisma.cardTemplate.create({
        data: {
          slug: card.slug,
          kind: card.kind,
          question: card.question,
          optionA: card.optionA,
          optionB: card.optionB,
          optionC: card.optionC,
          optionD: card.optionD,
          correctIndex: card.correctIndex,
          meta: meta as any,
          milestoneKey: card.milestoneKey,
        },
      });
    }
  } else {
    const cMajor = buildTriadFromRoot("C", "maj");
    for (const card of STATIC_CARDS) {
      const meta = { ...(card.meta as object) };
      if (card.slug === "c-major-chord-notes") (meta as Record<string, unknown>).notes = cMajor.pitchClasses;
      if (card.slug === "which-chord-c-e-g") (meta as Record<string, unknown>).notes = cMajor.pitchClasses;
      await prisma.cardTemplate.upsert({
        where: { slug: card.slug },
        update: {
          kind: card.kind,
          question: card.question,
          optionA: card.optionA,
          optionB: card.optionB,
          optionC: card.optionC,
          optionD: card.optionD,
          correctIndex: card.correctIndex,
          meta: meta as any,
          milestoneKey: card.milestoneKey,
        },
        create: {
          slug: card.slug,
          kind: card.kind,
          question: card.question,
          optionA: card.optionA,
          optionB: card.optionB,
          optionC: card.optionC,
          optionD: card.optionD,
          correctIndex: card.correctIndex,
          meta: meta as any,
          milestoneKey: card.milestoneKey,
        },
      });
    }
  }

  for (const m of MILESTONES) {
    await prisma.milestone.upsert({
      where: { key: m.key },
      update: {},
      create: m,
    });
  }

  await seedAdvancedCards(mode);
  await attachScaleMemberships();
}
