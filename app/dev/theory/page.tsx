"use client";

import { useState } from "react";

type PitchClass =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

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

const SCALE_TYPES = [
  "major",
  "natural_minor",
  "dorian",
  "mixolydian",
  "phrygian",
] as const;

const CHORD_QUALITIES = [
  "maj",
  "min",
  "maj7",
  "min7",
  "dom7",
  "dim",
  "aug",
] as const;

const KEY_TYPES = ["major", "natural_minor"] as const;
const EXTENSIONS = ["triads", "sevenths"] as const;

export default function DevTheoryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight mb-2">
            Dev / Theory API playground
          </h1>
          <p className="text-sm text-muted">
            Test the theory API endpoints directly from the browser.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <ScaleTester />
          <ChordTester />
          <DiatonicChordsTester />
        </div>
      </div>
    </main>
  );
}

function ScaleTester() {
  const [root, setRoot] = useState<PitchClass>("C");
  const [type, setType] = useState<string>("major");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`/api/theory/scale?root=${root}&type=${type}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
      } else {
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-medium">Scale Tester</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Root</label>
          <select
            value={root}
            onChange={(e) => setRoot(e.target.value as PitchClass)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {PITCH_CLASSES.map((pc) => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {SCALE_TYPES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-1.5 text-sm font-medium bg-foreground text-surface rounded hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Fetch scale"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {response && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Response:</h3>
          <pre className="p-3 text-xs bg-surface-muted rounded overflow-auto border border-subtle">
            {JSON.stringify(response, null, 2)}
          </pre>
          {response.notes && (
            <div className="text-sm">
              <p>
                <span className="text-muted">Notes:</span>{" "}
                <span className="font-mono">{response.notes.join(" ")}</span>
              </p>
              <p>
                <span className="text-muted">MIDI Notes:</span>{" "}
                <span className="font-mono">{response.midiNotes.join(", ")}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChordTester() {
  const [root, setRoot] = useState<PitchClass>("C");
  const [quality, setQuality] = useState<string>("maj");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(
        `/api/theory/chord?root=${root}&quality=${quality}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
      } else {
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-medium">Chord Tester</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Root</label>
          <select
            value={root}
            onChange={(e) => setRoot(e.target.value as PitchClass)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {PITCH_CLASSES.map((pc) => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {CHORD_QUALITIES.map((cq) => (
              <option key={cq} value={cq}>
                {cq}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-1.5 text-sm font-medium bg-foreground text-surface rounded hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Fetch chord"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {response && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Response:</h3>
          <pre className="p-3 text-xs bg-surface-muted rounded overflow-auto border border-subtle">
            {JSON.stringify(response, null, 2)}
          </pre>
          {response.notes && (
            <div className="text-sm">
              <p>
                <span className="text-muted">Symbol:</span>{" "}
                <span className="font-semibold">{response.symbol}</span>
              </p>
              <p>
                <span className="text-muted">Notes:</span>{" "}
                <span className="font-mono">{response.notes.join(" ")}</span>
              </p>
              <p>
                <span className="text-muted">MIDI Notes:</span>{" "}
                <span className="font-mono">{response.midiNotes.join(", ")}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiatonicChordsTester() {
  const [root, setRoot] = useState<PitchClass>("C");
  const [type, setType] = useState<string>("major");
  const [extensions, setExtensions] = useState<string>("triads");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(
        `/api/theory/key-diatonic-chords?root=${root}&type=${type}&extensions=${extensions}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
      } else {
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-medium">Diatonic Chords Tester</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Root</label>
          <select
            value={root}
            onChange={(e) => setRoot(e.target.value as PitchClass)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {PITCH_CLASSES.map((pc) => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {KEY_TYPES.map((kt) => (
              <option key={kt} value={kt}>
                {kt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Extensions</label>
          <select
            value={extensions}
            onChange={(e) => setExtensions(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-subtle rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {EXTENSIONS.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-1.5 text-sm font-medium bg-foreground text-surface rounded hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Fetch key chords"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {response && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium mb-2">Response:</h3>
            <div className="text-sm text-muted mb-2">
              Key: <span className="font-semibold text-foreground">{response.key?.root} {response.key?.type}</span>
            </div>
          </div>
          {response.chords && response.chords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted uppercase tracking-wide">
                Chords ({response.chords.length}):
              </h4>
              <div className="space-y-1.5">
                {response.chords.map((chord: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 bg-surface-muted rounded border border-subtle text-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{chord.degree}</span>
                      <span className="text-muted">·</span>
                      <span className="font-medium">{chord.symbol}</span>
                      <span className="text-muted">·</span>
                      <span className="text-muted">{chord.quality}</span>
                    </div>
                    <div className="font-mono text-muted">
                      {chord.notes.join(" ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <details className="mt-2">
            <summary className="text-xs text-muted cursor-pointer hover:text-foreground">
              Show full JSON
            </summary>
            <pre className="mt-2 p-3 text-xs bg-surface-muted rounded overflow-auto border border-subtle">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

