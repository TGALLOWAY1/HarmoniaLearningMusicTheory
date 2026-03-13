import { describe, it, expect } from "vitest";
import { GET } from "../route";

describe("GET /api/theory/key-diatonic-chords", () => {
  it("returns vii chord with m7b5 (not min7) for C major sevenths", async () => {
    const url = "http://localhost/api/theory/key-diatonic-chords?root=C&type=major&extensions=sevenths";
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      key: { root: string; type: string };
      chords: Array<{ degree: string; symbol: string; quality: string; notes: string[] }>;
    };
    expect(json.key.root).toBe("C");
    expect(json.key.type).toBe("major");
    expect(json.chords).toHaveLength(7);

    const vii = json.chords[6];
    expect(vii.degree).toBe("vii°");
    expect(vii.quality).toBe("half-dim7");
    expect(vii.symbol).toMatch(/m7b5|ø7/);
    expect(vii.symbol).not.toBe("Bm7");
    expect(vii.notes).toEqual(["B", "D", "F", "A"]);
  });

  it("returns correct chord tones for all diatonic sevenths in C major", async () => {
    const url = "http://localhost/api/theory/key-diatonic-chords?root=C&type=major&extensions=sevenths";
    const request = new Request(url);
    const response = await GET(request);
    const json = (await response.json()) as { chords: Array<{ degree: string; notes: string[] }> };

    const expected: Record<string, string[]> = {
      I: ["C", "E", "G", "B"],
      ii: ["D", "F", "A", "C"],
      iii: ["E", "G", "B", "D"],
      IV: ["F", "A", "C", "E"],
      V: ["G", "B", "D", "F"],
      vi: ["A", "C", "E", "G"],
      "vii°": ["B", "D", "F", "A"],
    };
    for (const chord of json.chords) {
      expect(chord.notes).toEqual(expected[chord.degree]);
    }
  });
});
