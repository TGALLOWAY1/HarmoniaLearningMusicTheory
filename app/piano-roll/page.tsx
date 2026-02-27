import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PianoRollDemo } from "@/components/piano-roll/PianoRollDemo";

export default function PianoRollPage() {
    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                    <h1 className="text-lg font-medium">Piano Roll Explorer</h1>
                    <div className="flex items-center gap-4 w-12">
                        {/* Empty space to balance header */}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 flex flex-col items-center">
                <section className="mb-12 text-center max-w-2xl">
                    <h2 className="text-3xl font-light mb-2">Piano Roll</h2>
                    <p className="text-muted">
                        Visualize scales and diatonic chords directly on the keys to build muscle memory and identify intervals at a glance.
                    </p>
                </section>

                <section className="w-full max-w-5xl flex justify-center">
                    <PianoRollDemo />
                </section>
            </main>
        </div>
    );
}
