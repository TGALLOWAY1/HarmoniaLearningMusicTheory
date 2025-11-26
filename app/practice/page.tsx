"use client";

import { useState, useEffect } from "react";
import { Flashcard } from "@/components/flashcards/Flashcard";

type LoadedCard = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
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
        correctIndex: data.card.correctIndex,
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
      // Check correctness locally by comparing selectedIndex with correctIndex
      setCorrectIndex(card.correctIndex);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitQuality(q: 0 | 1 | 2 | 3) {
    if (!card || selectedIndex === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/cards/${card.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedIndex,
          quality: q,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quality rating");
      }

      // After submitting quality, fetch the next card
      await fetchNextCard();
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

            <div className="mt-4 flex flex-col gap-3">
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
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => submitQuality(0)}
                    disabled={submitting}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 disabled:opacity-60"
                  >
                    Again
                  </button>
                  <button
                    type="button"
                    onClick={() => submitQuality(1)}
                    disabled={submitting}
                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                  >
                    Hard
                  </button>
                  <button
                    type="button"
                    onClick={() => submitQuality(2)}
                    disabled={submitting}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:opacity-60"
                  >
                    Good
                  </button>
                  <button
                    type="button"
                    onClick={() => submitQuality(3)}
                    disabled={submitting}
                    className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-60"
                  >
                    Easy
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

