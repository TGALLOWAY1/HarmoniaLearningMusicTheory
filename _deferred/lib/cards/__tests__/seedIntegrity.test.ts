import { describe, it, expect } from "vitest";
import { getAllTemplateDefinitionsForValidation } from "../seedTemplates";
import { normalizeMetaForQuery } from "../metaNormalization";

describe("seed integrity", () => {
  const templates = getAllTemplateDefinitionsForValidation();

  describe("MCQ correctness", () => {
    it("every template has correctIndex within options bounds", () => {
      for (const t of templates) {
        const options = [t.optionA, t.optionB, t.optionC, t.optionD];
        expect(
          t.correctIndex >= 0 && t.correctIndex < options.length,
          `${t.slug}: correctIndex ${t.correctIndex} out of bounds for ${options.length} options`
        ).toBe(true);
      }
    });

    it("every template has unique option strings", () => {
      for (const t of templates) {
        const options = [t.optionA, t.optionB, t.optionC, t.optionD];
        const unique = new Set(options);
        expect(
          unique.size === 4,
          `${t.slug}: duplicate options in ${JSON.stringify(options)}`
        ).toBe(true);
      }
    });
  });

  describe("circle neighbor cards have directionality", () => {
    it("circle_neighbor_key templates have meta.direction and prompt with clockwise/counterclockwise", () => {
      const neighborCards = templates.filter((t) => t.kind === "circle_neighbor_key");
      expect(neighborCards.length).toBeGreaterThan(0);
      for (const t of neighborCards) {
        const meta = t.meta as Record<string, unknown>;
        expect(
          meta.direction === "clockwise" || meta.direction === "counterclockwise",
          `${t.slug}: missing meta.direction`
        ).toBe(true);
        const hasDirectionality =
          t.question.toLowerCase().includes("clockwise") ||
          t.question.toLowerCase().includes("counterclockwise");
        expect(hasDirectionality, `${t.slug}: prompt lacks directionality`).toBe(true);
      }
    });
  });

  describe("required meta for milestone kinds", () => {
    it("CIRCLE_OF_FIFTHS key-specific templates have majorRoot or keyRoot", () => {
      const keySpecificKinds = ["circle_neighbor_key", "circle_relative_minor", "circle_geometry"];
      const circleCards = templates.filter(
        (t) => t.milestoneKey === "CIRCLE_OF_FIFTHS" && keySpecificKinds.includes(t.kind)
      );
      for (const t of circleCards) {
        const norm = normalizeMetaForQuery(t.meta, t.kind);
        const meta = t.meta as Record<string, unknown>;
        const hasRoot = typeof norm.keyRoot === "string" || meta.majorRoot;
        expect(hasRoot, `${t.slug}: CIRCLE_OF_FIFTHS key card needs meta.majorRoot`).toBe(true);
      }
    });

    it("scale/chord templates have keyType and keyRoot (canonical or legacy)", () => {
      const scaleChordKinds = [
        "scale_spelling",
        "diatonic_chord_id",
        "degree_to_chord",
        "chord_to_degree",
        "mode_character",
        "progression_prediction",
      ];
      for (const t of templates) {
        if (!scaleChordKinds.includes(t.kind)) continue;
        const norm = normalizeMetaForQuery(t.meta, t.kind);
        expect(typeof norm.keyType === "string" || (t.meta as Record<string, unknown>).type, `${t.slug}: needs keyType/type`).toBeTruthy();
        expect(typeof norm.keyRoot === "string" || (t.meta as Record<string, unknown>).root, `${t.slug}: needs keyRoot/root`).toBeTruthy();
      }
    });
  });
});
