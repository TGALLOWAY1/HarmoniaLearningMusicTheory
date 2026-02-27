"use client";

import { useMemo } from "react";
import clsx from "clsx";
import {
  midiToNoteName,
  midiToPitchClass,
  isWhiteKey,
  generateMidiRange,
} from "@/lib/theory/midiUtils";

export type HighlightLayer = {
  id: string;
  label?: string;
  midiNotes: number[];
};

export type PianoRollSize = "sm" | "md" | "lg";

export type PianoRollProps = {
  lowestMidiNote?: number; // default: 48 (C3)
  highestMidiNote?: number; // default: 59 (B3)
  highlightLayers?: HighlightLayer[];
  className?: string;
  size?: PianoRollSize;
};

const SIZE_CONFIGS = {
  sm: { whiteWidth: 32, blackWidth: 20, height: 120, blackHeight: 70, labelWhite: "text-[8px]", labelBlack: "text-[7px]" },
  md: { whiteWidth: 44, blackWidth: 28, height: 160, blackHeight: 95, labelWhite: "text-[10px]", labelBlack: "text-[9px]" },
  lg: { whiteWidth: 56, blackWidth: 36, height: 200, blackHeight: 120, labelWhite: "text-xs", labelBlack: "text-[10px]" },
};

export function PianoRoll({
  lowestMidiNote,
  highestMidiNote,
  highlightLayers = [],
  className = "",
  size = "md",
}: PianoRollProps) {
  // Default to single canonical octave: C3-B3 (48-59)
  const defaultLowest = lowestMidiNote ?? 48; // C3
  const defaultHighest = highestMidiNote ?? 59; // B3

  const dimensions = SIZE_CONFIGS[size];

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

  // Calculate black key positions relative to white keys (match reference: leftWhiteX + WHITE_KEY_W - BLACK_KEY_W/2)
  const blackKeyPositions = useMemo(() => {
    const positions: Map<number, number> = new Map();
    let whiteIdx = 0;
    midiNotes.forEach((note) => {
      if (isWhiteKey(note)) {
        whiteIdx++;
      } else {
        const leftWhiteX = (whiteIdx - 1) * dimensions.whiteWidth;
        const blackX = leftWhiteX + dimensions.whiteWidth - dimensions.blackWidth / 2;
        positions.set(note, blackX);
      }
    });
    return positions;
  }, [midiNotes, dimensions]);

  return (
    <div
      className={clsx("piano-wrap overflow-x-auto overflow-y-hidden pb-2", className)}
    >
      <div
        className="relative flex"
        style={{ height: dimensions.height, width: "max-content" }}
      >
        {/* White keys layer */}
        {whiteKeys.map((midiNote) => {
          const isHighlighted = highlightedSet.has(midiNote);
          const fullName = midiToNoteName(midiNote);

          return (
            <div
              key={midiNote}
              className={clsx(
                "piano-white-key relative flex flex-col items-center justify-end cursor-pointer select-none flex-shrink-0 transition-all duration-[120ms] ease-out",
                isHighlighted ? "piano-white-in-scale" : "piano-white-out-scale"
              )}
              style={{
                width: dimensions.whiteWidth,
                height: dimensions.height,
              }}
            >
              <span
                className={clsx(
                  "key-label font-medium tracking-wide pointer-events-none leading-none pb-2.5",
                  dimensions.labelWhite,
                  isHighlighted ? "text-piano-text-bright" : "text-piano-text-dim"
                )}
              >
                {fullName}
              </span>
              {isHighlighted && (
                <div
                  className="scale-dot absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-piano-accent"
                  style={{
                    bottom: 28,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Black keys layer - absolutely positioned on top */}
        {blackKeys.map((midiNote) => {
          const isHighlighted = highlightedSet.has(midiNote);
          const pitchClass = midiToPitchClass(midiNote);
          const leftOffset = blackKeyPositions.get(midiNote) ?? 0;

          return (
            <div
              key={midiNote}
              className={clsx(
                "piano-black-key absolute flex flex-col items-center justify-end cursor-pointer select-none z-[2] transition-all duration-[120ms] ease-out",
                isHighlighted ? "piano-black-in-scale" : "piano-black-out-scale"
              )}
              style={{
                left: leftOffset,
                width: dimensions.blackWidth,
                height: dimensions.blackHeight,
                top: 0,
              }}
            >
              {isHighlighted && (
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-b-sm z-10 bg-piano-accent"
                />
              )}
              <span
                className={clsx(
                  "key-label font-medium tracking-wide pointer-events-none leading-none pb-1.5",
                  dimensions.labelBlack,
                  isHighlighted ? "text-piano-scale-white opacity-80" : "text-piano-muted-black"
                )}
              >
                {pitchClass}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

