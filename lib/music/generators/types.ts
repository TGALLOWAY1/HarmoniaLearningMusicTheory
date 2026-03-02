import type { Depth, GeneratedChord, Mode } from "@/lib/theory/harmonyEngine";
import type { PitchClass } from "@/lib/theory/midiUtils";

import type { AdvancedProgressionOptions, AdvancedProgressionResult } from "./advanced/types";

export type GeneratorId = "simple" | "advanced";

export type SimpleGeneratorOptions = {
  rootKey: PitchClass;
  mode: Mode;
  depth: Depth;
  numChords: number;
};

export type SimpleGeneratorResult = GeneratedChord[];

export type GeneratorRequest =
  | {
      generatorId: "simple";
      options: SimpleGeneratorOptions;
    }
  | {
      generatorId: "advanced";
      options: AdvancedProgressionOptions;
    };

export type GeneratorResult = SimpleGeneratorResult | AdvancedProgressionResult;
