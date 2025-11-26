import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // 1) Fetch all templates
    const templates = await prisma.cardTemplate.findMany();

    if (templates.length === 0) {
      return NextResponse.json({ error: "No cards available" }, { status: 404 });
    }

    // 2) Ensure CardState exists for each template
    const templateIds = templates.map((t) => t.id);

    const existingStates = await prisma.cardState.findMany({
      where: { cardId: { in: templateIds } },
    });

    const existingMap = new Map(existingStates.map((s) => [s.cardId, s]));

    const missingTemplateIds = templateIds.filter((id) => !existingMap.has(id));

    if (missingTemplateIds.length > 0) {
      await prisma.cardState.createMany({
        data: missingTemplateIds.map((cardId) => ({ cardId })),
      });
    }

    // 3) Re-fetch states (or update the map) since new ones may have been created
    const allStates = await prisma.cardState.findMany({
      where: { cardId: { in: templateIds } },
      orderBy: [
        { dueAt: "asc" },
        { id: "asc" },
      ],
    });

    const nextState = allStates[0];

    if (!nextState) {
      return NextResponse.json({ error: "No card state found" }, { status: 500 });
    }

    const nextTemplate = templates.find((t) => t.id === nextState.cardId);

    if (!nextTemplate) {
      return NextResponse.json({ error: "Card state mismatch" }, { status: 500 });
    }

    const responseBody = {
      card: {
        id: nextTemplate.id,
        slug: nextTemplate.slug,
        kind: nextTemplate.kind,
        question: nextTemplate.question,
        options: [
          nextTemplate.optionA,
          nextTemplate.optionB,
          nextTemplate.optionC,
          nextTemplate.optionD,
        ],
      },
      state: {
        id: nextState.id,
        attemptsCount: nextState.attemptsCount,
        correctCount: nextState.correctCount,
        lastResult: nextState.lastResult,
      },
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error fetching next card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

