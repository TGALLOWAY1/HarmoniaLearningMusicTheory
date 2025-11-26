"use client";

import { useMemo } from "react";
import clsx from "clsx";
import {
  midiToNoteName,
  midiToPitchClass,
  isBlackKey,
  isWhiteKey,
  generateMidiRange,
} from "@/lib/theory/midiUtils";

export type HighlightLayer = {
  id: string;
  label?: string;
  midiNotes: number[];
};

export type PianoRollProps = {
  lowestMidiNote?: number; // default: 48 (C3)
  highestMidiNote?: number; // default: 59 (B3)
  highlightLayers?: HighlightLayer[];
  className?: string;
};

// White key width in Tailwind units (w-10 = 2.5rem = 40px)
const WHITE_KEY_WIDTH = 40; // pixels
const BLACK_KEY_WIDTH = 28; // pixels

export function PianoRoll({
  lowestMidiNote,
  highestMidiNote,
  highlightLayers = [],
  className = "",
}: PianoRollProps) {
  // Default to single canonical octave: C3-B3 (48-59)
  const defaultLowest = lowestMidiNote ?? 48; // C3
  const defaultHighest = highestMidiNote ?? 59; // B3

  // Generate all MIDI notes in range (left to right, lowest to highest)
  const midiNotes = useMemo(() => {
    return generateMidiRange(defaultLowest, defaultHighest);
  }, [defaultLowest, defaultHighest]);

  // Split into white and black keys
  const { whiteKeys, blackKeys } = useMemo(() => {
    const white: number[] = [];
    const black: number[] = [];
    midiNotes.forEach((note) => {
      if (isWhiteKey(note)) {
        white.push(note);
      } else {
        black.push(note);
      }
    });
    return { whiteKeys: white, blackKeys: black };
  }, [midiNotes]);

  // Create a Set of all highlighted MIDI notes from all layers for O(1) lookup
  const highlightedSet = useMemo(() => {
    const allHighlighted = new Set<number>();
    highlightLayers?.forEach((layer) => {
      layer.midiNotes.forEach((note) => allHighlighted.add(note));
    });
    return allHighlighted;
  }, [highlightLayers]);

  // Calculate black key positions relative to white keys
  const blackKeyPositions = useMemo(() => {
    const positions: Map<number, number> = new Map();
    
    blackKeys.forEach((blackMidi) => {
      // Find the white key index that this black key should be positioned after
      // Black keys are positioned between their neighboring white keys
      let whiteKeyIndex = 0;
      for (let i = 0; i < whiteKeys.length; i++) {
        if (whiteKeys[i] < blackMidi) {
          whiteKeyIndex = i;
        } else {
          break;
        }
      }
      
      // Position black key between white keys
      // For C# (between C and D): position after C (index 0) at ~60% of white key width
      // For D# (between D and E): position after D (index 1) at ~60% of white key width
      // etc.
      const leftOffset = whiteKeyIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH * 0.6 - BLACK_KEY_WIDTH / 2;
      positions.set(blackMidi, leftOffset);
    });
    
    return positions;
  }, [whiteKeys, blackKeys]);

  // Base styles for inactive keys - very muted, low-saturation
  const whiteKeyBase =
    "relative flex flex-col items-center justify-end h-full w-10 rounded-md border border-neutral-300 bg-neutral-50 text-[10px] text-neutral-400 transition-all duration-150 ease-out";
  
  const blackKeyBase =
    "absolute flex flex-col items-center justify-end h-20 w-7 rounded-md border border-neutral-500 bg-neutral-800 text-[9px] text-neutral-100 transition-all duration-150 ease-out";

  // Active/highlighted styles for keys - bright, saturated, obvious
  const whiteKeyActive =
    "bg-emerald-500 border-emerald-600 shadow-[0_10px_24px_rgba(16,185,129,0.65)] key-strong-active z-10";
  
  const blackKeyActive =
    "bg-emerald-600 border-emerald-700 text-white shadow-[0_12px_30px_rgba(16,185,129,0.8)] key-strong-active";

  return (
    <div
      className={`w-full bg-surface rounded-lg border border-subtle overflow-hidden shadow-sm ${className}`}
    >
      <div className="relative h-48 overflow-x-auto">
        {/* White keys layer */}
        <div className="relative flex flex-row h-full">
          {whiteKeys.map((midiNote) => {
            const isHighlighted = highlightedSet.has(midiNote);
            const fullName = midiToNoteName(midiNote);

            const whiteKeyClassName = clsx(
              whiteKeyBase,
              "border-r",
              isHighlighted && whiteKeyActive
            );

            return (
              <div key={midiNote} className={whiteKeyClassName}>
                {/* Key body */}
                <div className="flex-1" />
                
                {/* Container for label and indicator */}
                <div className="relative pb-1">
                  {/* Label at bottom - always visible with proper color */}
                  <span
                    className={clsx(
                      "block px-1 text-xs font-mono text-center relative z-30",
                      isHighlighted ? "font-semibold text-neutral-900" : "text-neutral-400"
                    )}
                  >
                    {fullName}
                  </span>
                  
                  {/* Active indicator bar at bottom, below label */}
                  {isHighlighted && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-emerald-300 z-20" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Black keys layer - absolutely positioned on top */}
        <div className="absolute top-0 left-0 h-full pointer-events-none z-10">
          {blackKeys.map((midiNote) => {
            const isHighlighted = highlightedSet.has(midiNote);
            const pitchClass = midiToPitchClass(midiNote); // Show only pitch class, no octave
            const leftOffset = blackKeyPositions.get(midiNote) ?? 0;

            const blackKeyClassName = clsx(
              blackKeyBase,
              "rounded-b pointer-events-auto z-20",
              isHighlighted ? blackKeyActive : "shadow-sm"
            );

            return (
              <div
                key={midiNote}
                className={blackKeyClassName}
                style={{ left: `${leftOffset}px` }}
              >
                {/* Container for label and indicator */}
                <div className="absolute bottom-0 left-0 right-0 pb-1">
                  {/* Label at bottom */}
                  <span
                    className={clsx(
                      "block px-1 text-[9px] font-mono text-center relative z-30",
                      isHighlighted ? "font-semibold text-white" : "text-neutral-200"
                    )}
                  >
                    {pitchClass}
                  </span>
                  
                  {/* Active indicator bar at bottom, below label */}
                  {isHighlighted && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-emerald-300 z-20" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

