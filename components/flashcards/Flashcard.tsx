"use client";

import clsx from "clsx";

export type FlashcardOption = {
  index: number;
  label: string;
};

export type FlashcardProps = {
  question: string;
  options: FlashcardOption[];
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect: (index: number) => void;
  isSubmitting?: boolean;
  showResult?: boolean;
};

export function Flashcard({
  question,
  options,
  selectedIndex,
  correctIndex,
  onSelect,
  isSubmitting = false,
  showResult = false,
}: FlashcardProps) {
  const base =
    "flex min-h-[64px] items-center justify-center rounded-xl border text-sm text-foreground px-3 py-2 text-center transition-colors duration-150";

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm max-w-xl w-full">
      <h2 className="text-lg font-medium text-foreground">{question}</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedIndex === opt.index;
          const isCorrect = opt.index === correctIndex;
          const isIncorrect = isSelected && showResult && !isCorrect;

          let buttonClasses = base;

          if (showResult) {
            // After result is shown
            if (isCorrect) {
              // Correct answer - green
              buttonClasses = clsx(
                base,
                "border-emerald-500 bg-emerald-500 text-white"
              );
            } else if (isIncorrect) {
              // Selected but incorrect - red
              buttonClasses = clsx(
                base,
                "border-red-500 bg-red-500 text-white"
              );
            } else {
              // Not selected, not correct - muted
              buttonClasses = clsx(
                base,
                "border-subtle bg-surface-muted text-muted"
              );
            }
          } else {
            // Before result is shown
            if (isSelected) {
              // Selected - emerald highlight
              buttonClasses = clsx(
                base,
                "border-emerald-400 bg-emerald-50 text-foreground"
              );
            } else {
              // Idle - default muted
              buttonClasses = clsx(
                base,
                "border-subtle bg-surface-muted text-muted hover:bg-surface"
              );
            }
          }

          return (
            <button
              key={opt.index}
              type="button"
              onClick={() => onSelect(opt.index)}
              disabled={isSubmitting || showResult}
              className={buttonClasses}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

