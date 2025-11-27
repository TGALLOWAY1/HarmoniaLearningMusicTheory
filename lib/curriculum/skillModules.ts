export type SkillModuleKind =
  | "triad_builder"
  | "interval_quiz"
  | "circle_boss";

export type SkillModule = {
  id: string;
  milestoneKey: string; // e.g. "TRIADS" or "CIRCLE_OF_FIFTHS"
  kind: SkillModuleKind;
  title: string;
  description: string;
  difficulty: "intro" | "core" | "boss";
};

export const SKILL_MODULES: SkillModule[] = [
  {
    id: "triads-triad-builder-core",
    milestoneKey: "TRIADS",
    kind: "triad_builder",
    title: "Triad Builder",
    description: "Build major and minor triads using an interactive keyboard.",
    difficulty: "core",
  },
  {
    id: "circle-blank-boss",
    milestoneKey: "CIRCLE_OF_FIFTHS",
    kind: "circle_boss",
    title: "Circle Boss",
    description: "Rebuild the circle of fifths from memory.",
    difficulty: "boss",
  },
];

export function getSkillModulesForMilestone(key: string): SkillModule[] {
  return SKILL_MODULES.filter((m) => m.milestoneKey === key);
}

