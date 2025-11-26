"use client";

import { useState, useEffect } from "react";
import { Flashcard } from "@/components/flashcards/Flashcard";

type LoadedCard = {
  id: number;
  question: string;
  options: string[];
};

export default function PracticePage() {
  const [card, setCard] = useState<LoadedCard | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNextCard() {
    setLoading(true);
    setError(null);
    setSelectedIndex(null);
    setCorrectIndex(null);

    try {
      const res = await fetch("/api/cards/next");
      if (!res.ok) {
        throw new Error("Failed to fetch next card");
      }
      const data = await res.json();
      setCard({
        id: data.card.id,
        question: data.card.question,
        options: data.card.options,
      });
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNextCard();
  }, []);

  async function handleSelectOption(index: number) {
    setSelectedIndex(index);
  }

  async function handleSubmit() {
    if (!card || selectedIndex === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/cards/${card.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIndex }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await res.json();
      setCorrectIndex(data.correctIndex);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-10">
        <header className="mb-6 text-center">
          <p className="text-xs text-muted">Practice</p>
          <h1 className="text-2xl font-light tracking-tight text-foreground">
            Chords & scales flashcards
          </h1>
        </header>

        {loading && (
          <div className="text-center text-muted">
            <p>Loading next card…</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="mb-4 text-red-500">{error}</p>
            <button
              type="button"
              onClick={fetchNextCard}
              className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-foreground border border-subtle hover:bg-surface-muted"
            >
              Retry
            </button>
          </div>
        )}

        {card && !loading && !error && (
          <>
            <Flashcard
              question={card.question}
              options={card.options.map((label, index) => ({ index, label }))}
              selectedIndex={selectedIndex}
              correctIndex={correctIndex}
              onSelect={handleSelectOption}
              isSubmitting={submitting}
              showResult={correctIndex !== null}
            />

            <div className="mt-4 flex gap-3">
              {correctIndex === null ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedIndex === null || submitting}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:opacity-60"
                >
                  {submitting ? "Checking..." : "Check answer"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchNextCard}
                  className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-foreground border border-subtle hover:bg-surface-muted"
                >
                  Next card
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

