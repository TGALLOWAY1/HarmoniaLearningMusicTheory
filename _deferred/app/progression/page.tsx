"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import ScaleSelector from "@/components/progression/ScaleSelector";
import ChordInspector from "@/components/progression/ChordInspector";
import ProgressionDisplay from "@/components/progression/ProgressionDisplay";
import { VerticalPianoRoll } from "@/components/progression/VerticalPianoRoll";
import TriadPalette from "@/components/progression/TriadPalette";
import ActionButtons from "@/components/progression/ActionButtons";
import { useProgressionStore } from "@/lib/state/progressionStore";
import { ChevronLeft, Download } from "lucide-react";
import Link from "next/link";

type SoundPresetId = "clean" | "mellow" | "bell" | "bright";

const SOUND_PRESETS: Array<{ id: SoundPresetId; label: string }> = [
  { id: "clean", label: "Clean (Sine)" },
  { id: "mellow", label: "Mellow (Triangle)" },
  { id: "bell", label: "Bell (Short)" },
  { id: "bright", label: "Bright (Square)" },
];

function createSynthForPreset(preset: SoundPresetId): Tone.PolySynth {
  switch (preset) {
    case "mellow":
      return new Tone.PolySynth(Tone.Synth, {
        volume: -12,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.03, decay: 0.14, sustain: 0.58, release: 0.45 },
      }).toDestination();
    case "bell":
      return new Tone.PolySynth(Tone.Synth, {
        volume: -11,
        oscillator: { type: "sine" },
        envelope: { attack: 0.005, decay: 0.18, sustain: 0.18, release: 0.22 },
      }).toDestination();
    case "bright":
      return new Tone.PolySynth(Tone.Synth, {
        volume: -16,
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.12, sustain: 0.35, release: 0.3 },
      }).toDestination();
    case "clean":
    default:
      return new Tone.PolySynth(Tone.Synth, {
        volume: -11,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.35 },
      }).toDestination();
  }
}

export default function ProgressionPage() {
  const {
    isPlaying,
    bpm,
    currentProgression,
    setSettings,
    setIsPlaying,
    exportMidi
  } = useProgressionStore();

  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(null);
  const [soundPreset, setSoundPreset] = useState<SoundPresetId>("clean");

  const handlePlayNote = (noteWithOctave: string) => {
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(noteWithOctave, "4n");
    }
  };

  const handlePlayChord = (notesWithOctave: string[], index: number) => {
    if (synthRef.current) {
      synthRef.current.releaseAll();

      if (isPlaying) {
        // If the sequencer is running, jump to this chord and restart the transport immediately
        Tone.Transport.stop();
        playbackIndexRef.current = index;
        Tone.Transport.start();
      } else {
        // Standard preview
        synthRef.current.triggerAttackRelease(notesWithOctave, "2n");
      }
    }
  };

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const playbackIndexRef = useRef(0);
  const scheduleIdRef = useRef<number | null>(null);

  // Audio initialization
  useEffect(() => {
    const synth = createSynthForPreset(soundPreset);

    synthRef.current = synth;

    return () => {
      synth.releaseAll();
      synth.dispose();
      synthRef.current = null;
    };
  }, [soundPreset]);

  // Transport sync
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Playback logic
  useEffect(() => {
    if (!isPlaying || !currentProgression) {
      if (scheduleIdRef.current !== null) {
        Tone.Transport.clear(scheduleIdRef.current);
        scheduleIdRef.current = null;
      }
      Tone.Transport.stop();
      playbackIndexRef.current = 0;
      setPlaybackIndex(null);
      if (synthRef.current) synthRef.current.releaseAll();
      return;
    }

    const id = Tone.Transport.scheduleRepeat((time) => {
      const idx = playbackIndexRef.current;
      const chord = currentProgression.chords[idx];
      if (!chord || !synthRef.current) return;

      const notes =
        chord.notesWithOctave && chord.notesWithOctave.length > 0
          ? chord.notesWithOctave
          : chord.notes.map(n => `${n}3`);
      synthRef.current.triggerAttackRelease(notes, "1n", time);

      // Schedule the UI update safely on the main thread precisely when the audio hits
      Tone.Draw.schedule(() => {
        setPlaybackIndex(idx);
      }, time);

      playbackIndexRef.current = (idx + 1) % currentProgression.chords.length;
    }, "1n", 0);

    scheduleIdRef.current = id;
    Tone.Transport.start();

    return () => {
      if (scheduleIdRef.current !== null) {
        Tone.Transport.clear(scheduleIdRef.current);
      }
      Tone.Draw.cancel(0);
    };
  }, [isPlaying, currentProgression]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-medium">Chord Generator</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={exportMidi}
              disabled={!currentProgression}
              className="p-2 rounded-full hover:bg-surface-muted transition text-muted hover:text-foreground disabled:opacity-40"
              title="Export MIDI"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <section className="mb-12 text-center flex flex-col items-center gap-8">
          <div>
            <h2 className="text-3xl font-light mb-2">Generate Progressions</h2>
            <p className="text-muted">AI-driven harmonic exploration</p>
          </div>

          <ScaleSelector />
        </section>

        <section className="mb-12">
          <TriadPalette />
        </section>

        <section className="mb-16">
          <div className="bg-surface rounded-3xl p-8 border border-border-subtle shadow-sm hover:shadow-md transition-shadow min-h-32 flex items-center justify-center">
            <ChordInspector selectedIndex={selectedChordIndex} />
          </div>
        </section>

        <section className="flex flex-col items-center gap-12 w-full">
          <ProgressionDisplay
            activeIndex={playbackIndex}
            selectedIndex={selectedChordIndex}
            onSelectChord={setSelectedChordIndex}
            onPlayChord={handlePlayChord}
          />

          {currentProgression && (
            <div className="w-full">
              <VerticalPianoRoll
                chords={currentProgression.chords}
                playingIndex={playbackIndex}
                onPlayNote={handlePlayNote}
              />
            </div>
          )}

          <div className="flex items-center gap-6 w-full justify-center">
            <ActionButtons />
            <div className="flex items-center gap-3 bg-surface border border-border-subtle rounded-full px-6 py-3 shadow-sm">
              <span className="text-xs font-medium text-muted uppercase">Sound</span>
              <select
                value={soundPreset}
                onChange={(e) => setSoundPreset(e.target.value as SoundPresetId)}
                className="bg-transparent text-sm font-medium outline-none focus:ring-2 focus:ring-border-subtle rounded-md px-1"
              >
                {SOUND_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 bg-surface border border-border-subtle rounded-full px-6 py-3 shadow-sm">
              <span className="text-xs font-medium text-muted uppercase">BPM</span>
              <input
                type="range"
                min={60}
                max={180}
                value={bpm}
                onChange={(e) => setSettings({ bpm: Number(e.target.value) })}
                className="w-24 h-1.5 bg-surface-muted rounded-full appearance-none cursor-pointer accent-accent"
              />
              <span className="text-sm font-medium w-8 text-center">{bpm}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
