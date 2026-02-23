import { describe, it, expect } from "vitest";
import {
  buildTriadFromRoot,
  buildSeventhFromRoot,
  getDiatonicChords,
  buildSeventhFromScale,
} from "../chord";
import { getMajorScale } from "../scale";

// Engine uses sharp-only pitch classes (C#, D#, F#, G#, A#). Flats appear as enharmonic sharps.
// TODO: Improve enharmonic handling (e.g. C minor as C Eb G) in a future enhancement.

describe("chord golden tests", () => {
  describe("C major triad", () => {
    it("returns C E G", () => {
      const triad = buildTriadFromRoot("C", "maj");
      expect(triad.root).toBe("C");
      expect(triad.quality).toBe("maj");
      expect(triad.pitchClasses).toEqual(["C", "E", "G"]);
    });
  });

  describe("C minor triad", () => {
    it("returns C D# G (sharp-only engine spelling)", () => {
      const triad = buildTriadFromRoot("C", "min");
      expect(triad.root).toBe("C");
      expect(triad.quality).toBe("min");
      expect(triad.pitchClasses).toEqual(["C", "D#", "G"]);
    });
  });

  describe("C7 (dominant seventh)", () => {
    it("returns C E G A# (sharp-only engine spelling)", () => {
      const seventh = buildSeventhFromRoot("C", "dom7");
      expect(seventh.root).toBe("C");
      expect(seventh.quality).toBe("dom7");
      expect(seventh.pitchClasses).toEqual(["C", "E", "G", "A#"]);
    });
  });

  describe("Cmaj7", () => {
    it("returns C E G B", () => {
      const seventh = buildSeventhFromRoot("C", "maj7");
      expect(seventh.root).toBe("C");
      expect(seventh.quality).toBe("maj7");
      expect(seventh.pitchClasses).toEqual(["C", "E", "G", "B"]);
    });
  });

  describe("B half-diminished seventh", () => {
    it("returns B D F A with quality half-dim7", () => {
      const scale = getMajorScale("C");
      const seventh = buildSeventhFromScale(scale, 6); // vii
      expect(seventh.root).toBe("B");
      expect(seventh.quality).toBe("half-dim7");
      expect(seventh.pitchClasses).toEqual(["B", "D", "F", "A"]);
    });

    it("is diatonic vii° in C major from getDiatonicChords", () => {
      const diatonic = getDiatonicChords("C", "major");
      const vii = diatonic.sevenths[6];
      expect(vii.degree).toBe("vii°");
      expect(vii.seventh.quality).toBe("half-dim7");
      expect(vii.seventh.pitchClasses).toEqual(["B", "D", "F", "A"]);
    });
  });
});
