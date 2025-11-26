/**
 * Development Scratch File
 * 
 * Temporary file for testing scale generation functions.
 * This can be removed or converted to proper tests later.
 */

import { getMajorScale, getNaturalMinorScale } from "./scale";
import { getCircleNodes, getNeighborsForKey, getRelativeMinor } from "./circle";

// Sanity checks
console.log("C Major Scale:", getMajorScale("C"));
console.log("A Natural Minor Scale:", getNaturalMinorScale("A"));
console.log("G Major Scale:", getMajorScale("G"));
console.log("E Natural Minor Scale:", getNaturalMinorScale("E"));

// Expected outputs:
// C Major: { root: "C", type: "major", pitchClasses: ["C", "D", "E", "F", "G", "A", "B"] }
// A Natural Minor: { root: "A", type: "natural_minor", pitchClasses: ["A", "B", "C", "D", "E", "F", "G"] }

// Circle of Fifths sanity checks
console.log("\n=== Circle of Fifths Sanity Checks ===");
const nodes = getCircleNodes();
console.log("All Circle Nodes:", nodes.map(n => `${n.root} (${n.relativeMinor}m)`).join(", "));

console.log("\nC's neighbors:", getNeighborsForKey("C"));
console.log("Expected: { root: 'C', left: 'F', right: 'G' }");

console.log("\nG's neighbors:", getNeighborsForKey("G"));
console.log("Expected: { root: 'G', left: 'C', right: 'D' }");

console.log("\nRelative minors:");
console.log("C ->", getRelativeMinor("C"), "(expected: A)");
console.log("G ->", getRelativeMinor("G"), "(expected: E)");
console.log("D ->", getRelativeMinor("D"), "(expected: B)");
console.log("F ->", getRelativeMinor("F"), "(expected: D)");

