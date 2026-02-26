"use client";

import { useMemo, useState, useCallback } from "react";
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
  /**
   * "panel" = assume parent has piano-roll-panel (e.g. PianoRollDemo).
   * "inline" = wrap in piano-roll-panel for standalone use (e.g. circle page).
   */
  variant?: "panel" | "inline";
  /** Called when a key is clicked. Use for note display / audio. */
  onKeyPress?: (midiNote: number) => void;
};

// Match reference: 44px white, 28px black
const WHITE_KEY_WIDTH = 44;
const BLACK_KEY_WIDTH = 28;

export function PianoRoll({
  lowestMidiNote,
  highestMidiNote,
  highlightLayers = [],
  className = "",
  variant = "panel",
  onKeyPress,
}: PianoRollProps) {
  const [playedKey, setPlayedKey] = useState<number | null>(null);

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

  // Create a Set of all highlighted (in-scale) MIDI notes from all layers
  const inScaleSet = useMemo(() => {
    const set = new Set<number>();
    highlightLayers?.forEach((layer) => {
      layer.midiNotes.forEach((note) => set.add(note));
    });
    return set;
  }, [highlightLayers]);

  // Calculate black key positions relative to white keys
  const blackKeyPositions = useMemo(() => {
    const positions: Map<number, number> = new Map();
    let whiteKeyIndex = 0;
    midiNotes.forEach((note) => {
      if (isWhiteKey(note)) {
        whiteKeyIndex++;
      } else {
        const leftOffset =
          (whiteKeyIndex - 1) * WHITE_KEY_WIDTH +
          WHITE_KEY_WIDTH -
          BLACK_KEY_WIDTH / 2;
        positions.set(note, leftOffset);
      }
    });
    return positions;
  }, [midiNotes]);

  const handleKeyClick = useCallback(
    (midiNote: number) => {
      onKeyPress?.(midiNote);
      setPlayedKey(midiNote);
      setTimeout(() => setPlayedKey(null), 400);
    },
    [onKeyPress]
  );

  const pianoContent = (
    <div className="piano-roll-wrap">
      <div className="piano-roll-keys" style={{ width: whiteKeys.length * WHITE_KEY_WIDTH }}>
        {/* White keys */}
        {whiteKeys.map((midiNote) => {
          const inScale = inScaleSet.has(midiNote);
          const fullName = midiToNoteName(midiNote);
          const isPlayed = playedKey === midiNote;

          return (
            <div
              key={midiNote}
              className={clsx(
                "piano-key-white",
                inScale ? "in-scale" : "out-scale",
                isPlayed && "piano-key-played"
              )}
              onClick={() => handleKeyClick(midiNote)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleKeyClick(midiNote);
                }
              }}
              aria-label={`Play ${fullName}`}
            >
              {inScale && <div className="piano-scale-dot" />}
              <span className="piano-key-label">{fullName}</span>
            </div>
          );
        })}

        {/* Black keys - absolutely positioned */}
        {blackKeys.map((midiNote) => {
          const inScale = inScaleSet.has(midiNote);
          const pitchClass = midiToPitchClass(midiNote);
          const leftOffset = blackKeyPositions.get(midiNote) ?? 0;
          const isPlayed = playedKey === midiNote;

          return (
            <div
              key={midiNote}
              className={clsx(
                "piano-key-black",
                inScale ? "in-scale" : "out-scale",
                isPlayed && "piano-key-played"
              )}
              style={{ left: `${leftOffset}px` }}
              onClick={(e) => {
                e.stopPropagation();
                handleKeyClick(midiNote);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleKeyClick(midiNote);
                }
              }}
              aria-label={`Play ${pitchClass}`}
            >
              <span className="piano-key-label">{pitchClass}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={clsx("piano-roll-panel", className)}>
        {pianoContent}
      </div>
    );
  }

  return <div className={clsx(className)}>{pianoContent}</div>;
}
