"use client";

import { useMemo, useState } from "react";
import {
  getNeighborsForKey,
  getRelativeMinor,
  getMajorScale,
  getDiatonicChords,
  mapScaleToMidi,
  pitchClassToMidi,
  type PitchClass,
  type TriadQuality,
} from "@/lib/theory";
import { CircleOfFifths } from "@/components/circle/CircleOfFifths";
import { PianoRoll } from "@/components/piano-roll/PianoRoll";

/**
 * Format a triad as a chord symbol string
 * @param root - Root pitch class
 * @param quality - Triad quality
 * @returns Formatted chord symbol (e.g., "C", "Cm", "C°", "C+")
 */
function formatChordSymbol(root: PitchClass, quality: TriadQuality): string {
  switch (quality) {
    case "maj":
      return root; // Major: just the root (e.g., "C")
    case "min":
      return `${root}m`; // Minor: root + "m" (e.g., "Cm")
    case "dim":
      return `${root}°`; // Diminished: root + "°" (e.g., "C°")
    case "aug":
      return `${root}+`; // Augmented: root + "+" (e.g., "C+")
    default:
      return root;
  }
}

export default function CirclePage() {
  const [selectedRoot, setSelectedRoot] = useState<PitchClass>("C");

  // Derived data
  const neighbors = useMemo(
    () => getNeighborsForKey(selectedRoot),
    [selectedRoot]
  );

  const relativeMinor = useMemo(
    () => getRelativeMinor(selectedRoot),
    [selectedRoot]
  );

  const majorScale = useMemo(
    () => getMajorScale(selectedRoot),
    [selectedRoot]
  );

  const diatonicChords = useMemo(
    () => getDiatonicChords(selectedRoot, "major"),
    [selectedRoot]
  );

  // Map scale to one octave (e.g. octave 3)
  const DEMO_OCTAVE = 3;
  const mappedScale = useMemo(
    () => mapScaleToMidi(majorScale, DEMO_OCTAVE),
    [majorScale]
  );

  const lowestMidiNote = pitchClassToMidi("C", DEMO_OCTAVE);
  const highestMidiNote = pitchClassToMidi("B", DEMO_OCTAVE);

  const highlightLayers = [
    {
      id: "scale",
      label: `${selectedRoot} major scale`,
      midiNotes: mappedScale.midiNotes,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <section className="flex-1">
          <header className="mb-4">
            <p className="text-xs text-muted">Circle of fifths</p>
            <h1 className="text-2xl font-light tracking-tight">
              Key relationships
            </h1>
            <p className="mt-1 text-xs text-muted">
              Click a key to see its neighbors (IV and V), relative minor, and
              scale preview on the piano roll.
            </p>
          </header>

          <CircleOfFifths
            selectedRoot={selectedRoot}
            onSelectRoot={setSelectedRoot}
            showRelativeMinors
          />

          <div className="mt-4 space-y-3 rounded-2xl border border-subtle bg-surface p-4 text-sm">
            <div>
              <p className="text-xs text-muted">Selected key</p>
              <p className="mt-1 text-lg font-medium">{selectedRoot} major</p>
            </div>
            <p className="text-xs text-muted">
              Relative minor:{" "}
              <span className="font-medium text-foreground">
                {relativeMinor} minor
              </span>
            </p>
            <p className="text-xs text-muted">
              Neighbors (IV / V on the circle):{" "}
              <span className="font-medium text-foreground">
                {neighbors.left} · {neighbors.right}
              </span>
            </p>
            {/* TODO: Add key signature text (sharps/flats count) - A5.3 */}
          </div>

          <div className="mt-4 rounded-2xl border border-subtle bg-surface p-4 text-sm">
            <h2 className="text-sm font-medium text-foreground">
              Diatonic triads in {selectedRoot} major
            </h2>
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {diatonicChords.triads.map((diatonicTriad) => {
                const chordSymbol = formatChordSymbol(
                  diatonicTriad.triad.root,
                  diatonicTriad.triad.quality
                );
                return (
                  <li
                    key={diatonicTriad.degree}
                    className="flex items-center justify-between"
                  >
                    <span className="font-mono text-[11px] text-foreground">
                      {diatonicTriad.degree}
                    </span>
                    <span>{chordSymbol}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="flex-1 rounded-2xl border border-subtle bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-medium text-foreground">
            Piano roll preview
          </h2>
          <p className="mt-1 text-xs text-muted">
            Notes in the {selectedRoot} major scale within one octave.
          </p>
          <div className="mt-4">
            <PianoRoll
              lowestMidiNote={lowestMidiNote}
              highestMidiNote={highestMidiNote}
              highlightLayers={highlightLayers}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

