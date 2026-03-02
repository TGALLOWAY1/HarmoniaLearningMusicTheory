import { describe, expect, it, vi } from "vitest";

import { generateProgression } from "@/lib/theory/harmonyEngine";
import { generateFromRegistry } from "@/lib/music/generators";

function withRandomSequence<T>(values: number[], run: () => T): T {
  const spy = vi.spyOn(Math, "random");
  let idx = 0;
  spy.mockImplementation(() => values[idx++] ?? values[values.length - 1] ?? 0);

  try {
    return run();
  } finally {
    spy.mockRestore();
  }
}

describe("generator registry - simple adapter compatibility", () => {
  it("simple registry path is a pass-through to existing generator behavior", () => {
    const sequence = [0.78, 0.32, 0.04];

    const direct = withRandomSequence(sequence, () =>
      generateProgression({
        rootKey: "C",
        mode: "ionian",
        depth: 2,
        numChords: 4,
      })
    );

    const viaRegistry = withRandomSequence(sequence, () =>
      generateFromRegistry({
        generatorId: "simple",
        options: {
          rootKey: "C",
          mode: "ionian",
          depth: 2,
          numChords: 4,
        },
      })
    );

    expect(viaRegistry).toEqual(direct);
  });

  it("keeps deterministic simple output for a fixed C major input", () => {
    const output = withRandomSequence([0.99, 0.28, 0.01], () =>
      generateFromRegistry({
        generatorId: "simple",
        options: {
          rootKey: "C",
          mode: "ionian",
          depth: 1,
          numChords: 4,
        },
      })
    );

    expect(output).toEqual([
      { degree: "I", quality: "maj7" },
      { degree: "vii°", quality: "dim" },
      { degree: "ii", quality: "m7" },
      { degree: "I", quality: "maj7" },
    ]);
  });
});
