"use client";

import { useState, useEffect } from "react";
import type { PitchClass } from "@/lib/theory";
import { buildTriadFromRoot } from "@/lib/theory/chord";
import { markModuleCompleted } from "@/lib/curriculum/skillCompletion";

const PITCH_CLASSES: PitchClass[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

type FeedbackState = "idle" | "correct" | "incorrect";

const CONSECUTIVE_CORRECT_NEEDED = 3;

export function TriadBuilderModule({ moduleId }: { moduleId: string }) {
  const [currentRoot, setCurrentRoot] = useState<PitchClass>("C");
  const [currentQuality, setCurrentQuality] = useState<"maj" | "min">("maj");
  const [correctNotes, setCorrectNotes] = useState<PitchClass[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<PitchClass[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate new triad on mount and after success
  const generateNewTriad = () => {
    // Randomize root
    const randomRootIndex = Math.floor(Math.random() * PITCH_CLASSES.length);
    const newRoot = PITCH_CLASSES[randomRootIndex];

    // Randomize quality (maj or min)
    const newQuality: "maj" | "min" = Math.random() < 0.5 ? "maj" : "min";

    // Compute correct notes using chord theory
    const triad = buildTriadFromRoot(newRoot, newQuality);
    const correct = [...triad.pitchClasses].sort((a, b) => {
      return PITCH_CLASSES.indexOf(a) - PITCH_CLASSES.indexOf(b);
    });

    setCurrentRoot(newRoot);
    setCurrentQuality(newQuality);
    setCorrectNotes(correct);
    setSelectedNotes([]);
    setFeedback("idle");
  };

  useEffect(() => {
    generateNewTriad();
  }, [moduleId]);

  const toggleNote = (note: PitchClass) => {
    if (feedback === "correct") return; // Don't allow changes after correct answer

    setSelectedNotes((prev) => {
      if (prev.includes(note)) {
        return prev.filter((n) => n !== note);
      } else {
        // Limit to 3 notes
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, note];
      }
    });
  };

  const checkAnswer = () => {
    if (selectedNotes.length !== 3) {
      return;
    }

    const selectedSorted = [...selectedNotes].sort((a, b) => {
      return PITCH_CLASSES.indexOf(a) - PITCH_CLASSES.indexOf(b);
    });

    const isCorrect =
      selectedSorted.length === correctNotes.length &&
      selectedSorted.every((note, index) => note === correctNotes[index]);

    if (isCorrect) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      
      // Mark as completed after N consecutive correct answers
      if (newConsecutive >= CONSECUTIVE_CORRECT_NEEDED && !isCompleted) {
        markModuleCompleted(moduleId);
        setIsCompleted(true);
      }
    } else {
      setConsecutiveCorrect(0);
    }

    setFeedback(isCorrect ? "correct" : "incorrect");
  };

  const handleMarkCompleted = () => {
    markModuleCompleted(moduleId);
    setIsCompleted(true);
  };

  const handleNext = () => {
    generateNewTriad();
    // Reset consecutive count when moving to next (optional - could keep it)
    // setConsecutiveCorrect(0);
  };

  const qualityLabel = currentQuality === "maj" ? "Major" : "Minor";

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="text-center">
        <h3 className="text-lg font-medium mb-1">
          Build the triad: {currentRoot} {qualityLabel}
        </h3>
        <p className="text-sm text-muted">Select 3 notes</p>
      </div>

      {/* Note Selection UI */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PITCH_CLASSES.map((note) => {
          const isSelected = selectedNotes.includes(note);
          const isCorrectNote = correctNotes.includes(note);
          const showIncorrect =
            feedback === "incorrect" && isCorrectNote && !isSelected;

          return (
            <button
              key={note}
              onClick={() => toggleNote(note)}
              disabled={feedback === "correct"}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                isSelected
                  ? "bg-foreground text-surface border-foreground"
                  : showIncorrect
                  ? "bg-red-500/10 text-red-600 border-red-500/20"
                  : "bg-surface text-foreground border-subtle hover:bg-surface-muted hover:border-foreground/20"
              } ${
                feedback === "correct" ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {note}
            </button>
          );
        })}
      </div>

      {/* Feedback and Actions */}
      <div className="space-y-3">
        {feedback === "correct" && (
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                ✓ Correct! Well done.
              </p>
              {consecutiveCorrect >= CONSECUTIVE_CORRECT_NEEDED && !isCompleted && (
                <p className="text-xs text-green-600">
                  Module completed! ({consecutiveCorrect} in a row)
                </p>
              )}
              {consecutiveCorrect > 0 && consecutiveCorrect < CONSECUTIVE_CORRECT_NEEDED && (
                <p className="text-xs text-muted">
                  {consecutiveCorrect} of {CONSECUTIVE_CORRECT_NEEDED} correct in a row
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-6 py-2 text-sm font-medium hover:opacity-90 transition"
              >
                Next
              </button>
              {!isCompleted && (
                <button
                  onClick={handleMarkCompleted}
                  className="inline-flex items-center justify-center rounded-full border border-subtle bg-surface text-foreground px-4 py-2 text-xs font-medium hover:bg-surface-muted transition"
                >
                  Mark completed
                </button>
              )}
            </div>
          </div>
        )}

        {feedback === "incorrect" && (
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-red-600">
              Incorrect. The correct notes are: {correctNotes.join(", ")}
            </p>
            <button
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-full bg-foreground text-surface px-6 py-2 text-sm font-medium hover:opacity-90 transition"
            >
              Try another
            </button>
          </div>
        )}

        {feedback === "idle" && (
          <div className="text-center">
            <button
              onClick={checkAnswer}
              disabled={selectedNotes.length !== 3}
              className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium transition ${
                selectedNotes.length === 3
                  ? "bg-foreground text-surface hover:opacity-90"
                  : "bg-surface-muted text-muted border border-subtle cursor-not-allowed"
              }`}
            >
              Check answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

