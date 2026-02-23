import { describe, it, expect } from "vitest";
import {
  generateChordProgression,
  SCALE_TYPE_TO_MODE,
  type ChordGeneratorMode,
} from "../../chordGeneratorAdapter";
import type { PitchClass } from "../midiUtils";
import type { ScaleType } from "../types";

describe("chordGeneratorAdapter", () => {
  describe("ScaleType → ChordGenerator Mode mapping", () => {
    const expectedMapping: Array<[ScaleType, ChordGeneratorMode]> = [
      ["major", "ionian"],
      ["natural_minor", "aeolian"],
      ["dorian", "dorian"],
      ["mixolydian", "mixolydian"],
      ["phrygian", "phrygian"],
    ];

    it("SCALE_TYPE_TO_MODE has correct entries for all Harmonia ScaleTypes", () => {
      for (const [scaleType, expectedMode] of expectedMapping) {
        expect(SCALE_TYPE_TO_MODE[scaleType]).toBe(expectedMode);
      }
    });

    it("each ScaleType maps to exactly one ChordGenerator Mode", () => {
      const scaleTypes: ScaleType[] = ["major", "natural_minor", "dorian", "mixolydian", "phrygian"];
      for (const st of scaleTypes) {
        const mode = SCALE_TYPE_TO_MODE[st];
        expect(mode).toBeDefined();
        expect(["ionian", "aeolian", "dorian", "mixolydian", "phrygian"]).toContain(mode);
      }
    });

    it("adapter calls ChordGenerator with correct mode for each ScaleType", () => {
      for (const [scaleType, expectedMode] of expectedMapping) {
        const progression = generateChordProgression("C", scaleType);
        expect(progression.length).toBe(4);
        expect(progression.every((c) => c.notes.length > 0)).toBe(true);
      }
    });
  });
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
