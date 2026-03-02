import { describe, expect, it } from "vitest";

import { generateAdvancedProgression } from "@/lib/music/generators/advanced/generateAdvancedProgression";
import { pickBestVoiceLedCandidate } from "@/lib/music/generators/advanced/voiceLeading";

describe("advanced generator", () => {
  const options = {
    rootKey: "C" as const,
    mode: "ionian" as const,
    numChords: 4,
    complexity: 3 as const,
    voicingStyle: "drop2" as const,
    voiceCount: 4 as const,
    rangeLow: 48,
    rangeHigh: 72,
    usePassingChords: true,
    useSuspensions: true,
    useSecondaryDominants: true,
    useTritoneSubstitution: false,
    seed: 123,
  };

  it("is deterministic with a fixed seed", () => {
    const a = generateAdvancedProgression(options);
    const b = generateAdvancedProgression(options);

    expect(a).toEqual(b);
    expect(a.chords).toMatchSnapshot();
  });

  it("prefers the inversion with lower total voice-leading cost", () => {
    const previous = [60, 64, 67];
    const candidates = [
      [55, 59, 62],
      [59, 62, 67],
    ];

    const picked = pickBestVoiceLedCandidate(previous, candidates, 60);

    expect(picked.voicing).toEqual([59, 62, 67]);
  });
});
