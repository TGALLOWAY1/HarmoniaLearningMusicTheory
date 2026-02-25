import { describe, it, expect } from "vitest";
import { GET } from "../route";

describe("GET /api/theory/progression", () => {
  it("returns D natural_minor progression with sharps-only notes (no Bb)", async () => {
    const url =
      "http://localhost/api/theory/progression?root=D&scaleType=natural_minor";
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      root: string;
      scaleType: string;
      chords: Array<{ degree: string; symbol: string; quality: string; notes: string[] }>;
    };
    expect(json.root).toBe("D");
    expect(json.scaleType).toBe("natural_minor");
    expect(json.chords).toHaveLength(4);

    const harmoniaPitchClasses = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const allNotes = json.chords.flatMap((c) => c.notes);
    for (const note of allNotes) {
      expect(harmoniaPitchClasses).toContain(note);
      expect(note).not.toMatch(/b/);
    }
    expect(allNotes).not.toContain("Bb");
  });

  it("returns 400 when root is missing", async () => {
    const url = "http://localhost/api/theory/progression?scaleType=natural_minor";
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when scaleType is invalid", async () => {
    const url =
      "http://localhost/api/theory/progression?root=D&scaleType=invalid";
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
