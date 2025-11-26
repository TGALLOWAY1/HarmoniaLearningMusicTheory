"use client";

import { useMemo } from "react";
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

            return (
              <div
                key={midiNote}
                className={`
                  relative flex flex-col
                  h-full w-10
                  bg-surface-muted border-r border-subtle
                  transition-colors duration-200 ease-in-out
                  transition-shadow duration-200 ease-in-out
                  ${
                    isHighlighted
                      ? "border-accent bg-accent/10 shadow-md shadow-accent/20 animate-note-on z-10"
                      : ""
                  }
                `}
              >
                {/* Key body */}
                <div
                  className={`
                    flex-1
                    transition-colors duration-200 ease-in-out
                    ${
                      isHighlighted
                        ? "bg-accent/20"
                        : ""
                    }
                  `}
                />
                
                {/* Label at bottom */}
                <div
                  className={`
                    px-1 py-1 text-xs font-mono text-center
                    transition-colors duration-200
                    ${isHighlighted ? "text-accent font-semibold" : "text-muted"}
                  `}
                >
                  {fullName}
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

            return (
              <div
                key={midiNote}
                className={`
                  absolute
                  h-20 w-7
                  bg-accent border-2 border-subtle rounded-b
                  transition-colors duration-200 ease-in-out
                  transition-shadow duration-200 ease-in-out
                  pointer-events-auto
                  z-20
                  ${
                    isHighlighted
                      ? "border-accent bg-foreground shadow-md shadow-accent/30 animate-note-on"
                      : "shadow-sm"
                  }
                `}
                style={{ left: `${leftOffset}px` }}
              >
                {/* Label at bottom of black key - pitch class only */}
                <div
                  className={`
                    absolute bottom-0 left-0 right-0
                    px-1 py-0.5 text-xs font-mono text-center
                    transition-colors duration-200
                    ${isHighlighted ? "text-surface font-semibold" : "text-surface/90"}
                  `}
                >
                  {pitchClass}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

