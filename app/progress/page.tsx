"use client";

import { useState, useEffect } from "react";

type ProgressSummary = {
  totals: {
    cardsTotal: number;
    cardsSeen: number;
    cardsUnseen: number;
    attemptsTotal: number;
    correctTotal: number;
    accuracyOverall: number; // 0-1
  };
  srs: {
    dueNow: number;
    dueToday: number;
    overdue: number;
    averageIntervalDays: number;
    averageEaseFactor: number;
  };
  byKind: Array<{
    kind: string;
    cards: number;
    seen: number;
    accuracy: number;
  }>;
  recentActivity: Array<{
    date: string;
    attempts: number;
    correct: number;
  }>;
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/progress/summary");
      if (!res.ok) throw new Error("Failed to load progress");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm text-muted">Loading progress…</p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="text-center">
            <p className="mb-4 text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-foreground border border-subtle hover:bg-surface-muted"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const accuracyPercent = Math.round(data.totals.accuracyOverall * 100);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <p className="text-xs text-muted">Progress</p>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Theory practice overview
          </h1>
          <p className="mt-2 text-sm text-muted">
            Review your flashcard performance and what&apos;s coming up in your spaced
            repetition schedule.
          </p>
        </header>

        {/* (a) Overview cards */}
        <section className="mb-8 grid gap-4 md:grid-cols-2">
          {/* Total cards */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
            <p className="text-xs text-muted">Total cards</p>
            <p className="mt-2 text-2xl font-light text-foreground">
              {data.totals.cardsTotal}
            </p>
            <p className="mt-1 text-xs text-muted">
              {data.totals.cardsSeen} seen · {data.totals.cardsUnseen} unseen
            </p>
          </div>

          {/* Overall accuracy */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
            <p className="text-xs text-muted">Overall accuracy</p>
            <p className="mt-2 text-2xl font-light">
              {Number.isNaN(accuracyPercent) ? "–" : `${accuracyPercent}%`}
            </p>
            <p className="mt-1 text-xs text-muted">
              {data.totals.correctTotal} correct out of {data.totals.attemptsTotal}{" "}
              attempts
            </p>
          </div>

          {/* Attempts */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
            <p className="text-xs text-muted">Total attempts</p>
            <p className="mt-2 text-2xl font-light text-foreground">
              {data.totals.attemptsTotal}
            </p>
            <p className="mt-1 text-xs text-muted">
              Across {data.totals.cardsSeen} cards
            </p>
          </div>

          {/* Seen vs unseen */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
            <p className="text-xs text-muted">Progress</p>
            <p className="mt-2 text-2xl font-light text-foreground">
              {data.totals.cardsTotal > 0
                ? Math.round((data.totals.cardsSeen / data.totals.cardsTotal) * 100)
                : 0}
              %
            </p>
            <p className="mt-1 text-xs text-muted">
              {data.totals.cardsSeen} of {data.totals.cardsTotal} cards reviewed
            </p>
          </div>
        </section>

        {/* (b) SRS status */}
        <section className="mb-8 rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-medium text-foreground">Spaced repetition</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-muted">Due now</p>
              <p className="mt-1 text-xl font-light text-foreground">
                {data.srs.dueNow}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Due today</p>
              <p className="mt-1 text-xl font-light text-foreground">
                {data.srs.dueToday}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Overdue</p>
              <p className="mt-1 text-xl font-light text-foreground">
                {data.srs.overdue}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <span>
              Avg interval: {data.srs.averageIntervalDays.toFixed(1)} days
            </span>
            <span>Avg ease factor: {data.srs.averageEaseFactor.toFixed(2)}</span>
          </div>
        </section>

        {/* (c) By kind + recent activity */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* byKind list */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-medium text-foreground">By card type</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {data.byKind.map((k) => {
                const acc = Math.round(k.accuracy * 100);
                return (
                  <li key={k.kind} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{k.kind}</p>
                      <p className="text-xs text-muted">
                        {k.seen}/{k.cards} seen
                      </p>
                    </div>
                    <p className="text-xs text-muted">{acc}%</p>
                  </li>
                );
              })}
              {data.byKind.length === 0 && (
                <p className="text-xs text-muted">No activity yet.</p>
              )}
            </ul>
          </div>

          {/* recentActivity bar row */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
            {data.recentActivity.length === 0 ? (
              <p className="mt-4 text-xs text-muted">
                No attempts recorded yet. Start a session on the Practice page.
              </p>
            ) : (
              <div className="mt-4 flex items-end gap-2">
                {data.recentActivity.map((day) => {
                  const height = day.attempts === 0 ? 4 : 10 + day.attempts * 4;
                  const pct =
                    day.attempts === 0
                      ? 0
                      : Math.round((day.correct / day.attempts) * 100);

                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1">
                      <div
                        className="flex w-4 items-end rounded-full bg-surface-muted"
                        style={{ height }}
                      >
                        <div
                          className="w-full rounded-full bg-emerald-500"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted">
                        {day.date.slice(5)}
                        {/* MM-DD */}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

