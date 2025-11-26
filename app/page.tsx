"use client";

import { PianoRollDemo } from "@/components/piano-roll/PianoRollDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <section className="bg-surface border border-subtle rounded-2xl shadow-sm px-8 py-10 md:px-10 md:py-12 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
          {/* Badge/Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
            <span>Harmonia</span>
            <span className="h-1 w-1 rounded-full bg-accent" />
            <span>Music theory for producers</span>
          </div>

          {/* Hero Title and Subtitle */}
          <h1 className="mt-6 text-4xl md:text-5xl font-light tracking-tight text-foreground">
            Learn harmony visually.
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-xl">
            Interactive piano roll, circle of fifths, and spaced repetition designed for electronic music producers.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-surface shadow-sm transition-colors duration-150 hover:bg-foreground">
              Start practicing
            </button>
            <button className="inline-flex items-center rounded-full border border-subtle bg-surface px-4 py-2 text-sm font-medium text-muted hover:bg-surface-muted transition-colors duration-150">
              View theory roadmap
            </button>
          </div>
        </section>
      </div>

      {/* Piano Roll Demo Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PianoRollDemo />
      </div>
    </main>
  );
}

