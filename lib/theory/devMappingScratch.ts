/**
 * Development Scratch File for Mapping Testing
 * 
 * Temporary file for testing scale/chord to MIDI mapping functions.
 * This can be removed or converted to proper tests later.
 */

import { getMajorScale } from "./scale";
import { buildTriadFromScale } from "./chord";
import { mapScaleToMidi, mapTriadToMidi } from "./mapping";

// Test C major scale mapping
console.log("=== C Major Scale Mapping ===\n");

const cMajorScale = getMajorScale("C");
console.log("Scale pitch classes:", cMajorScale.pitchClasses.join(" "));

const mappedScale = mapScaleToMidi(cMajorScale, 3);
console.log("Mapped to octave 3:");
console.log("  MIDI notes:", mappedScale.midiNotes.join(", "));
console.log("  Note names:", mappedScale.midiNotes.map(m => {
  const pc = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][m % 12];
  const oct = Math.floor(m / 12) - 1;
  return `${pc}${oct}`;
}).join(", "));

// Expected: C3 D3 E3 F3 G3 A3 B3 -> MIDI 48, 50, 52, 53, 55, 57, 59

// Test triad mapping
console.log("\n=== C Major Triad (I) Mapping ===\n");

const cMajorTriad = buildTriadFromScale(cMajorScale, 0);
console.log("Triad pitch classes:", cMajorTriad.pitchClasses.join(" "));

const mappedTriad = mapTriadToMidi(cMajorTriad, 3);
console.log("Mapped to octave 3:");
console.log("  MIDI notes:", mappedTriad.midiNotes.join(", "));
console.log("  Note names:", mappedTriad.midiNotes.map(m => {
  const pc = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][m % 12];
  const oct = Math.floor(m / 12) - 1;
  return `${pc}${oct}`;
}).join(", "));

// Expected: C3 E3 G3 -> MIDI 48, 52, 55

// Verify no duplicates
console.log("\n=== Duplicate Check ===\n");
const allNotes = [...mappedScale.midiNotes, ...mappedTriad.midiNotes];
const uniqueNotes = new Set(allNotes);
console.log(`Total notes: ${allNotes.length}, Unique notes: ${uniqueNotes.size}`);
console.log("No duplicates:", allNotes.length === uniqueNotes.size);

