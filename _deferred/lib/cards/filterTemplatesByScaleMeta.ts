/**
 * Pure filter for templates by scale key metadata.
 * Used by /api/cards/next; exported for testing.
 */
import { normalizeMetaForQuery } from "./metaNormalization";

const CHORD_BASED_KINDS = ["notes_from_chord", "chord_from_notes"];

export type TemplateLike = {
  id: number;
  kind: string;
  meta: unknown;
};

/**
 * Filter templates by scale type and root. Uses canonical meta (keyType, keyRoot)
 * with legacy fallbacks (type->keyType, root->keyRoot).
 */
export function filterTemplatesByScaleMeta<T extends TemplateLike>(
  templates: T[],
  opts: { scaleType?: string; scaleRoot?: string }
): T[] {
  const { scaleType, scaleRoot } = opts;
  if (!scaleType && !scaleRoot) return templates;

  return templates.filter((t) => {
    if (!t.meta || typeof t.meta !== "object") return false;
    const meta = t.meta as Record<string, unknown>;

    if (CHORD_BASED_KINDS.includes(t.kind)) {
      if (!meta.scaleMemberships || !Array.isArray(meta.scaleMemberships)) {
        return false;
      }
      return (meta.scaleMemberships as Array<{ keyType?: string; keyRoot?: string }>).some(
        (membership) => {
          const matchesType = !scaleType || membership.keyType === scaleType;
          const matchesRoot = !scaleRoot || membership.keyRoot === scaleRoot;
          return matchesType && matchesRoot;
        }
      );
    }

    const norm = normalizeMetaForQuery(meta, t.kind);
    if (scaleType && norm.keyType !== scaleType) return false;
    if (scaleRoot && norm.keyRoot !== scaleRoot) return false;
    return true;
  });
}
