export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCircleNodes, type PitchClass } from "@/lib/theory";
import { normalizeMetaForQuery } from "@/lib/cards/metaNormalization";

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

type TemplateWithRelations = {
  id: number;
  kind: string;
  meta: unknown;
  states: Array<{ attemptsCount: number; correctCount: number; dueAt: Date }>;
  attempts: Array<{ responseMs: number | null; createdAt: Date }>;
};

/**
 * Get the key root this template contributes to. Uses normalized meta
 * (keyRoot, majorRoot, root) or infers from circle_geometry clockPosition.
 * Returns null if template cannot be attributed to a key.
 */
function getKeyRootForTemplate(template: TemplateWithRelations): PitchClass | null {
  const norm = normalizeMetaForQuery(template.meta, template.kind);
  if (norm.keyRoot) return norm.keyRoot as PitchClass;

  // circle_geometry with clockPosition 12 = C at 12 o'clock
  if (template.kind === "circle_geometry" && template.meta && typeof template.meta === "object") {
    const m = template.meta as Record<string, unknown>;
    if (m.clockPosition === 12) return "C";
  }
  return null;
}

/**
 * Compute mastery metrics for a single major key.
 * Mastery = accuracy * coverage (percent correct × fraction of cards in key that have been attempted).
 */
function computeKeySummary(
  root: PitchClass,
  templates: TemplateWithRelations[]
): KeySummaryDto {
  const keyId = `${root}_major`;

  const keyTemplates = templates.filter((t) => getKeyRootForTemplate(t) === root);

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
    const allCircleTemplates = await prisma.cardTemplate.findMany({
      where: { milestoneKey: "CIRCLE_OF_FIFTHS" },
      include: {
        states: true,
        attempts: true,
      },
    });

    const nodes = getCircleNodes();
    const summaries: KeySummaryDto[] = [];

    // Compute summary for each major key
    for (const node of nodes) {
      try {
        const summary = computeKeySummary(node.root, allCircleTemplates);
        summaries.push(
          typeof summary.mastery === "number" && !isNaN(summary.mastery)
            ? summary
            : { ...summary, mastery: 0 }
        );
      } catch {
        summaries.push({
          id: `${node.root}_major`,
          mastery: 0,
          avgRecallMs: null,
          lastReviewedAt: null,
          dueCount: 0,
        });
      }
    }

    return NextResponse.json({ keys: summaries });
  } catch (error) {
    const nodes = getCircleNodes();
    const fallbackSummaries: KeySummaryDto[] = nodes.map(node => ({
      id: `${node.root}_major`,
      mastery: 0,
      avgRecallMs: null,
      lastReviewedAt: null,
      dueCount: 0,
    }));

    return NextResponse.json(
      { 
        keys: fallbackSummaries,
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 200 }
    );
  }
}
