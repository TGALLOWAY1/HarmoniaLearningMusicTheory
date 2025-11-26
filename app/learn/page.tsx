export default function LearnPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-4">
        <h1 className="text-3xl font-light tracking-tight mb-2">
          Learn path (coming soon)
        </h1>
        <p className="text-muted max-w-xl">
          This page will become the curriculum hub, where you can see milestones,
          unlock new topics, and follow a guided path through notes, scales,
          chords, the circle of fifths, and eventually modes and advanced harmony.
        </p>
        <p className="text-sm text-muted">
          For now, you can still use{" "}
          <span className="font-medium">Practice</span>,{" "}
          <span className="font-medium">Circle of fifths</span>, and{" "}
          <span className="font-medium">Progress</span> from the home page.
        </p>
      </div>
    </main>
  );
}

