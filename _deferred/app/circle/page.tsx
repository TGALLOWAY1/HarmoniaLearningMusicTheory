"use client";

import { useMemo, useState, useEffect } from "react";
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

type KeySummaryDto = {
  id: string;
  mastery: number;
  avgRecallMs: number | null;
  lastReviewedAt: string | null;
  dueCount: number;
};

type CircleSummaryResponse = {
  keys: KeySummaryDto[];
};

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
  const [circleSummary, setCircleSummary] = useState<KeySummaryDto[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Fetch circle summary on mount
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const response = await fetch("/api/circle/summary");
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Circle Page] API error response:", errorText);
          throw new Error(`Failed to fetch circle summary: ${response.status}`);
        }
        const data: CircleSummaryResponse = await response.json();
        
        // Validate response structure
        if (!data || !Array.isArray(data.keys)) {
          console.error("[Circle Page] Invalid API response structure:", data);
          throw new Error("Invalid response structure");
        }
        
        // Validate each summary has required properties
        const validKeys = data.keys.filter(key => {
          const isValid = 
            key &&
            typeof key.id === 'string' &&
            typeof key.mastery === 'number' &&
            !isNaN(key.mastery) &&
            typeof key.dueCount === 'number';
          
          if (!isValid) {
            console.warn("[Circle Page] Invalid key summary:", key);
          }
          return isValid;
        });
        
        // Fix invalid summaries
        const fixedKeys = data.keys.map(key => ({
          id: key.id || 'unknown',
          mastery: typeof key.mastery === 'number' && !isNaN(key.mastery) ? key.mastery : 0,
          avgRecallMs: key.avgRecallMs ?? null,
          lastReviewedAt: key.lastReviewedAt ?? null,
          dueCount: typeof key.dueCount === 'number' ? key.dueCount : 0,
        }));
        
        console.log(`[Circle Page] Loaded ${fixedKeys.length} key summaries`);
        setCircleSummary(fixedKeys);
      } catch (error) {
        console.error("[Circle Page] Error fetching circle summary:", error);
        setSummaryError("Couldn't load mastery data");
        // Set empty array as fallback
        setCircleSummary([]);
      } finally {
        setSummaryLoading(false);
      }
    }
    fetchSummary();
  }, []);

  // Create masteryByRoot map for CircleOfFifths
  const masteryByRoot = useMemo(() => {
    const map: Record<PitchClass, number> = {} as Record<PitchClass, number>;
    for (const summary of circleSummary) {
      if (!summary || !summary.id) continue;
      // Extract root from id format: "<root>_major"
      const root = summary.id.split("_")[0] as PitchClass;
      const mastery = typeof summary.mastery === 'number' && !isNaN(summary.mastery) 
        ? summary.mastery 
        : 0;
      map[root] = mastery;
    }
    return map;
  }, [circleSummary]);

  // Create statsByRoot map for tooltip (mastery + dueCount)
  const statsByRoot = useMemo(() => {
    const map: Record<PitchClass, { mastery: number; dueCount: number }> =
      {} as Record<PitchClass, { mastery: number; dueCount: number }>;
    for (const summary of circleSummary) {
      if (!summary || !summary.id) continue;
      // Extract root from id format: "<root>_major"
      const root = summary.id.split("_")[0] as PitchClass;
      const mastery = typeof summary.mastery === 'number' && !isNaN(summary.mastery) 
        ? summary.mastery 
        : 0;
      const dueCount = typeof summary.dueCount === 'number' ? summary.dueCount : 0;
      map[root] = {
        mastery,
        dueCount,
      };
    }
    return map;
  }, [circleSummary]);

  // Find summary for selected key
  const selectedKeySummary = useMemo(() => {
    const keyId = `${selectedRoot}_major`;
    return circleSummary.find((s) => s.id === keyId) ?? null;
  }, [circleSummary, selectedRoot]);

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

  const scaleNotesDisplay = useMemo(() => {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const names = mappedScale.midiNotes.map((midi) => noteNames[midi % 12]);
    return `${selectedRoot} Major: ${names.join("  ·  ")}`;
  }, [mappedScale.midiNotes, selectedRoot]);

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
            masteryByRoot={masteryByRoot}
            statsByRoot={statsByRoot}
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

          {/* Mastery stats card */}
          <div className="mt-4 rounded-2xl border border-subtle bg-surface p-4 text-sm">
            <h2 className="text-sm font-medium text-foreground">Mastery</h2>
            {summaryLoading ? (
              <p className="mt-2 text-xs text-muted">Loading mastery data...</p>
            ) : summaryError ? (
              <p className="mt-2 text-xs text-muted">{summaryError}</p>
            ) : selectedKeySummary ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Mastery:</span>
                  <span className="font-medium text-foreground">
                    {(selectedKeySummary.mastery * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Avg recall:</span>
                  <span className="font-medium text-foreground">
                    {selectedKeySummary.avgRecallMs !== null
                      ? `${selectedKeySummary.avgRecallMs} ms`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Last reviewed:</span>
                  <span className="font-medium text-foreground">
                    {selectedKeySummary.lastReviewedAt
                      ? new Date(
                          selectedKeySummary.lastReviewedAt
                        ).toLocaleDateString()
                      : "Not reviewed yet"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Due cards:</span>
                  <span className="font-medium text-foreground">
                    {selectedKeySummary.dueCount}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted">
                No mastery data available for this key
              </p>
            )}
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

        <section className="flex-1">
          <div className="piano-panel max-w-[760px] w-full">
            <div className="flex items-baseline justify-between mb-6">
              <span className="piano-panel-title">Piano Roll</span>
            </div>
            <p className="text-[11px] text-[var(--piano-text-dim)] mb-5">
              Notes in the {selectedRoot} major scale within one octave.
            </p>
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
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--piano-border)] text-[11px] text-[var(--piano-text-dim)]">
              <div className="text-[13px] text-[var(--piano-text-bright)] tracking-wide">
                <span className="text-[var(--piano-accent)]">
                  {selectedRoot} Major
                </span>
              </div>
              <div className="text-[10px] tracking-wide">
                <em className="text-[#7868dd] not-italic">
                  {scaleNotesDisplay}
                </em>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

