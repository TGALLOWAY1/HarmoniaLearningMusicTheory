/**
 * Basic Card Meta Types
 * 
 * Defines the meta field shapes for basic flashcard kinds, including
 * chord-based cards with scale membership information.
 */

import type { PitchClass } from "../theory/midiUtils";

/**
 * Scale membership information for a chord
 * Describes which key(s) a chord belongs to and its function within that key
 */
export type ScaleMembership = {
  keyRoot: PitchClass; // e.g. "C"
  keyType: "major" | "natural_minor"; // extend later as needed
  degree: string; // e.g. "I", "ii", "V"
};

/**
 * Base meta structure for chord-based cards
 * Contains chord information and optional scale membership data
 */
export type ChordCardMetaBase = {
  root: PitchClass; // chord root
  quality: string; // e.g. "maj", "min", "dim", etc.
  notes: PitchClass[]; // chord notes
  scaleMemberships?: ScaleMembership[]; // this is what we're adding
};

/**
 * Meta for notes_from_chord cards
 * Question: "Which notes make this chord?"
 * 
 * Extends ChordCardMetaBase with chord-specific fields
 */
export type NotesFromChordMeta = ChordCardMetaBase & {
  type?: string; // e.g. "triad", "7th" - chord type (not scale type)
};

/**
 * Meta for chord_from_notes cards
 * Question: "What chord is built from these notes?"
 * 
 * Extends ChordCardMetaBase - notes array is required, root/quality derived
 */
export type ChordFromNotesMeta = ChordCardMetaBase;

/**
 * Union type of all basic card meta types
 * Used for type-safe narrowing in card renderers
 */
export type BasicCardMeta = NotesFromChordMeta | ChordFromNotesMeta;

/**
 * Type guard functions for narrowing basic card meta types
 */
export function isNotesFromChordMeta(
  meta: unknown,
  kind: string
): meta is NotesFromChordMeta {
  return kind === "notes_from_chord";
}

export function isChordFromNotesMeta(
  meta: unknown,
  kind: string
): meta is ChordFromNotesMeta {
  return kind === "chord_from_notes";
}

/**
 * Type guard to check if meta has scale memberships
 */
export function hasScaleMemberships(
  meta: unknown
): meta is { scaleMemberships?: ScaleMembership[] } {
  return (
    typeof meta === "object" &&
    meta !== null &&
    "scaleMemberships" in meta
  );
}

