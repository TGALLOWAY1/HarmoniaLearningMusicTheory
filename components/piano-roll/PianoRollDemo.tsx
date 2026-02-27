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
  const [octaveCount, setOctaveCount] = useState<1 | 2>(1);

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

  // Set PianoRoll range up to 2 octaves using theory utilities
  const lowestMidiNote = useMemo(
    () => pitchClassToMidi("C", DEMO_OCTAVE),
    []
  );
  const highestMidiNote = useMemo(
    () => pitchClassToMidi("B", DEMO_OCTAVE + octaveCount - 1),
    [octaveCount]
  );

  // Scale notes string for info bar (e.g. "C Major: C  D  E  F  G  A  B")
  const scaleNotesDisplay = useMemo(() => {
    const names = mappedScale.midiNotes.map((midi) => {
      const pc = midi % 12;
      const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      return noteNames[pc];
    });
    const scaleLabel = keyType === "major" ? "Major" : "Natural Minor";
    return `${keyRoot} ${scaleLabel}: ${names.join("  ·  ")}`;
  }, [mappedScale.midiNotes, keyRoot, keyType]);

  return (
    <div className="piano-panel max-w-[760px] w-full">
      <div className="flex items-baseline justify-between mb-6">
        <span className="piano-panel-title">Piano Roll</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="piano-control-label">Root</span>
          <select
            value={keyRoot}
            onChange={(e) => setKeyRoot(e.target.value as PitchClass)}
            className="piano-select font-mono"
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
          <span className="piano-control-label">Scale</span>
          <div className="flex gap-1">
            <button
              onClick={() => setKeyType("major")}
              className={clsx(
                "px-3 py-1 text-xs font-mono rounded transition-colors",
                keyType === "major"
                  ? "bg-[var(--piano-accent)] text-white"
                  : "bg-surface border border-subtle text-foreground hover:bg-surface-muted"
              )}
            >
              Major
            </button>
            <button
              onClick={() => setKeyType("natural_minor")}
              className={clsx(
                "px-3 py-1 text-xs font-mono rounded transition-colors",
                keyType === "natural_minor"
                  ? "bg-[var(--piano-accent)] text-white"
                  : "bg-surface border border-subtle text-foreground hover:bg-surface-muted"
              )}
            >
              Natural Minor
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="piano-control-label">Chord</span>
          <div className="flex flex-wrap gap-1">
            {diatonicChords.triads.map((diatonicTriad, idx) => (
              <button
                key={idx}
                onClick={() => setChordDegree(idx)}
                className={clsx(
                  "px-2 py-1 text-xs font-mono rounded transition-colors min-w-8 text-center",
                  chordDegree === idx
                    ? "bg-[var(--piano-accent)] text-white"
                    : "bg-surface border border-subtle text-foreground hover:bg-surface-muted"
                )}
                title={`${diatonicTriad.triad.root} ${diatonicTriad.triad.quality}`}
              >
                {diatonicTriad.degree}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <span className="piano-control-label">Octaves</span>
            <div className="inline-flex gap-0.5 rounded-md border border-subtle bg-surface-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setOctaveCount(1)}
                className={clsx(
                  "rounded px-3 py-1 font-mono transition-colors",
                  octaveCount === 1
                    ? "bg-[var(--piano-accent)] text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setOctaveCount(2)}
                className={clsx(
                  "rounded px-3 py-1 font-mono transition-colors",
                  octaveCount === 2
                    ? "bg-[var(--piano-accent)] text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                2
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="piano-control-label">View</span>
            <div className="inline-flex gap-0.5 rounded-md border border-subtle bg-surface-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("scale")}
                className={clsx(
                  "rounded px-3 py-1 font-mono transition-colors",
                  viewMode === "scale"
                    ? "bg-[var(--piano-accent)] text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                Scale
              </button>
              <button
                type="button"
                onClick={() => setViewMode("chord")}
                className={clsx(
                  "rounded px-3 py-1 font-mono transition-colors",
                  viewMode === "chord"
                    ? "bg-[var(--piano-accent)] text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                Chord
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mb-5">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--piano-text-dim)]">
          <div className="piano-legend-swatch in-scale-white" />
          <span>In scale (white)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--piano-text-dim)]">
          <div className="piano-legend-swatch in-scale-black" />
          <span>In scale (black)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--piano-text-dim)]">
          <div className="piano-legend-swatch out-scale" />
          <span>Out of scale</span>
        </div>
      </div>

      <PianoRoll
        lowestMidiNote={lowestMidiNote}
        highestMidiNote={highestMidiNote}
        highlightLayers={highlightLayers}
      />

      {/* Info bar */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--piano-border)] text-[11px] text-[var(--piano-text-dim)]">
        <div className="text-[13px] text-[var(--piano-text-bright)] tracking-wide min-w-[80px]">
          <span className="text-[var(--piano-accent)]">
            {viewMode === "scale"
              ? `${keyRoot} ${keyType === "major" ? "Major" : "Natural Minor"}`
              : highlightLayers[0]?.label ?? "—"}
          </span>
        </div>
        <div className="text-[10px] tracking-wide text-[var(--piano-text-dim)]">
          <em className="text-[#7868dd] not-italic">{scaleNotesDisplay}</em>
        </div>
      </div>
    </div>
  );
}

