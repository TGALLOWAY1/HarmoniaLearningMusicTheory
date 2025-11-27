"use client";

import { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import { Flashcard } from "@/components/flashcards/Flashcard";
import type { PitchClass } from "@/lib/theory";
import type { ScaleType } from "@/lib/theory/types";
import {
  getScaleDefinition,
  getDiatonicChords,
} from "@/lib/theory";
import type {
  ScaleSpellingMeta,
  DiatonicChordIdMeta,
  ModeCharacterMeta,
  ProgressionPredictionMeta,
} from "@/lib/cards/advancedCardMeta";
import {
  isScaleSpellingMeta,
  isDiatonicChordIdMeta,
  isModeCharacterMeta,
  isProgressionPredictionMeta,
} from "@/lib/cards/advancedCardMeta";
import {
  playChordFromPitchClasses,
  playScaleFromPitchClasses,
} from "@/lib/audio/playChordFromPitchClasses";
import { getDegreeInfo } from "@/lib/theory/degreeInfo";

export type FlashcardRendererProps = {
  question: string;
  options: Array<{ index: number; label: string }>;
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  isSubmitting?: boolean;
  showResult?: boolean;
  cardKind?: string;
  cardMeta?: any;
};

// Mode characteristic options
const MODE_CHARACTERISTICS = [
  "Raised 6th",
  "Lowered 7th",
  "Lowered 2nd",
  "Raised 4th",
  "Lowered 3rd",
];

// Tension options
const TENSION_OPTIONS = [
  "9th",
  "11th",
  "13th",
  "b9",
  "#11",
  "b13",
];

/**
 * Format scale type for display
 */
function formatScaleType(type: ScaleType): string {
  switch (type) {
    case "major":
      return "major";
    case "natural_minor":
      return "natural minor";
    case "dorian":
      return "Dorian";
    case "mixolydian":
      return "Mixolydian";
    case "phrygian":
      return "Phrygian";
  }
}

/**
 * Format key name for display
 */
function formatKeyName(root: PitchClass, type: "major" | "natural_minor"): string {
  return `${root} ${type === "major" ? "major" : "minor"}`;
}

/**
 * Format notes as a readable string
 */
function formatNotes(notes: PitchClass[]): string {
  return notes.join(" – ");
}

/**
 * Base button styles for answer buttons (mobile-friendly with larger touch targets)
 */
const baseButton =
  "flex min-h-[56px] md:min-h-[48px] items-center justify-center rounded-full border text-sm font-medium text-foreground px-4 py-3 md:py-2 text-center transition-colors duration-150 touch-manipulation";

/**
 * Get smart feedback message for incorrect answers
 */
function getSmartFeedback(
  selectedOption: string,
  correctOption: string,
  cardKind: string,
  meta: any
): string | null {
  if (cardKind === "scale_spelling") {
    // Check if answer is close (1 semitone off)
    const selectedNotes = selectedOption.split(" – ") as PitchClass[];
    const correctNotes = correctOption.split(" – ") as PitchClass[];
    
    if (selectedNotes.length === correctNotes.length) {
      // Check if all notes are shifted by 1 semitone
      const allPitchClasses: PitchClass[] = [
        "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
      ];
      let allShifted = true;
      for (let i = 0; i < selectedNotes.length; i++) {
        const selectedIdx = allPitchClasses.indexOf(selectedNotes[i]);
        const correctIdx = allPitchClasses.indexOf(correctNotes[i]);
        if ((selectedIdx + 1) % 12 !== correctIdx) {
          allShifted = false;
          break;
        }
      }
      if (allShifted) {
        return "Almost — check enharmonics or scale degree.";
      }
    }
  }
  
  return null;
}

/**
 * Degree tooltip component
 */
function DegreeTooltip({
  degree,
  keyType,
  children,
}: {
  degree: string;
  keyType: "major" | "natural_minor";
  children: React.ReactNode;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const degreeInfo = getDegreeInfo(degree, keyType);

  if (!degreeInfo) return <>{children}</>;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-64 p-3 bg-foreground text-surface rounded-lg text-xs shadow-lg pointer-events-none">
          <div className="font-semibold mb-1">
            {degreeInfo.degree} — {degreeInfo.function}
          </div>
          <div className="text-surface/90">{degreeInfo.description}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-foreground rotate-45"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Render scale spelling card
 */
function ScaleSpellingCard({
  meta,
  options: providedOptions,
  selectedIndex,
  correctIndex,
  onSelect,
  showResult,
  isSubmitting,
}: {
  meta: ScaleSpellingMeta;
  options?: Array<{ index: number; label: string }>;
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  showResult: boolean;
  isSubmitting: boolean;
}) {
  // Use provided options if available, otherwise generate them
  const options = useMemo(() => {
    if (providedOptions && providedOptions.length > 0) {
      return providedOptions.map((opt) => opt.label);
    }

    // Generate options: correct scale + 3 incorrect variations
    const scale = getScaleDefinition(meta.root, meta.type);
    const correctNotes = scale.pitchClasses;
    const allPitchClasses: PitchClass[] = [
      "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
    ];

    // Option 1: Correct scale
    const correct = formatNotes(correctNotes);

    // Option 2: Shifted scale (one semitone up)
    const shifted = correctNotes.map((pc) => {
      const idx = allPitchClasses.indexOf(pc);
      return allPitchClasses[(idx + 1) % 12];
    });

    // Option 3: Major if minor, minor if major
    let swapped: PitchClass[];
    if (meta.type === "major") {
      swapped = getScaleDefinition(meta.root, "natural_minor").pitchClasses;
    } else if (meta.type === "natural_minor") {
      swapped = getScaleDefinition(meta.root, "major").pitchClasses;
    } else {
      swapped = getScaleDefinition(meta.root, "major").pitchClasses;
    }

    // Option 4: Missing one note
    const missing = [...correctNotes];
    missing.pop();
    const wrongNote = allPitchClasses.find((p) => !missing.includes(p))!;
    missing.push(wrongNote);

    return [
      correct,
      formatNotes(shifted),
      formatNotes(swapped),
      formatNotes(missing),
    ];
  }, [meta, providedOptions]);

  const scale = useMemo(() => getScaleDefinition(meta.root, meta.type), [meta]);
  const [smartFeedback, setSmartFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (showResult && selectedIndex !== null && correctIndex !== null && selectedIndex !== correctIndex) {
      const selectedOption = options[selectedIndex];
      const correctOption = options[correctIndex];
      const feedback = getSmartFeedback(selectedOption, correctOption, "scale_spelling", meta);
      setSmartFeedback(feedback);
    } else {
      setSmartFeedback(null);
    }
  }, [showResult, selectedIndex, correctIndex, options, meta]);

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm max-w-xl w-full">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-medium text-foreground">
          Spell the {meta.root} {formatScaleType(meta.type)} scale.
        </h2>
        <button
          type="button"
          onClick={() => playScaleFromPitchClasses(scale.pitchClasses)}
          className="ml-4 flex-shrink-0 p-2 rounded-full border border-subtle bg-surface-muted hover:bg-surface text-muted hover:text-foreground transition-colors"
          title="Play scale"
          aria-label="Play scale"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      {smartFeedback && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
          {smartFeedback}
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = correctIndex !== null && index === correctIndex;
          const isIncorrect = isSelected && showResult && !isCorrect;

          let buttonClasses = baseButton;

          if (showResult) {
            if (isCorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-500 bg-emerald-500 text-white"
              );
            } else if (isIncorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-red-500 bg-red-500 text-white"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted"
              );
            }
          } else {
            if (isSelected) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-400 bg-emerald-50 text-foreground"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted hover:bg-surface"
              );
            }
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              disabled={isSubmitting || showResult}
              className={buttonClasses}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render diatonic chord ID card
 */
function DiatonicChordIdCard({
  meta,
  options: providedOptions,
  selectedIndex,
  correctIndex,
  onSelect,
  showResult,
  isSubmitting,
}: {
  meta: DiatonicChordIdMeta;
  options?: Array<{ index: number; label: string }>;
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  showResult: boolean;
  isSubmitting: boolean;
}) {
  // Use provided options if available, otherwise generate them
  const options = useMemo(() => {
    if (providedOptions && providedOptions.length > 0) {
      return providedOptions.map((opt) => opt.label);
    }

    // Generate options: correct degree + 3 other degrees
    const diatonicSet = getDiatonicChords(meta.keyRoot, meta.keyType);
    const allDegrees = diatonicSet.triads.map((t) => t.degree);
    const correct = meta.degree;
    const others = allDegrees.filter((d) => d !== correct);
    // Shuffle and take 3 (deterministic shuffle based on key)
    const shuffled = [...others].sort((a, b) => {
      // Deterministic sort based on key root
      return a.localeCompare(b);
    });
    return [correct, ...shuffled.slice(0, 3)];
  }, [meta, providedOptions]);

  const [smartFeedback, setSmartFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (showResult && selectedIndex !== null && correctIndex !== null && selectedIndex !== correctIndex) {
      const selectedOption = options[selectedIndex];
      const correctOption = options[correctIndex];
      const feedback = getSmartFeedback(selectedOption, correctOption, "diatonic_chord_id", meta);
      setSmartFeedback(feedback);
    } else {
      setSmartFeedback(null);
    }
  }, [showResult, selectedIndex, correctIndex, options, meta]);

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm max-w-xl w-full">
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-lg font-medium text-foreground">
          In {formatKeyName(meta.keyRoot, meta.keyType)}, which chord is {formatNotes(meta.notes)}?
        </h2>
        <button
          type="button"
          onClick={() => playChordFromPitchClasses(meta.notes)}
          className="ml-4 flex-shrink-0 p-2 rounded-full border border-subtle bg-surface-muted hover:bg-surface text-muted hover:text-foreground transition-colors"
          title="Play chord"
          aria-label="Play chord"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      {smartFeedback && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
          {smartFeedback}
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((degree, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = correctIndex !== null && index === correctIndex;
          const isIncorrect = isSelected && showResult && !isCorrect;

          let buttonClasses = baseButton;

          if (showResult) {
            if (isCorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-500 bg-emerald-500 text-white"
              );
            } else if (isIncorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-red-500 bg-red-500 text-white"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted"
              );
            }
          } else {
            if (isSelected) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-400 bg-emerald-50 text-foreground"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted hover:bg-surface"
              );
            }
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              disabled={isSubmitting || showResult}
              className={buttonClasses}
            >
              {degree}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render progression prediction card
 */
function ProgressionPredictionCard({
  meta,
  options: providedOptions,
  selectedIndex,
  correctIndex,
  onSelect,
  showResult,
  isSubmitting,
}: {
  meta: ProgressionPredictionMeta;
  options?: Array<{ index: number; label: string }>;
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  showResult: boolean;
  isSubmitting: boolean;
}) {
  // Use provided options if available, otherwise generate them
  const options = useMemo(() => {
    if (providedOptions && providedOptions.length > 0) {
      return providedOptions.map((opt) => opt.label);
    }

    // Generate options: correct next + 3 other degrees
    const diatonicSet = getDiatonicChords(meta.keyRoot, meta.keyType);
    const allDegrees = diatonicSet.triads.map((t) => t.degree);
    const correct = meta.correctNext;
    const others = allDegrees.filter((d) => d !== correct);
    // Deterministic sort
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    return [correct, ...shuffled.slice(0, 3)];
  }, [meta, providedOptions]);

  const progressionStr = meta.currentChords.join(" → ");

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm max-w-xl w-full">
      <h2 className="text-lg font-medium text-foreground mb-2">
        In {formatKeyName(meta.keyRoot, meta.keyType)}, what is the most likely next chord after: {progressionStr}?
      </h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((degree, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = correctIndex !== null && index === correctIndex;
          const isIncorrect = isSelected && showResult && !isCorrect;

          let buttonClasses = baseButton;

          if (showResult) {
            if (isCorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-500 bg-emerald-500 text-white"
              );
            } else if (isIncorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-red-500 bg-red-500 text-white"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted"
              );
            }
          } else {
            if (isSelected) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-400 bg-emerald-50 text-foreground"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted hover:bg-surface"
              );
            }
          }

          return (
            <DegreeTooltip key={index} degree={degree} keyType={meta.keyType}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={isSubmitting || showResult}
                className={buttonClasses}
              >
                {degree}
              </button>
            </DegreeTooltip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render mode character card
 */
function ModeCharacterCard({
  meta,
  options: providedOptions,
  selectedIndex,
  correctIndex,
  onSelect,
  showResult,
  isSubmitting,
}: {
  meta: ModeCharacterMeta;
  options?: Array<{ index: number; label: string }>;
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  showResult: boolean;
  isSubmitting: boolean;
}) {
  // Use provided options if available, otherwise generate them
  const options = useMemo(() => {
    if (providedOptions && providedOptions.length > 0) {
      return providedOptions.map((opt) => opt.label);
    }

    // Generate options: correct characteristic + 3 others
    const correct = meta.characteristic;
    const others = MODE_CHARACTERISTICS.filter((c) => c !== correct);
    // Deterministic sort
    const shuffled = [...others].sort((a, b) => a.localeCompare(b));
    return [correct, ...shuffled.slice(0, 3)];
  }, [meta, providedOptions]);

  const modeName = formatScaleType(meta.mode);

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm max-w-xl w-full">
      <h2 className="text-lg font-medium text-foreground mb-2">
        What is the characteristic feature of the {meta.root} {modeName} mode?
      </h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((characteristic, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = correctIndex !== null && index === correctIndex;
          const isIncorrect = isSelected && showResult && !isCorrect;

          let buttonClasses = baseButton;

          if (showResult) {
            if (isCorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-500 bg-emerald-500 text-white"
              );
            } else if (isIncorrect) {
              buttonClasses = clsx(
                baseButton,
                "border-red-500 bg-red-500 text-white"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted"
              );
            }
          } else {
            if (isSelected) {
              buttonClasses = clsx(
                baseButton,
                "border-emerald-400 bg-emerald-50 text-foreground"
              );
            } else {
              buttonClasses = clsx(
                baseButton,
                "border-subtle bg-surface-muted text-muted hover:bg-surface"
              );
            }
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              disabled={isSubmitting || showResult}
              className={buttonClasses}
            >
              {characteristic}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main FlashcardRenderer component with transitions
 * Handles both basic and advanced card kinds
 */
export function FlashcardRenderer(props: FlashcardRendererProps) {
  const { cardKind, cardMeta } = props;
  const [isVisible, setIsVisible] = useState(false);

  // Fade-in animation on mount/card change
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [props.question, props.cardKind]);

  // Handle advanced card kinds
  const content = (() => {
    if (cardKind === "scale_spelling" && isScaleSpellingMeta(cardMeta, cardKind)) {
    return (
      <ScaleSpellingCard
        meta={cardMeta}
        options={props.options}
        selectedIndex={props.selectedIndex}
        correctIndex={props.correctIndex}
        onSelect={props.onSelect}
        showResult={props.showResult ?? false}
        isSubmitting={props.isSubmitting ?? false}
      />
    );
  }

  if (cardKind === "diatonic_chord_id" && isDiatonicChordIdMeta(cardMeta, cardKind)) {
    return (
      <DiatonicChordIdCard
        meta={cardMeta}
        options={props.options}
        selectedIndex={props.selectedIndex}
        correctIndex={props.correctIndex}
        onSelect={props.onSelect}
        showResult={props.showResult ?? false}
        isSubmitting={props.isSubmitting ?? false}
      />
    );
  }

  if (cardKind === "progression_prediction" && isProgressionPredictionMeta(cardMeta, cardKind)) {
    return (
      <ProgressionPredictionCard
        meta={cardMeta}
        options={props.options}
        selectedIndex={props.selectedIndex}
        correctIndex={props.correctIndex}
        onSelect={props.onSelect}
        showResult={props.showResult ?? false}
        isSubmitting={props.isSubmitting ?? false}
      />
    );
  }

  if (cardKind === "mode_character" && isModeCharacterMeta(cardMeta, cardKind)) {
    return (
      <ModeCharacterCard
        meta={cardMeta}
        options={props.options}
        selectedIndex={props.selectedIndex}
        correctIndex={props.correctIndex}
        onSelect={props.onSelect}
        showResult={props.showResult ?? false}
        isSubmitting={props.isSubmitting ?? false}
      />
    );
  }

    // For all other card kinds (basic cards, degree_to_chord, chord_to_degree, tension_selection),
    // fall back to the standard Flashcard component
    return <Flashcard {...props} />;
  })();

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      {content}
    </div>
  );
}

