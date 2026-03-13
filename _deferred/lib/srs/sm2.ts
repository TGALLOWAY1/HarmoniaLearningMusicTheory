/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 * 
 * Implementation of the SM-2 algorithm for scheduling flashcard reviews.
 * Based on the original SuperMemo algorithm by Piotr Wozniak.
 * 
 * References:
 * - https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 * - Quality ratings: 0-5 (we map "Again"=0, "Hard"=1, "Good"=3, "Easy"=5)
 */

export type ConfidenceRating = "Again" | "Hard" | "Good" | "Easy";

/**
 * Maps confidence rating to SM-2 quality value (0-5)
 */
export function confidenceToQuality(confidence: ConfidenceRating): number {
  switch (confidence) {
    case "Again":
      return 0;
    case "Hard":
      return 1;
    case "Good":
      return 3;
    case "Easy":
      return 5;
    default:
      return 0;
  }
}

/**
 * SM-2 algorithm parameters
 */
export interface SM2Params {
  /** Current ease factor (default: 2.5) */
  easeFactor: number;
  /** Current interval in days (default: 0 for new cards) */
  intervalDays: number;
  /** Number of successful repetitions (default: 0) */
  repetitions: number;
  /** Number of lapses (times card was forgotten after being learned) */
  lapses?: number;
  /** Quality/confidence rating from the user */
  quality: number; // 0-5
}

/**
 * Result of SM-2 calculation
 */
export interface SM2Result {
  /** Updated ease factor */
  easeFactor: number;
  /** New interval in days */
  intervalDays: number;
  /** Updated repetition count */
  repetitions: number;
  /** Updated lapse count */
  lapses: number;
  /** Next due date (calculated from interval) */
  dueAt: Date;
}

/**
 * Calculate new ease factor based on quality rating
 * 
 * Formula: EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * 
 * @param currentEaseFactor Current ease factor
 * @param quality Quality rating (0-5)
 * @returns New ease factor (minimum 1.3)
 */
export function calculateEaseFactor(
  currentEaseFactor: number,
  quality: number
): number {
  const newEaseFactor =
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Minimum ease factor is 1.3
  return Math.max(1.3, newEaseFactor);
}

/**
 * Calculate new interval based on SM-2 algorithm
 * 
 * Rules:
 * - If quality < 3 (Again/Hard): reset interval to 1 day, reset repetitions to 0
 * - If quality >= 3 (Good/Easy):
 *   - First review (repetitions = 0): interval = 1 day
 *   - Second review (repetitions = 1): interval = 6 days
 *   - Subsequent reviews: interval = previous interval * ease factor
 * 
 * @param currentInterval Current interval in days
 * @param easeFactor Current ease factor
 * @param repetitions Current repetition count
 * @param quality Quality rating (0-5)
 * @returns New interval in days, updated repetition count, and whether a lapse occurred
 */
export function calculateInterval(
  currentInterval: number,
  easeFactor: number,
  repetitions: number,
  quality: number
): { intervalDays: number; repetitions: number; isLapse: boolean } {
  // If quality < 3, reset (card was answered incorrectly or with difficulty)
  if (quality < 3) {
    // A lapse occurs if the card was previously learned (repetitions > 0)
    const isLapse = repetitions > 0;
    return { intervalDays: 1, repetitions: 0, isLapse };
  }

  // Quality >= 3 (Good or Easy)
  if (repetitions === 0) {
    // First successful review
    return { intervalDays: 1, repetitions: 1, isLapse: false };
  } else if (repetitions === 1) {
    // Second successful review
    return { intervalDays: 6, repetitions: 2, isLapse: false };
  } else {
    // Subsequent reviews: multiply interval by ease factor
    const newInterval = Math.round(currentInterval * easeFactor);
    return { intervalDays: newInterval, repetitions: repetitions + 1, isLapse: false };
  }
}

/**
 * Calculate next due date from interval
 * 
 * @param intervalDays Interval in days
 * @param fromDate Optional start date (defaults to now)
 * @returns Next due date
 */
export function calculateDueDate(
  intervalDays: number,
  fromDate: Date = new Date()
): Date {
  const dueDate = new Date(fromDate);
  dueDate.setDate(dueDate.getDate() + intervalDays);
  return dueDate;
}

/**
 * Main SM-2 algorithm function
 * 
 * Takes current card state and quality rating, returns updated SRS parameters.
 * 
 * @param params Current SM-2 parameters
 * @returns Updated SM-2 result with new ease factor, interval, repetitions, lapses, and due date
 */
export function calculateSM2(params: SM2Params): SM2Result {
  const { easeFactor, intervalDays, repetitions, lapses = 0, quality } = params;

  // Calculate new ease factor
  const newEaseFactor = calculateEaseFactor(easeFactor, quality);

  // Calculate new interval and repetition count
  const { intervalDays: newIntervalDays, repetitions: newRepetitions, isLapse } =
    calculateInterval(intervalDays, newEaseFactor, repetitions, quality);

  // Update lapse count if a lapse occurred
  const newLapses = isLapse ? lapses + 1 : lapses;

  // Calculate next due date
  const dueAt = calculateDueDate(newIntervalDays);

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitions: newRepetitions,
    lapses: newLapses,
    dueAt,
  };
}

/**
 * Convenience function that takes confidence rating and current card state
 * 
 * @param confidence User's confidence rating
 * @param currentState Current card SRS state
 * @returns Updated SM-2 result
 */
export function updateCardWithSM2(
  confidence: ConfidenceRating,
  currentState: {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    lapses?: number;
  }
): SM2Result {
  const quality = confidenceToQuality(confidence);
  return calculateSM2({
    easeFactor: currentState.easeFactor,
    intervalDays: currentState.intervalDays,
    repetitions: currentState.repetitions,
    lapses: currentState.lapses,
    quality,
  });
}

/**
 * Helper function to update a Prisma CardState with SM-2 calculations
 * 
 * This function takes a CardState object (from Prisma) and returns the data
 * needed to update it with new SRS values.
 * 
 * @param confidence User's confidence rating
 * @param cardState Current CardState from database
 * @returns Object with updated fields ready for Prisma update
 */
export function calculateSM2Update(
  confidence: ConfidenceRating,
  cardState: {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    lapses?: number;
  }
): {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: Date;
  lastResult: ConfidenceRating;
} {
  const result = updateCardWithSM2(confidence, cardState);
  return {
    easeFactor: result.easeFactor,
    intervalDays: result.intervalDays,
    repetitions: result.repetitions,
    lapses: result.lapses,
    dueAt: result.dueAt,
    lastResult: confidence,
  };
}

