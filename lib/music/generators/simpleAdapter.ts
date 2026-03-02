import { generateProgression, type GeneratedChord } from "@/lib/theory/harmonyEngine";

import type { SimpleGeneratorOptions } from "./types";

/**
 * Pass-through adapter to preserve existing simple generator behavior exactly.
 */
export function generateSimpleProgression(options: SimpleGeneratorOptions): GeneratedChord[] {
  return generateProgression(options);
}
