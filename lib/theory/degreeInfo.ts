/**
 * Theory Information for Scale Degrees
 * 
 * Provides function descriptions and theory snippets for Roman numeral degrees.
 */

export type DegreeInfo = {
  degree: string;
  function: string;
  description: string;
};

/**
 * Get theory information for a scale degree
 * @param degree - Roman numeral (e.g., "I", "ii", "IV", "V")
 * @param keyType - "major" or "natural_minor"
 * @returns DegreeInfo with function and description
 */
export function getDegreeInfo(
  degree: string,
  keyType: "major" | "natural_minor"
): DegreeInfo | null {
  const degreeMap: Record<string, DegreeInfo> = {
    // Major key degrees
    I: {
      degree: "I",
      function: "Tonic",
      description: "Home chord — provides resolution and stability.",
    },
    ii: {
      degree: "ii",
      function: "Supertonic",
      description: "Prepares for V (dominant) — commonly leads to V or V7.",
    },
    iii: {
      degree: "iii",
      function: "Mediant",
      description: "Often substitutes for I — provides gentle movement.",
    },
    IV: {
      degree: "IV",
      function: "Subdominant",
      description: "Prepares for V — creates tension that resolves to dominant.",
    },
    V: {
      degree: "V",
      function: "Dominant",
      description: "Strongest tension — strongly resolves to I (tonic).",
    },
    vi: {
      degree: "vi",
      function: "Submediant",
      description: "Relative minor — often substitutes for I or leads to IV.",
    },
    "vii°": {
      degree: "vii°",
      function: "Leading Tone",
      description: "Diminished — creates strong pull to I.",
    },
    // Minor key degrees
    i: {
      degree: "i",
      function: "Tonic",
      description: "Home chord — provides resolution and stability.",
    },
    "ii°": {
      degree: "ii°",
      function: "Supertonic",
      description: "Diminished — prepares for V or V7.",
    },
    III: {
      degree: "III",
      function: "Mediant",
      description: "Relative major — provides contrast to minor tonic.",
    },
    iv: {
      degree: "iv",
      function: "Subdominant",
      description: "Prepares for V — creates tension that resolves to dominant.",
    },
    v: {
      degree: "v",
      function: "Dominant",
      description: "Minor dominant — weaker resolution than major V.",
    },
    VI: {
      degree: "VI",
      function: "Submediant",
      description: "Relative major — provides lift and contrast.",
    },
    VII: {
      degree: "VII",
      function: "Subtonic",
      description: "Major chord — less tension than leading tone.",
    },
  };

  return degreeMap[degree] || null;
}

