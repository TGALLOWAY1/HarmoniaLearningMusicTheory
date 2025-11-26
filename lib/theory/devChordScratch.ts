/**
 * Development Scratch File for Chord Testing
 * 
 * Temporary file for testing chord generation functions.
 * This can be removed or converted to proper tests later.
 */

import { getDiatonicChords } from "./chord";

// Test C major diatonic chords
console.log("=== C Major Diatonic Chords ===\n");

const cMajorChords = getDiatonicChords("C", "major");

console.log("Triads:");
cMajorChords.triads.forEach(({ degree, triad }) => {
  console.log(
    `${degree}: ${triad.pitchClasses.join(" ")} (${triad.quality})`
  );
});

console.log("\nSeventh Chords:");
cMajorChords.sevenths.forEach(({ degree, seventh }) => {
  console.log(
    `${degree}: ${seventh.pitchClasses.join(" ")} (${seventh.quality})`
  );
});

// Expected outputs:
// Triads:
// I: C E G (maj)
// ii: D F A (min)
// iii: E G B (min)
// IV: F A C (maj)
// V: G B D (maj)
// vi: A C E (min)
// vii°: B D F (dim)
//
// Seventh Chords:
// I: C E G B (maj7)
// ii: D F A C (min7)
// iii: E G B D (min7)
// IV: F A C E (maj7)
// V: G B D F (dom7)
// vi: A C E G (min7)
// vii°: B D F A (half-dim7)

