import { Chord } from "../../lib/theory/progressionTypes";

import React from "react";

interface ChordCardProps {
    chord: Chord;
    index: number;
    isActive?: boolean;
    isDraggable?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, chord: Chord, index: number) => void;
    onRemove?: (index: number) => void;
}

export default function ChordCard({
    chord,
    index,
    isActive = false,
    isDraggable = false,
    onDragStart,
    onRemove
}: ChordCardProps) {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) return;

        // Ensure the drag payload is set
        e.dataTransfer.setData("application/json", JSON.stringify({
            source: "chordCard",
            index,
            chord
        }));

        // Custom visual drag effect could go here
        e.dataTransfer.effectAllowed = "copyMove";

        if (onDragStart) {
            onDragStart(e, chord, index);
        }
    };
    return (
        <div
            draggable={isDraggable}
            onDragStart={handleDragStart}
            className={`
        relative flex flex-col items-center justify-center
        rounded-2xl px-6 py-8
        bg-surface border border-border-subtle
        transition-colors duration-200
        ${isActive ? "bg-surface-muted" : ""}
        ${isDraggable ? "cursor-grab active:cursor-grabbing hover:border-accent" : ""}
      `}
        >
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    className="absolute top-2 right-2 text-muted hover:text-foreground p-1 rounded-full hover:bg-surface-muted transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}
            <div className="flex w-full justify-between items-start mb-2">
                <div className="text-sm font-medium text-muted opacity-70">{chord.romanNumeral}</div>
                <div className="text-xs text-muted">#{index + 1}</div>
            </div>
            <div className="text-3xl font-medium mb-1">{chord.symbol}</div>
            <div className="text-xs text-muted mt-2 opacity-70">
                {chord.notes.join(" ")}
            </div>
        </div>
    );
}
