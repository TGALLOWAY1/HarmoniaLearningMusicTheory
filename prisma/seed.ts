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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

