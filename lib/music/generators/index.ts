import { generateAdvancedProgression } from "./advanced/generateAdvancedProgression";
import { generateSimpleProgression } from "./simpleAdapter";
import type {
  AdvancedProgressionOptions,
  AdvancedProgressionResult,
} from "./advanced/types";
import type { GeneratorRequest, SimpleGeneratorOptions, SimpleGeneratorResult } from "./types";

export type { GeneratorId, GeneratorRequest, GeneratorResult, SimpleGeneratorOptions } from "./types";
export type {
  AdvancedComplexity,
  AdvancedProgressionOptions,
  AdvancedProgressionResult,
  VoicedChord,
  VoicingStyle,
  VoiceCount,
} from "./advanced/types";

export function generateFromRegistry(request: {
  generatorId: "simple";
  options: SimpleGeneratorOptions;
}): SimpleGeneratorResult;

export function generateFromRegistry(request: {
  generatorId: "advanced";
  options: AdvancedProgressionOptions;
}): AdvancedProgressionResult;

export function generateFromRegistry(request: GeneratorRequest) {
  if (request.generatorId === "simple") {
    return generateSimpleProgression(request.options);
  }

  return generateAdvancedProgression(request.options);
}
