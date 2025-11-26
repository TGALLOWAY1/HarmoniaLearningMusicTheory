import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Remove existing data for idempotency in dev
  await prisma.cardAttempt.deleteMany();
  await prisma.cardState.deleteMany();
  await prisma.cardTemplate.deleteMany();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

