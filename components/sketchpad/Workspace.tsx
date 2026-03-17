"use client";

import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import * as Tone from "tone";
import type { HarmonicSketchProject, HarmonicSection, HarmonicEvent, PlaybackMode } from "@/lib/sketchpad/types";
import { useSketchpadStore } from "@/lib/sketchpad/store";
import { SongStructurePanel } from "./SongStructurePanel";
import { SectionEditorPanel } from "./SectionEditorPanel";
import { HarmonicPreviewPanel } from "./HarmonicPreviewPanel";

type SoundPresetId = "piano" | "mellow" | "bell" | "bright";
type Synth = Tone.PolySynth | Tone.Sampler;

let masterReverb: Tone.Reverb | null = null;
let masterCompressor: Tone.Compressor | null = null;
let masterLimiter: Tone.Limiter | null = null;

function getEffectsChain() {
  if (!masterLimiter) {
    masterLimiter = new Tone.Limiter(-3).toDestination();
  }
  if (!masterReverb) {
    masterReverb = new Tone.Reverb({ decay: 1.8, wet: 0.2 }).connect(masterLimiter);
  }
  if (!masterCompressor) {
    masterCompressor = new Tone.Compressor({
      threshold: -18,
      ratio: 4,
      attack: 0.003,
      release: 0.15,
    }).connect(masterReverb);
  }
  return { reverb: masterReverb, compressor: masterCompressor, limiter: masterLimiter };
}

function createSynth(preset: SoundPresetId, onLoaded?: () => void): Synth {
  const { compressor } = getEffectsChain();
  switch (preset) {
    case "piano": {
      const sampler = new Tone.Sampler({
        urls: {
          A1: "A1.mp3", A2: "A2.mp3", A3: "A3.mp3", A4: "A4.mp3", A5: "A5.mp3",
          C2: "C2.mp3", C3: "C3.mp3", C4: "C4.mp3", C5: "C5.mp3", C6: "C6.mp3",
          "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "D#5": "Ds5.mp3",
          "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "F#5": "Fs5.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        release: 1,
        volume: -6,
        onload: () => onLoaded?.(),
      });
      sampler.connect(compressor);
      return sampler;
    }
    case "mellow":
      onLoaded?.();
      return new Tone.PolySynth(Tone.Synth, {
        volume: -14,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.06, decay: 0.2, sustain: 0.6, release: 0.8 },
      }).connect(compressor);
    case "bell":
      onLoaded?.();
      return new Tone.PolySynth(Tone.Synth, {
        volume: -12,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.6 },
      }).connect(compressor);
    case "bright":
      onLoaded?.();
      return new Tone.PolySynth(Tone.Synth, {
        volume: -16,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.4 },
      }).connect(compressor);
    default:
      onLoaded?.();
      return new Tone.PolySynth(Tone.Synth, {
        volume: -14,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.06, decay: 0.2, sustain: 0.6, release: 0.8 },
      }).connect(compressor);
  }
}

function beatsToDuration(beats: number): string {
  switch (beats) {
    case 4: return "1n";
    case 2: return "2n";
    case 1: return "4n";
    case 0.5: return "8n";
    default: return "1n";
  }
}

export function SketchpadWorkspace({ project }: { project: HarmonicSketchProject }) {
  const {
    activeSectionId,
    setActiveSection,
    setActiveProject,
    playbackMode,
    setPlaybackMode,
    playbackSectionIndex,
    playbackEventIndex,
    setPlaybackPosition,
  } = useSketchpadStore();

  const [soundPreset, setSoundPreset] = useState<SoundPresetId>("piano");
  const [isSynthLoading, setIsSynthLoading] = useState(false);
  const synthRef = useRef<Synth | null>(null);
  const scheduleIdsRef = useRef<number[]>([]);

  const activeSection = useMemo(
    () => project.sections.find((s) => s.id === activeSectionId) ?? null,
    [project.sections, activeSectionId]
  );

  const activeVariant = useMemo(() => {
    if (!activeSection) return null;
    return activeSection.variants.find((v) => v.id === activeSection.activeVariantId) ?? null;
  }, [activeSection]);

  // Synth lifecycle
  useEffect(() => {
    setIsSynthLoading(soundPreset === "piano");
    const synth = createSynth(soundPreset, () => setIsSynthLoading(false));
    synthRef.current = synth;
    return () => {
      synth.releaseAll();
      synth.dispose();
      synthRef.current = null;
    };
  }, [soundPreset]);

  // BPM sync
  useEffect(() => {
    Tone.getTransport().bpm.value = project.bpm;
  }, [project.bpm]);

  // Stop playback helper
  const stopPlayback = useCallback(() => {
    for (const id of scheduleIdsRef.current) {
      Tone.getTransport().clear(id);
    }
    scheduleIdsRef.current = [];
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().loop = false;
    Tone.getDraw().cancel(0);
    synthRef.current?.releaseAll();
    setPlaybackMode("stopped");
    setPlaybackPosition(0, 0);
  }, [setPlaybackMode, setPlaybackPosition]);

  // Schedule events for playback
  const scheduleEvents = useCallback(
    (events: HarmonicEvent[], loop: boolean, onComplete?: () => void) => {
      if (!synthRef.current || events.length === 0) return;

      const ids: number[] = [];
      let totalBeats = 0;
      for (const ev of events) totalBeats += ev.durationBeats;

      let beatOffset = 0;
      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        const beats = ev.durationBeats;
        const duration = beatsToDuration(beats);
        const evIdx = i;

        const bars = Math.floor(beatOffset / 4);
        const quarters = Math.floor(beatOffset % 4);
        const sixteenths = (beatOffset % 1) * 4;
        const timeStr = `${bars}:${quarters}:${sixteenths}`;

        const id = Tone.getTransport().schedule((time) => {
          if (!synthRef.current) return;
          const notes = ev.notesWithOctave.length > 0 ? ev.notesWithOctave : ev.notes.map((n) => `${n}3`);
          synthRef.current.triggerAttackRelease(notes, duration, time);
          Tone.getDraw().schedule(() => {
            setPlaybackPosition(playbackSectionIndex, evIdx);
          }, time);
        }, timeStr);
        ids.push(id);
        beatOffset += beats;
      }

      scheduleIdsRef.current = ids;

      const totalMeasures = totalBeats / 4;
      Tone.getTransport().loop = loop;
      Tone.getTransport().loopStart = 0;
      Tone.getTransport().loopEnd = `${totalMeasures}m`;
      Tone.getTransport().position = 0;
      Tone.getTransport().start();
    },
    [setPlaybackPosition, playbackSectionIndex]
  );

  // Play single chord
  const playChord = useCallback(
    async (event: HarmonicEvent) => {
      if (Tone.getContext().state !== "running") await Tone.start();
      stopPlayback();
      if (!synthRef.current) return;
      const notes = event.notesWithOctave.length > 0 ? event.notesWithOctave : event.notes.map((n) => `${n}3`);
      synthRef.current.triggerAttackRelease(notes, "2n");
    },
    [stopPlayback]
  );

  // Play section
  const playSection = useCallback(
    async (section: HarmonicSection, loop: boolean = false) => {
      if (Tone.getContext().state !== "running") await Tone.start();
      stopPlayback();
      const variant = section.variants.find((v) => v.id === section.activeVariantId);
      if (!variant || variant.events.length === 0) return;
      const sIdx = project.sections.findIndex((s) => s.id === section.id);
      setPlaybackPosition(sIdx, 0);
      setPlaybackMode(loop ? "section-loop" : "section");
      scheduleEvents(variant.events, loop);
    },
    [project.sections, stopPlayback, scheduleEvents, setPlaybackMode, setPlaybackPosition]
  );

  // Play full song
  const playFullSong = useCallback(
    async (startFromSectionIndex: number = 0) => {
      if (Tone.getContext().state !== "running") await Tone.start();
      stopPlayback();

      const allEvents: { event: HarmonicEvent; sectionIndex: number; eventIndex: number }[] = [];
      for (let si = startFromSectionIndex; si < project.sections.length; si++) {
        const section = project.sections[si];
        const variant = section.variants.find((v) => v.id === section.activeVariantId);
        if (!variant) continue;
        for (let ei = 0; ei < variant.events.length; ei++) {
          allEvents.push({ event: variant.events[ei], sectionIndex: si, eventIndex: ei });
        }
      }

      if (allEvents.length === 0) return;

      const ids: number[] = [];
      let beatOffset = 0;
      for (const { event, sectionIndex, eventIndex } of allEvents) {
        const beats = event.durationBeats;
        const duration = beatsToDuration(beats);

        const bars = Math.floor(beatOffset / 4);
        const quarters = Math.floor(beatOffset % 4);
        const sixteenths = (beatOffset % 1) * 4;
        const timeStr = `${bars}:${quarters}:${sixteenths}`;

        const si = sectionIndex;
        const ei = eventIndex;
        const id = Tone.getTransport().schedule((time) => {
          if (!synthRef.current) return;
          const notes = event.notesWithOctave.length > 0 ? event.notesWithOctave : event.notes.map((n) => `${n}3`);
          synthRef.current.triggerAttackRelease(notes, duration, time);
          Tone.getDraw().schedule(() => {
            setPlaybackPosition(si, ei);
          }, time);
        }, timeStr);
        ids.push(id);
        beatOffset += beats;
      }

      // Schedule stop at end
      const totalMeasures = beatOffset / 4;
      const endId = Tone.getTransport().schedule(() => {
        Tone.getDraw().schedule(() => {
          stopPlayback();
        }, Tone.now());
      }, `${totalMeasures}m`);
      ids.push(endId);

      scheduleIdsRef.current = ids;
      setPlaybackMode("full-song");
      setPlaybackPosition(allEvents[0].sectionIndex, 0);
      Tone.getTransport().loop = false;
      Tone.getTransport().position = 0;
      Tone.getTransport().start();
    },
    [project.sections, stopPlayback, setPlaybackMode, setPlaybackPosition]
  );

  // Play transition preview between two sections
  const playTransition = useCallback(
    async (fromSection: HarmonicSection, toSection: HarmonicSection) => {
      if (Tone.getContext().state !== "running") await Tone.start();
      stopPlayback();
      const fromVariant = fromSection.variants.find((v) => v.id === fromSection.activeVariantId);
      const toVariant = toSection.variants.find((v) => v.id === toSection.activeVariantId);
      if (!fromVariant || !toVariant) return;

      // Play last 2 events of from + first 2 events of to
      const fromEvents = fromVariant.events.slice(-2);
      const toEvents = toVariant.events.slice(0, 2);
      const combined = [...fromEvents, ...toEvents];
      if (combined.length === 0) return;

      setPlaybackMode("transition-preview");
      scheduleEvents(combined, false);
    },
    [stopPlayback, scheduleEvents, setPlaybackMode]
  );

  const playNote = useCallback(
    (noteWithOctave: string) => {
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(noteWithOctave, "4n");
      }
    },
    []
  );

  return (
    <div className="flex h-full">
      {/* Left Panel - Song Structure */}
      <SongStructurePanel
        project={project}
        activeSectionId={activeSectionId}
        onSelectSection={setActiveSection}
        playbackMode={playbackMode}
        playbackSectionIndex={playbackSectionIndex}
        onPlaySection={(section) => playSection(section, false)}
        onPlayFullSong={() => playFullSong(0)}
        onStop={stopPlayback}
        onBackToProjects={() => setActiveProject(null)}
      />

      {/* Center Panel - Section Editor */}
      <SectionEditorPanel
        project={project}
        section={activeSection}
        variant={activeVariant}
        playbackMode={playbackMode}
        playbackEventIndex={playbackEventIndex}
        onPlayChord={playChord}
        onPlaySection={(loop) => activeSection && playSection(activeSection, loop)}
        onStop={stopPlayback}
      />

      {/* Right Panel - Harmonic Preview */}
      <HarmonicPreviewPanel
        project={project}
        section={activeSection}
        variant={activeVariant}
        playbackMode={playbackMode}
        playbackEventIndex={playbackEventIndex}
        playbackSectionIndex={playbackSectionIndex}
        onPlayChord={playChord}
        onPlaySection={(loop) => activeSection && playSection(activeSection, loop)}
        onPlayFullSong={(fromIdx) => playFullSong(fromIdx)}
        onPlayTransition={() => {
          if (!activeSection) return;
          const idx = project.sections.findIndex((s) => s.id === activeSection.id);
          if (idx < project.sections.length - 1) {
            playTransition(project.sections[idx], project.sections[idx + 1]);
          }
        }}
        onStop={stopPlayback}
        onPlayNote={playNote}
        soundPreset={soundPreset}
        onSoundPresetChange={setSoundPreset}
        isSynthLoading={isSynthLoading}
      />
    </div>
  );
}
