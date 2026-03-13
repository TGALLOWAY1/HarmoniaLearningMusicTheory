import { describe, it, expect } from "vitest";
import { filterTemplatesByScaleMeta } from "../filterTemplatesByScaleMeta";

describe("filterTemplatesByScaleMeta", () => {
  it("includes template with canonical meta.keyType/keyRoot when filtering", () => {
    const templates = [
      {
        id: 1,
        kind: "scale_spelling",
        meta: { keyType: "major", keyRoot: "C" },
      },
    ];
    const result = filterTemplatesByScaleMeta(templates, {
      scaleType: "major",
      scaleRoot: "C",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("includes template with legacy meta.type/root when filtering (normalization works)", () => {
    const templates = [
      {
        id: 2,
        kind: "scale_spelling",
        meta: { type: "major", root: "C" },
      },
    ];
    const result = filterTemplatesByScaleMeta(templates, {
      scaleType: "major",
      scaleRoot: "C",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("excludes template when meta does not match filter", () => {
    const templates = [
      {
        id: 3,
        kind: "scale_spelling",
        meta: { keyType: "major", keyRoot: "G" },
      },
    ];
    const result = filterTemplatesByScaleMeta(templates, {
      scaleType: "major",
      scaleRoot: "C",
    });
    expect(result).toHaveLength(0);
  });

  it("returns all templates when no scale filter specified", () => {
    const templates = [
      { id: 1, kind: "scale_spelling", meta: {} },
      { id: 2, kind: "other", meta: {} },
    ];
    const result = filterTemplatesByScaleMeta(templates, {});
    expect(result).toHaveLength(2);
  });
});
