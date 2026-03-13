"use client";

import { useProgressionStore } from "../../lib/state/progressionStore";
import ChordCard from "./ChordCard";
import * as Tone from "tone";
import { useRef, useEffect } from "react";
import { Chord } from "../../lib/theory/progressionTypes";

export default function TriadPalette() {
    const { primaryTriads, bpm } = useProgressionStore();
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // Audio initialization for previewing
    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            volume: -10,
            oscillator: { type: "triangle" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.5 }
        }).toDestination();

        synthRef.current = synth;

        return () => {
            synth.dispose();
            synthRef.current = null;
        };
    }, []);

    const playPreview = (chord: Chord) => {
        if (!synthRef.current) return;
        const notes = chord.notes.map(n => `${n}3`);

        synthRef.current.releaseAll();
        // Calculate duration based on BPM (quarter note duration)
        const duration = 60 / bpm;
        synthRef.current.triggerAttackRelease(notes, duration);
    };

    if (!primaryTriads || primaryTriads.length === 0) {
        return null; // Hidden if no scale selected somehow
    }

    return (
        <div className="w-full mt-12 bg-surface rounded-3xl p-8 border border-border-subtle shadow-sm">
            <h3 className="text-lg font-medium mb-4 text-center">Primary Triads</h3>
            <p className="text-sm text-muted text-center mb-6">Drag and drop into the arrangement above, or click to preview.</p>

            <div className="flex gap-4 overflow-x-auto pb-4 justify-start md:justify-center px-4 snap-x">
                {primaryTriads.map((chord, i) => (
                    <div
                        key={`${chord.romanNumeral}-${i}`}
                        className="shrink-0 w-32 snap-center transition-transform hover:-translate-y-1 active:scale-95"
                        onClick={() => playPreview(chord)}
                    >
                        <ChordCard
                            chord={chord}
                            index={i}
                            isDraggable={true}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
