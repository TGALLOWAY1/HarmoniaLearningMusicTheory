"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { PianoRoll, type HighlightLayer } from "./PianoRoll";
import {
  getMajorScale,
  getNaturalMinorScale,
  buildTriadFromScale,
  getDiatonicChords,
  mapScaleToMidi,
  mapTriadToMidi,
  pitchClassToMidi,
  type PitchClass,
  type ScaleType,
} from "@/lib/theory";

// Canonical octave: C3-B3 (MIDI 48-59)
const DEMO_OCTAVE = 3;

type PianoRollViewMode = "scale" | "chord";

/**
 * Demo component showing PianoRoll with multiple highlight layers
 * 
 * Demonstrates:
 * - Scales and chords generated using theory engine (no hard-coded arrays)
 * - Single octave display (C3-B3)
 * - Interactive controls to switch between keys and chord degrees
 * - View mode toggle to switch between scale and chord highlights
 * - All notes mapped to canonical octave 3
 */
export function PianoRollDemo() {
  // State for key selection
  const [keyRoot, setKeyRoot] = useState<PitchClass>("C");
  const [keyType, setKeyType] = useState<ScaleType>("major");
  const [chordDegree, setChordDegree] = useState<number>(0); // 0 = I/i, 1 = ii/ii°, etc.
  
  // State for view mode
  const [viewMode, setViewMode] = useState<PianoRollViewMode>("scale");

  // Generate scale using theory engine
  const scale = useMemo(() => {
    return keyType === "major"
      ? getMajorScale(keyRoot)
      : getNaturalMinorScale(keyRoot);
  }, [keyRoot, keyType]);

  // Map scale to MIDI notes in the canonical octave
  const mappedScale = useMemo(
    () => mapScaleToMidi(scale, DEMO_OCTAVE),
    [scale]
  );

  // Build triad for selected chord degree using theory engine
  const triad = useMemo(
    () => buildTriadFromScale(scale, chordDegree),
    [scale, chordDegree]
  );

  // Map triad to MIDI notes in the canonical octave
  const mappedTriad = useMemo(
    () => mapTriadToMidi(triad, DEMO_OCTAVE),
    [triad]
  );

  // Get all diatonic chords for reference
  const diatonicChords = useMemo(
    () => getDiatonicChords(keyRoot, keyType),
    [keyRoot, keyType]
  );

  // Define individual highlight layers
  const scaleLayer: HighlightLayer = useMemo(
    () => ({
      id: "scale",
      label: `${keyRoot} ${keyType === "major" ? "Major" : "Natural Minor"} Scale`,
      midiNotes: mappedScale.midiNotes,
    }),
    [mappedScale.midiNotes, keyRoot, keyType]
  );

  const chordLayer: HighlightLayer = useMemo(
    () => ({
      id: "chord",
      label: `${diatonicChords.triads[chordDegree].degree}: ${triad.root} ${triad.quality === "maj" ? "Major" : triad.quality === "min" ? "Minor" : triad.quality === "dim" ? "Diminished" : "Augmented"}`,
      midiNotes: mappedTriad.midiNotes,
    }),
    [mappedTriad.midiNotes, chordDegree, triad, diatonicChords]
  );

  // Build highlight layers based on view mode
  const highlightLayers: HighlightLayer[] = useMemo(
    () => (viewMode === "scale" ? [scaleLayer] : [chordLayer]),
    [viewMode, scaleLayer, chordLayer]
  );

  // Set PianoRoll range to single octave using theory utilities
  const lowestMidiNote = useMemo(
    () => pitchClassToMidi("C", DEMO_OCTAVE),
    []
  );
  const highestMidiNote = useMemo(
    () => pitchClassToMidi("B", DEMO_OCTAVE),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-foreground">
          Piano Roll Demo – Single Octave (C3–B3)
        </h3>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-surface-muted rounded-lg border border-subtle">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Key:</label>
          <select
            value={keyRoot}
            onChange={(e) => setKeyRoot(e.target.value as PitchClass)}
            className="px-2 py-1 text-sm bg-surface border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(
              (pc) => (
                <option key={pc} value={pc}>
                  {pc}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Type:</label>
          <button
            onClick={() => setKeyType("major")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              keyType === "major"
                ? "bg-accent text-surface"
                : "bg-surface border border-subtle text-muted hover:bg-surface-muted"
            }`}
          >
            Major
          </button>
          <button
            onClick={() => setKeyType("natural_minor")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              keyType === "natural_minor"
                ? "bg-accent text-surface"
                : "bg-surface border border-subtle text-muted hover:bg-surface-muted"
            }`}
          >
            Minor
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Chord:</label>
          <div className="flex flex-wrap gap-1">
            {diatonicChords.triads.map((diatonicTriad, idx) => (
              <button
                key={idx}
                onClick={() => setChordDegree(idx)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  chordDegree === idx
                    ? "bg-accent text-surface"
                    : "bg-surface border border-subtle text-muted hover:bg-surface-muted"
                }`}
                title={`${diatonicTriad.triad.root} ${diatonicTriad.triad.quality}`}
              >
                {diatonicTriad.degree}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-muted">
          <span className="font-medium text-foreground">View mode:</span>{" "}
          {viewMode === "scale" ? "Scale notes" : "Chord notes"}
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-full border border-subtle bg-surface-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("scale")}
            className={clsx(
              "rounded-full px-3 py-1 transition-colors duration-150",
              viewMode === "scale"
                ? "bg-emerald-500 text-white"
                : "text-muted hover:bg-surface"
            )}
          >
            Scale
          </button>
          <button
            type="button"
            onClick={() => setViewMode("chord")}
            className={clsx(
              "rounded-full px-3 py-1 transition-colors duration-150",
              viewMode === "chord"
                ? "bg-emerald-500 text-white"
                : "text-muted hover:bg-surface"
            )}
          >
            Chord
          </button>
        </div>
      </div>
      
      {/* Active layer indicator */}
      <div className="flex flex-wrap gap-4 text-sm text-muted">
        {highlightLayers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center gap-2 px-3 py-1 bg-surface-muted rounded border border-subtle"
          >
            <div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500"></div>
            <span>{layer.label || layer.id}</span>
            <span className="text-muted text-xs">
              ({layer.midiNotes.length} notes)
            </span>
          </div>
        ))}
      </div>
      
      <PianoRoll
        lowestMidiNote={lowestMidiNote}
        highestMidiNote={highestMidiNote}
        highlightLayers={highlightLayers}
      />
    </div>
  );
}

