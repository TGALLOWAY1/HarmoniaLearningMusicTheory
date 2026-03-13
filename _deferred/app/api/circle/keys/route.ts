import { NextResponse } from "next/server";
import {
  getCircleNodes,
  getNeighborsForKey,
  type PitchClass,
} from "@/lib/theory";

type AccidentalType = "none" | "sharps" | "flats";

type CircleKeyDto = {
  id: string;
  root: string;
  type: "major";
  clockPosition: number;
  accidentals: number;
  accidentalType: AccidentalType;
  relativeMinorId: string;
  neighbors: {
    clockwise: string;
    counterclockwise: string;
  };
};

type CircleKeysResponse = {
  keys: CircleKeyDto[];
};

/**
 * Get accidentals count and type for a major key based on its circle position.
 * 
 * Circle-of-fifths convention:
 * - C (position 0): 0 accidentals, "none"
 * - Positions 1-7: sharps (count = position)
 * - Positions 8-11: flats (count = 12 - position)
 * 
 * Note: Positions 8-11 use enharmonic equivalents (G#→Ab, D#→Eb, A#→Bb)
 * but we keep the root as-is from the circle for consistency.
 */
function getAccidentalsForPosition(
  position: number,
  root: PitchClass
): { accidentals: number; accidentalType: AccidentalType } {
  if (position === 0) {
    return { accidentals: 0, accidentalType: "none" };
  } else if (position >= 1 && position <= 7) {
    return { accidentals: position, accidentalType: "sharps" };
  } else {
    // Positions 8-11: flats
    return { accidentals: 12 - position, accidentalType: "flats" };
  }
}

export async function GET() {
  try {
    const nodes = getCircleNodes();
    const keys: CircleKeyDto[] = [];

    for (const node of nodes) {
      // Get neighbors (left = counterclockwise, right = clockwise)
      const neighbors = getNeighborsForKey(node.root);

      // Get accidentals info
      const { accidentals, accidentalType } = getAccidentalsForPosition(
        node.index,
        node.root
      );

      // Build the key descriptor
      const key: CircleKeyDto = {
        id: `${node.root}_major`,
        root: node.root,
        type: "major",
        clockPosition: node.index,
        accidentals,
        accidentalType,
        relativeMinorId: `${node.relativeMinor}_minor`,
        neighbors: {
          clockwise: `${neighbors.right}_major`,
          counterclockwise: `${neighbors.left}_major`,
        },
      };

      keys.push(key);
    }

    const response: CircleKeysResponse = {
      keys,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching circle keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

