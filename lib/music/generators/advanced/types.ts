import type { Mode } from "@/lib/theory/harmonyEngine";
import type { PitchClass } from "@/lib/theory/midiUtils";

export type AdvancedComplexity = 1 | 2 | 3 | 4;

export type VoicingStyle =
  | "auto"
  | "closed"
  | "open"
  | "drop2"
  | "drop3"
  | "spread";

export type VoiceCount = 3 | 4 | 5;

export type ChordKind =
  | "diatonic"
  | "functional-substitution"
  | "secondary-dominant"
  | "tritone-substitution"
  | "passing"
  | "suspension";

export type PlannedAdvancedChord = {
  degreeLabel: string;
  symbol: string;
  root: PitchClass;
  pitchClasses: PitchClass[];
  kind: ChordKind;
  isDominant?: boolean;
};

export type AdvancedProgressionOptions = {
  rootKey: PitchClass;
  mode: Mode;
  numChords?: number;
  complexity: AdvancedComplexity;
  voicingStyle: VoicingStyle;
  voiceCount: VoiceCount;
  rangeLow: number;
  rangeHigh: number;
  usePassingChords: boolean;
  useSuspensions: boolean;
  useSecondaryDominants: boolean;
  useTritoneSubstitution: boolean;
  useFunctionalSubstitutions?: boolean;
  seed?: number;
};

export type VoicedChord = {
  degreeLabel: string;
  symbol: string;
  midi: number[];
  notes: string[];
};

export type AdvancedProgressionResult = {
  chords: VoicedChord[];
  labels?: string[];
  debug?: {
    seed: number;
    planned: PlannedAdvancedChord[];
    voiceLeadingCosts: number[];
  };
};

export type VoicingCandidateContext = {
  style: VoicingStyle;
  voiceCount: VoiceCount;
  rangeLow: number;
  rangeHigh: number;
};
