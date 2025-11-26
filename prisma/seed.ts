import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

