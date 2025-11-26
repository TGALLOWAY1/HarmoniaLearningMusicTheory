/**
 * Development Scratch File
 * 
 * Temporary file for testing scale generation functions.
 * This can be removed or converted to proper tests later.
 */

import { getMajorScale, getNaturalMinorScale } from "./scale";

// Sanity checks
console.log("C Major Scale:", getMajorScale("C"));
console.log("A Natural Minor Scale:", getNaturalMinorScale("A"));
console.log("G Major Scale:", getMajorScale("G"));
console.log("E Natural Minor Scale:", getNaturalMinorScale("E"));

// Expected outputs:
// C Major: { root: "C", type: "major", pitchClasses: ["C", "D", "E", "F", "G", "A", "B"] }
// A Natural Minor: { root: "A", type: "natural_minor", pitchClasses: ["A", "B", "C", "D", "E", "F", "G"] }

