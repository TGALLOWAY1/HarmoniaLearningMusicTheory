import type { PitchClass } from "../theory/midiUtils";
import type { Mode } from "../theory/harmonyEngine";

export type SectionType =
  | "Intro"
  | "Verse"
  | "Pre-Chorus"
  | "Chorus"
  | "Bridge"
  | "Drop"
  | "Outro"
  | "Custom";

export interface HarmonicEvent {
  id: string;
  variantId: string;
  order: number;
  chordSymbol: string;
  chordRoot: PitchClass;
  chordQuality: string;
  romanNumeral: string;
  durationBeats: number;
  inversion: number;
  notes: PitchClass[];
  notesWithOctave: string[];
  midiNotes: number[];
}

export interface HarmonicVariant {
  id: string;
  sectionId: string;
  name: string;
  events: HarmonicEvent[];
  createdAt: number;
}

export interface HarmonicSection {
  id: string;
  projectId: string;
  name: string;
  sectionType: SectionType;
  order: number;
  bars: number;
  keyRoot: PitchClass;
  scaleType: Mode;
  activeVariantId: string;
  variants: HarmonicVariant[];
  createdAt: number;
}

export interface HarmonicSketchProject {
  id: string;
  title: string;
  description: string;
  globalKeyRoot: PitchClass;
  globalScaleType: Mode;
  bpm: number;
  sections: HarmonicSection[];
  createdAt: number;
  updatedAt: number;
}

export type PlaybackMode = "stopped" | "section" | "section-loop" | "full-song" | "transition-preview";
