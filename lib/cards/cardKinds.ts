/**
 * Card Kind Definitions
 * 
 * Defines all flashcard kinds supported by the system, including basic and advanced types.
 */

// Basic card kinds (existing)
export type BasicCardKind =
  | "notes_from_chord"
  | "chord_from_notes"
  | "key_signature"
  | "circle_geometry"
  | "circle_relative_minor"
  | "circle_neighbor_key";

// Advanced card kinds (new)
export type AdvancedCardKind =
  | "scale_spelling"
  | "diatonic_chord_id"
  | "degree_to_chord"
  | "chord_to_degree"
  | "mode_character"
  | "progression_prediction"
  | "tension_selection";

// Union of all card kinds
export type CardKind = BasicCardKind | AdvancedCardKind;

