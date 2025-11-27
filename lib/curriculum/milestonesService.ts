import { prisma } from "@/lib/db";

/**
 * Determines if a card is "mastered" based on CardState data.
 * A card is mastered if:
 * - CardState exists
 * - attemptsCount >= 3
 * - correctCount / attemptsCount >= 0.7 (70% accuracy)
 */
export function isCardMastered(
  attemptsCount: number,
  correctCount: number
): boolean {
  if (attemptsCount < 3) {
    return false;
  }
  if (attemptsCount === 0) {
    return false;
  }
  const accuracy = correctCount / attemptsCount;
  return accuracy >= 0.7;
}

/**
 * Computes progress, completion status, and card counts for a milestone based on its cards.
 * Returns { progress: number, isCompleted: boolean, totalCards: number, seenCards: number, masteredCards: number }
 */
async function computeMilestoneProgress(milestoneKey: string): Promise<{
  progress: number;
  isCompleted: boolean;
  totalCards: number;
  seenCards: number;
  masteredCards: number;
}> {
  // Get all CardTemplates for this milestone
  const templates = await prisma.cardTemplate.findMany({
    where: { milestoneKey },
  });

  const totalCards = templates.length;

  // If no templates, return 0 progress and not completed
  if (totalCards === 0) {
    return {
      progress: 0.0,
      isCompleted: false,
      totalCards: 0,
      seenCards: 0,
      masteredCards: 0,
    };
  }

  // Get CardStates for all templates
  const templateIds = templates.map((t) => t.id);
  const states = await prisma.cardState.findMany({
    where: { cardId: { in: templateIds } },
  });

  // Create a map of cardId -> CardState for quick lookup
  const stateMap = new Map(states.map((s) => [s.cardId, s]));

  // Count seen and mastered cards
  let seenCards = 0;
  let masteredCards = 0;

  for (const template of templates) {
    const state = stateMap.get(template.id);
    if (state) {
      // Card is seen if it has any attempts
      if (state.attemptsCount > 0) {
        seenCards++;
      }
      // Check if mastered
      const mastered = isCardMastered(
        state.attemptsCount,
        state.correctCount
      );
      if (mastered) {
        masteredCards++;
      }
    }
  }

  // Calculate progress (0-1)
  const rawProgress = masteredCards / totalCards;

  // Determine completion (>= 85% mastered)
  const isCompleted = rawProgress >= 0.85;

  return {
    progress: rawProgress,
    isCompleted,
    totalCards,
    seenCards,
    masteredCards,
  };
}

/**
 * Updates all milestones with computed progress and unlock status.
 * - Computes progress for each milestone based on card mastery
 * - Sets isCompleted based on progress (>= 85%)
 * - Unlocks milestones based on previous milestone completion
 * - Persists all changes to the database
 * - Returns card counts for each milestone
 */
export async function updateMilestonesProgressAndUnlock(): Promise<
  Array<{
    id: number;
    totalCards: number;
    seenCards: number;
    masteredCards: number;
  }>
> {
  try {
    // Fetch all milestones ordered by order ascending
    const milestones = await prisma.milestone.findMany({
      orderBy: { order: "asc" },
    });

    if (milestones.length === 0) {
      return [];
    }

    // Step 1: Compute progress, completion, and card counts for each milestone
    const updates: Array<{
      id: number;
      progress: number;
      isCompleted: boolean;
      totalCards: number;
      seenCards: number;
      masteredCards: number;
    }> = [];

    const cardCounts: Array<{
      id: number;
      totalCards: number;
      seenCards: number;
      masteredCards: number;
    }> = [];

    for (const milestone of milestones) {
      const {
        progress,
        isCompleted,
        totalCards,
        seenCards,
        masteredCards,
      } = await computeMilestoneProgress(milestone.key);
      updates.push({
        id: milestone.id,
        progress,
        isCompleted,
        totalCards,
        seenCards,
        masteredCards,
      });
      cardCounts.push({
        id: milestone.id,
        totalCards,
        seenCards,
        masteredCards,
      });
    }

    // Step 2: Determine unlock status
    // First milestone is always unlocked
    const unlockUpdates: Array<{
      id: number;
      isUnlocked: boolean;
    }> = [];

    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      const update = updates[i]; // Same order as milestones

      if (i === 0) {
        // First milestone: always unlocked
        if (!milestone.isUnlocked) {
          unlockUpdates.push({ id: milestone.id, isUnlocked: true });
        }
      } else {
        // Subsequent milestones: unlock if previous is completed
        const prevUpdate = updates[i - 1];
        if (prevUpdate && prevUpdate.isCompleted) {
          if (!milestone.isUnlocked) {
            unlockUpdates.push({ id: milestone.id, isUnlocked: true });
          }
        }
        // Note: We don't force unlock to false if previous isn't completed,
        // to respect any manual overrides already in the DB
      }
    }

    // Step 3: Persist all updates
    // Update progress and completion
    for (const update of updates) {
      await prisma.milestone.update({
        where: { id: update.id },
        data: {
          progress: update.progress,
          isCompleted: update.isCompleted,
        },
      });
    }

    // Update unlock status
    for (const unlockUpdate of unlockUpdates) {
      await prisma.milestone.update({
        where: { id: unlockUpdate.id },
        data: {
          isUnlocked: unlockUpdate.isUnlocked,
        },
      });
    }

    // Return card counts for API use
    return cardCounts;
  } catch (error) {
    console.error("Error updating milestones progress and unlock:", error);
    throw error;
  }
}

/**
 * Gets detailed progress statistics for a milestone.
 * Returns { totalCards, cardsSeen, cardsMastered }
 */
export async function getMilestoneProgressStats(milestoneKey: string): Promise<{
  totalCards: number;
  cardsSeen: number;
  cardsMastered: number;
}> {
  // Get all CardTemplates for this milestone
  const templates = await prisma.cardTemplate.findMany({
    where: { milestoneKey },
  });

  const totalCards = templates.length;

  if (totalCards === 0) {
    return { totalCards: 0, cardsSeen: 0, cardsMastered: 0 };
  }

  // Get CardStates for all templates
  const templateIds = templates.map((t) => t.id);
  const states = await prisma.cardState.findMany({
    where: { cardId: { in: templateIds } },
  });

  // Create a map of cardId -> CardState for quick lookup
  const stateMap = new Map(states.map((s) => [s.cardId, s]));

  // Count seen and mastered cards
  let cardsSeen = 0;
  let cardsMastered = 0;

  for (const template of templates) {
    const state = stateMap.get(template.id);
    if (state) {
      // Card is seen if it has any attempts
      if (state.attemptsCount > 0) {
        cardsSeen++;
      }
      // Check if mastered
      if (isCardMastered(state.attemptsCount, state.correctCount)) {
        cardsMastered++;
      }
    }
  }

  return { totalCards, cardsSeen, cardsMastered };
}

