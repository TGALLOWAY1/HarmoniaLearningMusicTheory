"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Download, Sparkles, Music } from "lucide-react";
import { useProgressionStore, COMPLEXITY_LABELS, type ComplexityLevel } from "@/lib/state/progressionStore";
import { VerticalPianoRoll } from "@/components/progression/VerticalPianoRoll";
import type { Mode } from "@/lib/theory/harmonyEngine";

/* ─── Sound Presets ─── */

type SoundPresetId = "clean" | "mellow" | "bell" | "bright";

const SOUND_PRESETS: Array<{ id: SoundPresetId; label: string }> = [
  { id: "clean", label: "Clean" },
  { id: "mellow", label: "Mellow" },
  { id: "bell", label: "Bell" },
  { id: "bright", label: "Bright" },
];

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MODES: { value: Mode; label: string }[] = [
  { value: "ionian", label: "Major" },
  { value: "aeolian", label: "Minor" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixolydian" },
  { value: "phrygian", label: "Phrygian" },
];
const CHORD_COUNTS = [3, 4, 5, 6, 7, 8];

/* ─── Effects Chain (shared) ─── */

let masterReverb: Tone.Reverb | null = null;
let masterCompressor: Tone.Compressor | null = null;

function getEffectsChain(): { reverb: Tone.Reverb; compressor: Tone.Compressor } {
  if (!masterReverb) {
    masterReverb = new Tone.Reverb({ decay: 1.8, wet: 0.2 }).toDestination();
  }
  if (!masterCompressor) {
    masterCompressor = new Tone.Compressor({
      threshold: -18,
      ratio: 3,
      attack: 0.01,
      release: 0.15,
    }).connect(masterReverb);
  }
  return { reverb: masterReverb, compressor: masterCompressor };
}

function createSynthForPreset(preset: SoundPresetId): Tone.PolySynth {
  const { compressor } = getEffectsChain();

  switch (preset) {
    case "mellow":
      return new Tone.PolySynth(Tone.Synth, {
        volume: -10,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.06, decay: 0.2, sustain: 0.6, release: 0.8 },
      }).connect(compressor);
    case "bell":
      return new Tone.PolySynth(Tone.Synth, {
        volume: -9,
        oscillator: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.3, sustain: 0.1, release: 0.6 },
      }).connect(compressor);
    case "bright":
      return new Tone.PolySynth(Tone.Synth, {
        volume: -14,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.4 },
      }).connect(compressor);
    case "clean":
    default:
      return new Tone.PolySynth(Tone.Synth, {
        volume: -9,
        oscillator: { type: "sine" },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.55, release: 0.5 },
      }).connect(compressor);
  }
}

/* ─── Component ─── */

export default function HarmoniaPage() {
  const {
    currentProgression,
    isPlaying,
    bpm,
    rootKey,
    mode,
    complexity,
    numChords,
    setSettings,
    generateNew,
    setIsPlaying,
    exportMidi,
  } = useProgressionStore();

  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [soundPreset, setSoundPreset] = useState<SoundPresetId>("clean");
  const [generationKey, setGenerationKey] = useState(0);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const playbackIndexRef = useRef(0);
  const scheduleIdRef = useRef<number | null>(null);

  /* ─── Synth lifecycle ─── */

  useEffect(() => {
    const synth = createSynthForPreset(soundPreset);
    synthRef.current = synth;

    return () => {
      synth.releaseAll();
      synth.dispose();
      synthRef.current = null;
    };
  }, [soundPreset]);

  /* ─── Transport BPM ─── */

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  /* ─── Playback loop ─── */

  useEffect(() => {
    if (!isPlaying || !currentProgression) {
      if (scheduleIdRef.current !== null) {
        Tone.getTransport().clear(scheduleIdRef.current);
        scheduleIdRef.current = null;
      }
      Tone.getTransport().stop();
      playbackIndexRef.current = 0;
      setPlaybackIndex(null);
      if (synthRef.current) synthRef.current.releaseAll();
      return;
    }

    const id = Tone.getTransport().scheduleRepeat((time) => {
      const idx = playbackIndexRef.current;
      const chord = currentProgression.chords[idx];
      if (!chord || !synthRef.current) return;

      const notes =
        chord.notesWithOctave && chord.notesWithOctave.length > 0
          ? chord.notesWithOctave
          : chord.notes.map((n) => `${n}3`);
      synthRef.current.triggerAttackRelease(notes, "1n", time);

      Tone.getDraw().schedule(() => {
        setPlaybackIndex(idx);
      }, time);

      playbackIndexRef.current = (idx + 1) % currentProgression.chords.length;
    }, "1n", 0);

    scheduleIdRef.current = id;
    Tone.getTransport().start();

    return () => {
      if (scheduleIdRef.current !== null) {
        Tone.getTransport().clear(scheduleIdRef.current);
      }
      Tone.getDraw().cancel(0);
    };
  }, [isPlaying, currentProgression]);

  /* ─── Handlers ─── */

  const handleGenerate = useCallback(async () => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    if (isPlaying) {
      setIsPlaying(false);
    }
    generateNew();
    setGenerationKey((k) => k + 1);
  }, [generateNew, isPlaying, setIsPlaying]);

  const handleTogglePlayback = useCallback(async () => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handlePlayNote = useCallback(
    (noteWithOctave: string) => {
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(noteWithOctave, "4n");
      }
    },
    []
  );

  const handleChordClick = useCallback(
    (notesWithOctave: string[]) => {
      if (synthRef.current) {
        synthRef.current.releaseAll();
        synthRef.current.triggerAttackRelease(notesWithOctave, "2n");
      }
    },
    []
  );

  /* ─── Render ─── */

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-semibold tracking-tight">Harmonia</h1>
          </div>
          <p className="text-sm text-muted hidden sm:block">
            Chord Progression Generator
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* ── Controls Bar ── */}
        <section className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-5">
            {/* Key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Key
              </label>
              <select
                value={rootKey}
                onChange={(e) => setSettings({ rootKey: e.target.value })}
                className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/30 w-20 appearance-none cursor-pointer"
              >
                {NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setSettings({ mode: e.target.value as Mode })}
                className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/30 w-32 appearance-none cursor-pointer"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chord Count */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Chords
              </label>
              <select
                value={numChords}
                onChange={(e) => setSettings({ numChords: Number(e.target.value) as 3 | 4 | 5 | 6 | 7 | 8 })}
                className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/30 w-20 appearance-none cursor-pointer"
              >
                {CHORD_COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Complexity
              </label>
              <div className="flex rounded-lg border border-border-subtle overflow-hidden">
                {([1, 2, 3, 4] as ComplexityLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSettings({ complexity: level })}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      complexity === level
                        ? "bg-accent text-white"
                        : "bg-surface-muted hover:bg-surface text-muted"
                    }`}
                  >
                    {COMPLEXITY_LABELS[level]}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-accent text-white font-medium transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </section>

        {/* ── Chord Cards ── */}
        <section>
          <AnimatePresence mode="wait">
            {currentProgression && currentProgression.chords.length > 0 ? (
              <motion.div
                key={generationKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {currentProgression.chords.map((chord, index) => {
                  const isActive = playbackIndex === index;
                  const previewNotes =
                    chord.notesWithOctave && chord.notesWithOctave.length > 0
                      ? chord.notesWithOctave
                      : chord.notes.map((n) => `${n}3`);

                  return (
                    <motion.div
                      key={`${chord.romanNumeral}-${index}`}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: index * 0.06,
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => handleChordClick(previewNotes)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl px-8 py-8 min-w-[130px] border transition-all duration-200 cursor-pointer select-none ${
                        isActive
                          ? "bg-accent/10 border-accent shadow-md ring-2 ring-accent/20"
                          : "bg-surface border-border-subtle hover:border-accent/40 hover:shadow-sm"
                      }`}
                    >
                      {/* Playback glow pulse */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-accent/5"
                          animate={{ opacity: [0.3, 0.08, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}

                      <div className="text-xs font-mono text-muted mb-1 uppercase tracking-wider">
                        {chord.romanNumeral}
                      </div>
                      <div className="text-2xl font-semibold mb-2">{chord.symbol}</div>
                      <div className="text-xs text-muted opacity-70">
                        {chord.notes.join(" · ")}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-surface-muted border border-border-subtle flex items-center justify-center mb-4">
                  <Music className="w-7 h-7 text-muted" />
                </div>
                <p className="text-muted text-sm max-w-xs">
                  Choose a key and mode, then click{" "}
                  <span className="font-medium text-foreground">Generate</span> to
                  create your first progression.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Piano Roll ── */}
        {currentProgression && currentProgression.chords.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <VerticalPianoRoll
              chords={currentProgression.chords}
              playingIndex={playbackIndex}
              onPlayNote={handlePlayNote}
            />
          </motion.section>
        )}

        {/* ── Playback Bar ── */}
        <section className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-5 justify-between">
            {/* Play / Stop */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlayback}
                disabled={!currentProgression}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all disabled:opacity-40 ${
                  isPlaying
                    ? "bg-surface-muted border border-border-subtle text-foreground"
                    : "bg-accent text-white shadow-sm"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Play
                  </>
                )}
              </button>
            </div>

            {/* Sound Preset */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Sound
              </span>
              <select
                value={soundPreset}
                onChange={(e) => setSoundPreset(e.target.value as SoundPresetId)}
                className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/30 appearance-none cursor-pointer"
              >
                {SOUND_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* BPM */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                BPM
              </span>
              <input
                type="range"
                min={60}
                max={180}
                value={bpm}
                onChange={(e) => setSettings({ bpm: Number(e.target.value) })}
                className="w-24 h-1.5 bg-surface-muted rounded-full appearance-none cursor-pointer accent-accent"
              />
              <span className="text-sm font-mono font-medium w-8 text-center">
                {bpm}
              </span>
            </div>

            {/* MIDI Export */}
            <button
              onClick={exportMidi}
              disabled={!currentProgression}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border-subtle bg-surface hover:bg-surface-muted text-sm font-medium transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              Export MIDI
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-muted">
        Built with harmonic intention
      </footer>
    </div>
  );
}
