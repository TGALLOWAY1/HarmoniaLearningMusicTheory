import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const cardId = Number(params.id);
    if (Number.isNaN(cardId)) {
      return NextResponse.json({ error: "Invalid card id" }, { status: 400 });
    }

    const body = await req.json();
    const selectedIndex = body.selectedIndex;
    const responseMs = typeof body.responseMs === "number" ? body.responseMs : null;

    if (
      typeof selectedIndex !== "number" ||
      selectedIndex < 0 ||
      selectedIndex > 3
    ) {
      return NextResponse.json({ error: "Invalid selectedIndex" }, { status: 400 });
    }

    const card = await prisma.cardTemplate.findUnique({ where: { id: cardId } });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Ensure state exists
    let state = await prisma.cardState.findFirst({ where: { cardId } });
    if (!state) {
      state = await prisma.cardState.create({ data: { cardId } });
    }

    const isCorrect = selectedIndex === card.correctIndex;

    await prisma.cardAttempt.create({
      data: {
        cardId,
        selectedIndex,
        isCorrect,
        responseMs: responseMs ?? 0,
      },
    });

    const updatedState = await prisma.cardState.update({
      where: { id: state.id },
      data: {
        attemptsCount: { increment: 1 },
        correctCount: { increment: isCorrect ? 1 : 0 },
        lastResult: isCorrect,
        lastAnswerAt: new Date(),
        dueAt: new Date(), // placeholder; will be updated by SRS logic later
      },
    });

    const responseBody = {
      correct: isCorrect,
      correctIndex: card.correctIndex,
      state: {
        attemptsCount: updatedState.attemptsCount,
        correctCount: updatedState.correctCount,
        lastResult: updatedState.lastResult,
      },
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error processing answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

