"use client";

import { useMemo } from "react";
import { PianoRoll, type HighlightLayer } from "./PianoRoll";
import {
  pitchClassToMidi,
  type PitchClass,
} from "@/lib/theory/midiUtils";

// C Major Scale pitch classes
const C_MAJOR_SCALE_PITCH_CLASSES: PitchClass[] = [
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "B",
];

// C Major Chord pitch classes
const C_MAJOR_CHORD_PITCH_CLASSES: PitchClass[] = ["C", "E", "G"];

// Canonical octave: C3-B3 (MIDI 48-59)
const CANONICAL_OCTAVE = 3;

/**
 * Demo component showing PianoRoll with multiple highlight layers
 * 
 * Demonstrates:
 * - C Major Scale (all 7 notes) in single octave
 * - C Major Chord (C, E, G) in single octave
 * - All notes displayed in canonical octave 3 (C3-B3)
 */
export function PianoRollDemo() {
  // Map pitch classes to MIDI notes in the canonical octave
  const cMajorScaleNotes = useMemo(() => {
    return C_MAJOR_SCALE_PITCH_CLASSES.map((pc) =>
      pitchClassToMidi(pc, CANONICAL_OCTAVE)
    );
  }, []);

  const cMajorChordNotes = useMemo(() => {
    return C_MAJOR_CHORD_PITCH_CLASSES.map((pc) =>
      pitchClassToMidi(pc, CANONICAL_OCTAVE)
    );
  }, []);

  const highlightLayers: HighlightLayer[] = useMemo(
    () => [
      {
        id: "scale",
        label: "C Major Scale",
        midiNotes: cMajorScaleNotes,
      },
      {
        id: "chord",
        label: "C Major Chord",
        midiNotes: cMajorChordNotes,
      },
    ],
    [cMajorScaleNotes, cMajorChordNotes]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-foreground">
          Piano Roll Demo – Single Octave (C3–B3)
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm text-muted">
        {highlightLayers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center gap-2 px-3 py-1 bg-surface-muted rounded border border-subtle"
          >
            <div className="w-3 h-3 rounded bg-accent/40 border border-accent"></div>
            <span>{layer.label || layer.id}</span>
            <span className="text-muted text-xs">
              ({layer.midiNotes.length} notes)
            </span>
          </div>
        ))}
      </div>
      
      <PianoRoll highlightLayers={highlightLayers} />
    </div>
  );
}

