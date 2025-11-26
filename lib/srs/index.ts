/**
 * Spaced Repetition System (SRS) Utilities
 * 
 * This module contains functions for implementing spaced repetition
 * scheduling using the SuperMemo 2 (SM-2) algorithm.
 */

export {
  type ConfidenceRating,
  confidenceToQuality,
  type SM2Params,
  type SM2Result,
  calculateEaseFactor,
  calculateInterval,
  calculateDueDate,
  calculateSM2,
  updateCardWithSM2,
  calculateSM2Update,
} from "./sm2";

