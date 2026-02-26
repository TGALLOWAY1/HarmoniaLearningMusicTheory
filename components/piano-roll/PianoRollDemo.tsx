"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { PianoRoll, type HighlightLayer } from "./PianoRoll";
import {
  getScaleDefinition,
  buildTriadFromScale,
  getDiatonicChords,
  mapScaleToMidi,
  mapTriadToMidi,
  pitchClassToMidi,
  midiToNoteName,
  type PitchClass,
  type ScaleType,
} from "@/lib/theory";

const PITCH_CLASSES: PitchClass[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const SCALE_OPTIONS: { value: ScaleType; label: string }[] = [
  { value: "major", label: "Major" },
  { value: "natural_minor", label: "Natural Minor" },
  { value: "dorian", label: "Dorian" },
  { value: "phrygian", label: "Phrygian" },
  { value: "mixolydian", label: "Mixolydian" },
];

const OCTAVE_OPTIONS = [1, 2, 3] as const;
const START_OCTAVE = 3;

type PianoRollViewMode = "scale" | "chord";

/**
 * Demo component showing PianoRoll with reference styling
 *
 * Features:
 * - Root, Scale, Octaves selectors
 * - Legend (in-scale white, in-scale black, out-of-scale)
 * - Info bar with last played note and scale notes
 * - Scale and chord view modes
 * - Click-to-play key flash
 */
export function PianoRollDemo() {
  const [keyRoot, setKeyRoot] = useState<PitchClass>("C");
  const [keyType, setKeyType] = useState<ScaleType>("major");
  const [octaveCount, setOctaveCount] = useState<2 | 1 | 3>(2);
  const [chordDegree, setChordDegree] = useState<number>(0);
  const [viewMode, setViewMode] = useState<PianoRollViewMode>("scale");
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);

  const scale = useMemo(
    () => getScaleDefinition(keyRoot, keyType),
    [keyRoot, keyType]
  );

  const scaleNotesForDisplay = useMemo(
    () => scale.pitchClasses.join("  ·  "),
    [scale]
  );

  const scaleLabel = useMemo(() => {
    const opt = SCALE_OPTIONS.find((o) => o.value === keyType);
    return opt?.label ?? keyType;
  }, [keyType]);

  const mappedScale = useMemo(() => {
    const allNotes: number[] = [];
    for (let o = 0; o < octaveCount; o++) {
      const mapped = mapScaleToMidi(scale, START_OCTAVE + o);
      allNotes.push(...mapped.midiNotes);
    }
    return allNotes;
  }, [scale, octaveCount]);

  const triad = useMemo(
    () => buildTriadFromScale(scale, chordDegree),
    [scale, chordDegree]
  );

  const mappedTriad = useMemo(
    () => mapTriadToMidi(triad, START_OCTAVE),
    [triad]
  );

  const diatonicChords = useMemo(
    () => getDiatonicChords(keyRoot, keyType),
    [keyRoot, keyType]
  );

  const scaleLayer: HighlightLayer = useMemo(
    () => ({
      id: "scale",
      label: `${keyRoot} ${scaleLabel} Scale`,
      midiNotes: mappedScale,
    }),
    [mappedScale, keyRoot, scaleLabel]
  );

  const chordLayer: HighlightLayer = useMemo(
    () => ({
      id: "chord",
      label: `${diatonicChords.triads[chordDegree].degree}: ${triad.root} ${triad.quality === "maj" ? "Major" : triad.quality === "min" ? "Minor" : triad.quality === "dim" ? "Diminished" : "Augmented"}`,
      midiNotes: mappedTriad.midiNotes,
    }),
    [mappedTriad.midiNotes, chordDegree, triad, diatonicChords]
  );

  const highlightLayers: HighlightLayer[] = useMemo(
    () => (viewMode === "scale" ? [scaleLayer] : [chordLayer]),
    [viewMode, scaleLayer, chordLayer]
  );

  const lowestMidiNote = pitchClassToMidi("C", START_OCTAVE);
  const highestMidiNote = pitchClassToMidi(
    "B",
    START_OCTAVE + octaveCount - 1
  );

  const handleKeyPress = (midiNote: number) => {
    setLastPlayedNote(midiToNoteName(midiNote));
  };

  return (
    <div className="piano-roll-panel max-w-3xl w-full">
      <div className="piano-roll-header">Piano Roll</div>

      <div className="piano-roll-controls">
        <div className="piano-roll-control-group">
          <span className="piano-roll-control-label">Root</span>
          <select
            className="piano-roll-select"
            value={keyRoot}
            onChange={(e) => setKeyRoot(e.target.value as PitchClass)}
          >
            {PITCH_CLASSES.map((pc) => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            ))}
          </select>
        </div>
        <div className="piano-roll-control-group">
          <span className="piano-roll-control-label">Scale</span>
          <select
            className="piano-roll-select"
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as ScaleType)}
          >
            {SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="piano-roll-control-group">
          <span className="piano-roll-control-label">Octaves</span>
          <select
            className="piano-roll-select"
            value={octaveCount}
            onChange={(e) =>
              setOctaveCount(parseInt(e.target.value, 10) as 1 | 2 | 3)
            }
          >
            {OCTAVE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="piano-roll-legend">
        <div className="piano-roll-legend-item">
          <div className="piano-roll-legend-swatch in-scale-white" />
          <span>In scale (white)</span>
        </div>
        <div className="piano-roll-legend-item">
          <div className="piano-roll-legend-swatch in-scale-black" />
          <span>In scale (black)</span>
        </div>
        <div className="piano-roll-legend-item">
          <div className="piano-roll-legend-swatch out-scale" />
          <span>Out of scale</span>
        </div>
      </div>

      <PianoRoll
        lowestMidiNote={lowestMidiNote}
        highestMidiNote={highestMidiNote}
        highlightLayers={highlightLayers}
        onKeyPress={handleKeyPress}
      />

      <div className="piano-roll-info-bar">
        <div className="piano-roll-note-display">
          {lastPlayedNote ? <span>{lastPlayedNote}</span> : "—"}
        </div>
        <div className="piano-roll-scale-notes">
          <em>{keyRoot} {scaleLabel}:</em> {scaleNotesForDisplay}
        </div>
      </div>

      {/* View mode toggle */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] text-[var(--pr-text-dim)]">
          <span className="font-medium text-[var(--pr-text-bright)]">
            View mode:
          </span>{" "}
          {viewMode === "scale" ? "Scale notes" : "Chord notes"}
        </span>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--pr-border)] bg-[#111115] p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("scale")}
            className={clsx(
              "rounded-full px-3 py-1 transition-colors duration-150",
              viewMode === "scale"
                ? "bg-[var(--pr-accent)] text-white"
                : "text-[var(--pr-text-dim)] hover:bg-[var(--pr-border)]"
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
                ? "bg-[var(--pr-accent)] text-white"
                : "text-[var(--pr-text-dim)] hover:bg-[var(--pr-border)]"
            )}
          >
            Chord
          </button>
        </div>
      </div>

      {viewMode === "chord" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--pr-text-dim)]">
            Chord:
          </span>
          {diatonicChords.triads.map((dt, idx) => (
            <button
              key={idx}
              onClick={() => setChordDegree(idx)}
              className={clsx(
                "px-2 py-1 text-xs rounded transition-colors",
                chordDegree === idx
                  ? "bg-[var(--pr-accent)] text-white"
                  : "bg-[#111115] border border-[var(--pr-border)] text-[var(--pr-text-bright)] hover:border-[var(--pr-accent)]"
              )}
              title={`${dt.triad.root} ${dt.triad.quality}`}
            >
              {dt.degree}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
