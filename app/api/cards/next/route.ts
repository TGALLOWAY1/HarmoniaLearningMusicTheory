import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Parse milestoneKey query parameter
    const url = new URL(request.url);
    const milestoneKey = url.searchParams.get("milestoneKey");

    // 1) Fetch all templates (optionally filtered by milestoneKey)
    const templates = await prisma.cardTemplate.findMany({
      ...(milestoneKey && { where: { milestoneKey } }),
    });

    // If milestoneKey was provided but no templates match, return 404
    if (milestoneKey && templates.length === 0) {
      return NextResponse.json(
        { error: "No cards found for this milestoneKey." },
        { status: 404 }
      );
    }

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
    // Order by dueAt ascending to prioritize earliest due dates
    const allStates = await prisma.cardState.findMany({
      where: { cardId: { in: templateIds } },
      orderBy: [{ dueAt: "asc" }],
    });

    if (allStates.length === 0) {
      return NextResponse.json({ error: "No card state found" }, { status: 500 });
    }

    // 4) Partition cards: due cards (dueAt <= now) vs future cards
    const now = new Date();
    const dueCards = allStates.filter((s) => s.dueAt <= now);

    let nextState: (typeof allStates)[0];

    if (dueCards.length > 0) {
      // If there are due cards, randomly select one to improve distribution
      const randomIndex = Math.floor(Math.random() * dueCards.length);
      nextState = dueCards[randomIndex];
    } else {
      // No due cards, find earliest future due date
      const firstDue = allStates[0].dueAt;
      const firstDueTime = firstDue.getTime();

      // Find all cards with the same earliest due date
      const futureWithSameDue = allStates.filter(
        (s) => s.dueAt.getTime() === firstDueTime
      );

      // Randomly select among cards with the same earliest due date
      const randomIndex = Math.floor(Math.random() * futureWithSameDue.length);
      nextState = futureWithSameDue[randomIndex];
    }

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
        correctIndex: nextTemplate.correctIndex,
        meta: nextTemplate.meta,
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

