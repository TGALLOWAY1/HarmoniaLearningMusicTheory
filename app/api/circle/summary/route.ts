import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCircleNodes, type PitchClass } from "@/lib/theory";

type KeySummaryDto = {
  id: string;
  mastery: number;
  avgRecallMs: number | null;
  lastReviewedAt: string | null;
  dueCount: number;
};

type CircleSummaryResponse = {
  keys: KeySummaryDto[];
};

/**
 * Type guard to check if meta has a majorRoot field
 */
function hasMajorRoot(meta: unknown): meta is { majorRoot: string } {
  return (
    typeof meta === "object" &&
    meta !== null &&
    "majorRoot" in meta &&
    typeof (meta as { majorRoot: unknown }).majorRoot === "string"
  );
}

/**
 * Compute mastery metrics for a single major key
 */
function computeKeySummary(
  root: PitchClass,
  templates: Array<{
    id: number;
    meta: unknown;
    states: Array<{
      attemptsCount: number;
      correctCount: number;
      dueAt: Date;
    }>;
    attempts: Array<{
      responseMs: number | null;
      createdAt: Date;
    }>;
  }>
): KeySummaryDto {
  const keyId = `${root}_major`;

  // Filter templates that belong to this key (meta.majorRoot === root)
  const keyTemplates = templates.filter((template) => {
    if (!hasMajorRoot(template.meta)) {
      return false;
    }
    return template.meta.majorRoot === root;
  });

  // If no templates exist for this key, return default values
  if (keyTemplates.length === 0) {
    return {
      id: keyId,
      mastery: 0,
      avgRecallMs: null,
      lastReviewedAt: null,
      dueCount: 0,
    };
  }

  // Aggregate data from all templates
  let totalAttempts = 0;
  let totalCorrect = 0;
  let templatesWithAttempts = 0;
  const allResponseMs: number[] = [];
  const allAttemptDates: Date[] = [];
  let dueCount = 0;
  const now = new Date();

  for (const template of keyTemplates) {
    // Aggregate CardState data
    let templateHasAttempts = false;
    for (const state of template.states) {
      totalAttempts += state.attemptsCount;
      totalCorrect += state.correctCount;

      if (state.attemptsCount > 0) {
        templateHasAttempts = true;

        // Count due cards (only if attemptsCount > 0)
        if (state.dueAt <= now) {
          dueCount++;
        }
      }
    }

    // Track if this template has any attempts
    if (templateHasAttempts) {
      templatesWithAttempts++;
    }

    // Aggregate CardAttempt data
    for (const attempt of template.attempts) {
      if (attempt.responseMs !== null && attempt.responseMs !== undefined) {
        allResponseMs.push(attempt.responseMs);
      }
      allAttemptDates.push(attempt.createdAt);
    }
  }

  // Compute accuracy
  const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

  // Compute coverage
  const coverage =
    keyTemplates.length > 0 ? templatesWithAttempts / keyTemplates.length : 0;

  // Compute mastery (accuracy * coverage)
  const mastery = accuracy * coverage;

  // Compute avgRecallMs
  const avgRecallMs =
    allResponseMs.length > 0
      ? Math.round(allResponseMs.reduce((sum, ms) => sum + ms, 0) / allResponseMs.length)
      : null;

  // Compute lastReviewedAt
  const lastReviewedAt =
    allAttemptDates.length > 0
      ? new Date(Math.max(...allAttemptDates.map((d) => d.getTime())))
      : null;

  return {
    id: keyId,
    mastery: Math.round(mastery * 100) / 100, // Round to 2 decimal places
    avgRecallMs,
    lastReviewedAt: lastReviewedAt?.toISOString() ?? null,
    dueCount,
  };
}

export async function GET() {
  try {
    // Fetch all circle-related CardTemplates once
    const allCircleTemplates = await prisma.cardTemplate.findMany({
      where: {
        kind: {
          startsWith: "circle_",
        },
      },
      include: {
        states: true,
        attempts: true,
      },
    });

    // Get all major keys from the circle
    const nodes = getCircleNodes();
    const summaries: KeySummaryDto[] = [];

    // Compute summary for each major key
    for (const node of nodes) {
      const summary = computeKeySummary(node.root, allCircleTemplates);
      summaries.push(summary);
    }

    const response: CircleSummaryResponse = {
      keys: summaries,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error computing circle summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

