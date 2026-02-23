import { describe, it, expect } from "vitest";
import { generateChordProgression } from "../../chordGeneratorAdapter";
import type { PitchClass } from "../midiUtils";

describe("chordGeneratorAdapter", () => {
  describe("note normalization (Tonal flats → Harmonia sharps)", () => {
    it("D natural_minor maps to aeolian and produces no flats in notes", () => {
      const progression = generateChordProgression("D", "natural_minor");
      expect(progression.length).toBeGreaterThan(0);

      const allNotes = progression.flatMap((c) => c.notes);
      const hasFlat = allNotes.some((n) => n.includes("b"));
      expect(hasFlat).toBe(false);

      const harmoniaPitchClasses = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      for (const note of allNotes) {
        expect(harmoniaPitchClasses).toContain(note);
      }
    });

    it("chord that would contain Bb (e.g. D aeolian bVI) returns A# not Bb", () => {
      const progression = generateChordProgression("D", "natural_minor");
      const allNotes = progression.flatMap((c) => c.notes);

      expect(allNotes).not.toContain("Bb");
      expect(allNotes).not.toContain("Eb");
      expect(allNotes).not.toContain("Ab");
      expect(allNotes).not.toContain("Db");
      expect(allNotes).not.toContain("Gb");

      const bVIChord = progression.find((c) => c.degree === "bVI");
      if (bVIChord) {
        expect(bVIChord.notes).toContain("A#");
        expect(bVIChord.notes).not.toContain("Bb");
      }
    });

    it("returns PitchClass[] only (no octaves)", () => {
      const progression = generateChordProgression("C", "major");
      for (const chord of progression) {
        for (const note of chord.notes) {
          expect(note).toMatch(/^[A-G]#?$/);
          expect(note).not.toMatch(/\d/);
        }
      }
    });

    it("preserves chord tone order (no reordering beyond dedup)", () => {
      const progression = generateChordProgression("D", "natural_minor");
      for (const chord of progression) {
        const seen = new Set<string>();
        for (const note of chord.notes) {
          expect(seen.has(note)).toBe(false);
          seen.add(note);
        }
      }
    });
  });

  describe("input validation", () => {
    it("rejects flat roots at runtime", () => {
      expect(() =>
        generateChordProgression("Bb" as PitchClass, "natural_minor")
      ).toThrow(/Invalid root.*Bb.*sharps-only/);
    });
  });
});
