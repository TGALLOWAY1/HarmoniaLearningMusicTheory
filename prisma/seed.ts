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
} from "../lib/theory";
import type { PitchClass } from "../lib/theory/midiUtils";
import type {
  ScaleSpellingMeta,
  DiatonicChordIdMeta,
  DegreeToChordMeta,
  ChordToDegreeMeta,
  ModeCharacterMeta,
  ProgressionPredictionMeta,
  TensionSelectionMeta,
} from "../lib/cards/advancedCardMeta";

async function main() {
  // Remove existing data for idempotency in dev
  await prisma.cardAttempt.deleteMany();
  await prisma.cardState.deleteMany();
  await prisma.cardTemplate.deleteMany();
  await prisma.milestone.deleteMany();

  // Example 1: "Which notes make this chord?" – C major
  await prisma.cardTemplate.create({
    data: {
      slug: "c-major-chord-notes",
      kind: "notes_from_chord",
      question: "Which notes make a C major triad?",
      optionA: "C – E – G",
      optionB: "C – D# – G",
      optionC: "C – F – A",
      optionD: "C – E – A",
      correctIndex: 0,
      meta: {
        root: "C",
        quality: "maj",
        type: "triad",
      },
      milestoneKey: "TRIADS",
    },
  });

  // Example 2: "What chord is this?" – notes → chord name
  await prisma.cardTemplate.create({
    data: {
      slug: "which-chord-c-e-g",
      kind: "chord_from_notes",
      question: "Which chord is built from C – E – G?",
      optionA: "C major",
      optionB: "A minor",
      optionC: "F major",
      optionD: "G major",
      correctIndex: 0,
      meta: {
        notes: ["C", "E", "G"],
      },
      milestoneKey: "TRIADS",
    },
  });

  // Example 3: "Which key has one sharp?" – Circle of fifths-ish
  await prisma.cardTemplate.create({
    data: {
      slug: "key-signature-one-sharp",
      kind: "key_signature",
      question: "Which major key has exactly one sharp?",
      optionA: "G major",
      optionB: "D major",
      optionC: "F major",
      optionD: "C major",
      correctIndex: 0,
      meta: {
        sharps: 1,
      },
      milestoneKey: "CIRCLE_OF_FIFTHS",
    },
  });

  // Circle of Fifths cards

  // B5 - Circle geometry
  await prisma.cardTemplate.create({
    data: {
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
  });

  // B6 - Relative minor
  await prisma.cardTemplate.create({
    data: {
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
  });

  await prisma.cardTemplate.create({
    data: {
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
  });

  await prisma.cardTemplate.create({
    data: {
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
  });

  // B7 - Neighbor keys (IV/V)
  await prisma.cardTemplate.create({
    data: {
      slug: "neighbor-of-d-major",
      kind: "circle_neighbor_key",
      question: "Which of these is a neighbor (IV or V) of D major on the circle?",
      optionA: "C",
      optionB: "G",
      optionC: "F",
      optionD: "A",
      correctIndex: 3, // A (IV of D)
      meta: { majorRoot: "D" },
      milestoneKey: "CIRCLE_OF_FIFTHS",
    },
  });

  await prisma.cardTemplate.create({
    data: {
      slug: "neighbor-of-c-major",
      kind: "circle_neighbor_key",
      question: "Which of these is a neighbor (IV or V) of C major on the circle?",
      optionA: "F",
      optionB: "G",
      optionC: "D",
      optionD: "A",
      correctIndex: 0, // F (IV of C)
      meta: { majorRoot: "C" },
      milestoneKey: "CIRCLE_OF_FIFTHS",
    },
  });

  await prisma.cardTemplate.create({
    data: {
      slug: "neighbor-of-g-major",
      kind: "circle_neighbor_key",
      question: "Which of these is a neighbor (IV or V) of G major on the circle?",
      optionA: "C",
      optionB: "D",
      optionC: "F",
      optionD: "A",
      correctIndex: 0, // C (IV of G)
      meta: { majorRoot: "G" },
      milestoneKey: "CIRCLE_OF_FIFTHS",
    },
  });

  // Seed milestones
  const milestones = [
    {
      key: "FOUNDATION",
      title: "Notes, intervals & major scale",
      description: "Learn natural notes, sharps/flats, whole/half steps, and how to build the major scale.",
      order: 1,
      isUnlocked: true,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "NATURAL_MINOR",
      title: "Natural minor & relative keys",
      description: "Understand natural minor scales and how they relate to their relative majors.",
      order: 2,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "TRIADS",
      title: "Major & minor triads",
      description: "Build and recognize basic triads that show up constantly in EDM and bass music.",
      order: 3,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "DIATONIC_TRIADS",
      title: "Diatonic chords in a key",
      description: "Map the chords inside a key with Roman numerals, and see them on the piano roll.",
      order: 4,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "CIRCLE_OF_FIFTHS",
      title: "Circle of fifths",
      description: "Use the circle to navigate keys, find neighbors, and connect harmony visually.",
      order: 5,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "SEVENTH_CHORDS",
      title: "Seventh chords",
      description: "Add 7ths to your chords for richer harmonies and more expressive EDM progressions.",
      order: 6,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "MODES",
      title: "Useful modes for bass music",
      description: "Explore Dorian, Mixolydian and Phrygian, and how they color bass-heavy tracks.",
      order: 7,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
    {
      key: "ADVANCED",
      title: "Advanced harmony",
      description: "Dim / aug chords, borrowed chords and secondary dominants (future expansion).",
      order: 8,
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
    },
  ];

  // Use upsert to handle re-runs gracefully
  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { key: milestone.key },
      update: {},
      create: milestone,
    });
  }

  // Generate and seed advanced flashcard cards
  await seedAdvancedCards();
}

/**
 * Generate options for a card template seed based on its kind and meta
 */
function generateOptionsForSeed(seed: CardTemplateSeed): {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
} {
  const allPitchClasses: PitchClass[] = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ];

  if (seed.kind === "scale_spelling") {
    const meta = seed.meta as ScaleSpellingMeta;
    const scale = getScaleDefinition(meta.root, meta.type);
    const correctNotes = scale.pitchClasses;
    const formatNotes = (notes: PitchClass[]) => notes.join(" – ");

    // Option 1: Correct scale
    const correct = formatNotes(correctNotes);

    // Option 2: Shifted scale (one semitone up)
    const shifted = correctNotes.map((pc) => {
      const idx = allPitchClasses.indexOf(pc);
      return allPitchClasses[(idx + 1) % 12];
    });

    // Option 3: Major if minor, minor if major
    let swapped: PitchClass[];
    if (meta.type === "major") {
      swapped = getScaleDefinition(meta.root, "natural_minor").pitchClasses;
    } else if (meta.type === "natural_minor") {
      swapped = getScaleDefinition(meta.root, "major").pitchClasses;
    } else {
      swapped = getScaleDefinition(meta.root, "major").pitchClasses;
    }

    // Option 4: Missing one note
    const missing = [...correctNotes];
    missing.pop();
    const wrongNote = allPitchClasses.find((p) => !missing.includes(p))!;
    missing.push(wrongNote);

    return {
      optionA: correct,
      optionB: formatNotes(shifted),
      optionC: formatNotes(swapped),
      optionD: formatNotes(missing),
      correctIndex: 0,
    };
  }

  if (seed.kind === "diatonic_chord_id") {
    const meta = seed.meta as DiatonicChordIdMeta;
    const diatonicSet = getDiatonicChords(meta.keyRoot, meta.keyType);
    const allDegrees = diatonicSet.triads.map((t) => t.degree);
    const correct = meta.degree;
    const others = allDegrees.filter((d) => d !== correct);
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    const options = [correct, ...shuffled.slice(0, 3)];

    return {
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
    };
  }

  if (seed.kind === "degree_to_chord") {
    const meta = seed.meta as DegreeToChordMeta;
    const diatonicSet = getDiatonicChords(meta.keyRoot, meta.keyType);
    const allChords = diatonicSet.triads.map((t) => {
      const qualityName = t.triad.quality === "maj" ? "major" : 
                         t.triad.quality === "min" ? "minor" :
                         t.triad.quality === "dim" ? "diminished" : "augmented";
      return `${t.triad.root} ${qualityName}`;
    });
    const correct = meta.correctChord;
    const others = allChords.filter((c) => c !== correct);
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    const options = [correct, ...shuffled.slice(0, 3)];

    return {
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
    };
  }

  if (seed.kind === "chord_to_degree") {
    const meta = seed.meta as ChordToDegreeMeta;
    const diatonicSet = getDiatonicChords(meta.keyRoot, meta.keyType);
    const allDegrees = diatonicSet.triads.map((t) => t.degree);
    const correct = meta.correctDegree;
    const others = allDegrees.filter((d) => d !== correct);
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    const options = [correct, ...shuffled.slice(0, 3)];

    return {
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
    };
  }

  if (seed.kind === "mode_character") {
    const meta = seed.meta as ModeCharacterMeta;
    const characteristics = [
      "Raised 6th",
      "Lowered 7th",
      "Lowered 2nd",
      "Raised 4th",
      "Lowered 3rd",
    ];
    const correct = meta.characteristic;
    const others = characteristics.filter((c) => c !== correct);
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    const options = [correct, ...shuffled.slice(0, 3)];

    return {
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
    };
  }

  if (seed.kind === "progression_prediction") {
    const meta = seed.meta as ProgressionPredictionMeta;
    const diatonicSet = getDiatonicChords(meta.keyRoot, meta.keyType);
    const allDegrees = diatonicSet.triads.map((t) => t.degree);
    const correct = meta.correctNext;
    const others = allDegrees.filter((d) => d !== correct);
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    const options = [correct, ...shuffled.slice(0, 3)];

    return {
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
    };
  }

  if (seed.kind === "tension_selection") {
    const meta = seed.meta as TensionSelectionMeta;
    const tensions = ["9th", "11th", "13th", "b9", "#11", "b13"];
    const correct = meta.correctTension;
    const others = tensions.filter((t) => t !== correct);
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    const options = [correct, ...shuffled.slice(0, 3)];

    return {
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctIndex: 0,
    };
  }

  // Fallback (shouldn't happen)
  return {
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correctIndex: 0,
  };
}

/**
 * Generate a slug from a card template seed
 */
function generateSlug(seed: CardTemplateSeed, index: number): string {
  const base = seed.kind.replace(/_/g, "-");
  if (seed.kind === "scale_spelling") {
    const meta = seed.meta as ScaleSpellingMeta;
    return `${base}-${meta.root.toLowerCase()}-${meta.type}-${index}`;
  }
  if (seed.kind === "diatonic_chord_id") {
    const meta = seed.meta as DiatonicChordIdMeta;
    return `${base}-${meta.keyRoot.toLowerCase()}-${meta.keyType}-${meta.degree.toLowerCase()}-${index}`;
  }
  if (seed.kind === "degree_to_chord") {
    const meta = seed.meta as DegreeToChordMeta;
    return `${base}-${meta.keyRoot.toLowerCase()}-${meta.degree.toLowerCase()}-${index}`;
  }
  if (seed.kind === "chord_to_degree") {
    const meta = seed.meta as ChordToDegreeMeta;
    const chordSlug = meta.chord.toLowerCase().replace(/\s+/g, "-");
    return `${base}-${meta.keyRoot.toLowerCase()}-${chordSlug}-${index}`;
  }
  if (seed.kind === "mode_character") {
    const meta = seed.meta as ModeCharacterMeta;
    return `${base}-${meta.mode}-${meta.root.toLowerCase()}-${index}`;
  }
  if (seed.kind === "progression_prediction") {
    const meta = seed.meta as ProgressionPredictionMeta;
    const progSlug = meta.currentChords.join("-").toLowerCase();
    return `${base}-${meta.keyRoot.toLowerCase()}-${progSlug}-${index}`;
  }
  if (seed.kind === "tension_selection") {
    const meta = seed.meta as TensionSelectionMeta;
    const chordSlug = meta.chord.toLowerCase().replace(/\s+/g, "-");
    return `${base}-${meta.keyRoot.toLowerCase()}-${chordSlug}-${index}`;
  }
  return `${base}-${index}`;
}

/**
 * Seed advanced flashcard cards for each milestone
 */
async function seedAdvancedCards() {
  // FOUNDATION → scale_spelling (only major)
  const foundationCards = generateScaleSpellingTemplates().filter(
    (card) => {
      if (card.kind !== "scale_spelling") return false;
      const meta = card.meta as ScaleSpellingMeta;
      return card.milestoneKey === "FOUNDATION" && meta.type === "major";
    }
  );

  // NATURAL_MINOR → scale_spelling (minor + modes)
  const naturalMinorCards = generateScaleSpellingTemplates().filter(
    (card) => {
      if (card.kind !== "scale_spelling") return false;
      const meta = card.meta as ScaleSpellingMeta;
      return (
        card.milestoneKey === "NATURAL_MINOR" &&
        (meta.type === "natural_minor" ||
          meta.type === "dorian" ||
          meta.type === "mixolydian" ||
          meta.type === "phrygian")
      );
    }
  );

  // TRIADS → diatonic_chord_id (triads only - use simpler keys)
  const triadCards = generateDiatonicChordIdTemplates().filter(
    (card) => {
      if (card.kind !== "diatonic_chord_id") return false;
      const meta = card.meta as DiatonicChordIdMeta;
      return (
        card.milestoneKey === "DIATONIC_TRIADS" &&
        ["C", "G", "F", "D", "A", "E"].includes(meta.keyRoot)
      );
    }
  );

  // DIATONIC_TRIADS → diatonic_chord_id + degree_to_chord
  const diatonicTriadCards = [
    ...generateDiatonicChordIdTemplates().filter(
      (card) => card.milestoneKey === "DIATONIC_TRIADS"
    ),
    ...generateDegreeToChordTemplates().filter(
      (card) => card.milestoneKey === "DIATONIC_TRIADS"
    ),
  ];

  // CIRCLE_OF_FIFTHS → progression_prediction (keep existing circle cards)
  const circleCards = generateProgressionPredictionTemplates().filter(
    (card) => card.milestoneKey === "DIATONIC_TRIADS"
  );

  // SEVENTH_CHORDS → chord_to_degree
  const seventhChordCards = generateChordToDegreeTemplates().filter(
    (card) => card.milestoneKey === "DIATONIC_TRIADS"
  );

  // MODES → mode_character
  const modeCards = generateModeCharacterTemplates().filter(
    (card) => card.milestoneKey === "MODES"
  );

  // Combine all cards with their milestone assignments
  const allAdvancedCards: Array<{ seed: CardTemplateSeed; milestoneKey: string }> = [
    ...foundationCards.map((seed) => ({ seed, milestoneKey: "FOUNDATION" })),
    ...naturalMinorCards.map((seed) => ({ seed, milestoneKey: "NATURAL_MINOR" })),
    ...triadCards.map((seed) => ({ seed, milestoneKey: "TRIADS" })),
    ...diatonicTriadCards.map((seed) => ({ seed, milestoneKey: "DIATONIC_TRIADS" })),
    ...circleCards.map((seed) => ({ seed, milestoneKey: "CIRCLE_OF_FIFTHS" })),
    ...seventhChordCards.map((seed) => ({ seed, milestoneKey: "SEVENTH_CHORDS" })),
    ...modeCards.map((seed) => ({ seed, milestoneKey: "MODES" })),
  ];

  // Insert cards into database
  let cardIndex = 0;
  for (const { seed, milestoneKey } of allAdvancedCards) {
    const options = generateOptionsForSeed(seed);
    const slug = generateSlug(seed, cardIndex);

    try {
      await prisma.cardTemplate.create({
        data: {
          slug,
          kind: seed.kind,
          question: seed.prompt,
          optionA: options.optionA,
          optionB: options.optionB,
          optionC: options.optionC,
          optionD: options.optionD,
          correctIndex: options.correctIndex,
          meta: seed.meta as any,
          milestoneKey,
        },
      });
      cardIndex++;
    } catch (error: any) {
      // Skip if slug already exists (for idempotency)
      if (error.code !== "P2002") {
        console.error(`Error creating card ${slug}:`, error);
      }
    }
  }

  console.log(`Seeded ${cardIndex} advanced flashcard cards`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

