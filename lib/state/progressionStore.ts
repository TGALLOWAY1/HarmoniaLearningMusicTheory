import { create } from "zustand";
import type { Progression, Chord } from "../theory/progressionTypes";
import type { Mode } from "../theory/harmonyEngine";
import { midiToPitchClass, normalizeToPitchClass } from "../theory/midiUtils";
import { progressionToMidi } from "../progressionMidiExport";
import { generateAdvancedProgression } from "../music/generators/advanced/generateAdvancedProgression";
import type { AdvancedProgressionOptions } from "../music/generators/advanced/types";

export type ComplexityLevel = 1 | 2 | 3 | 4;

export const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
    1: "Simple",
    2: "Rich",
    3: "Extended",
    4: "Altered",
};

interface ProgressionState {
    currentProgression: Progression | null;
    history: Progression[];
    isPlaying: boolean;
    bpm: number;

    // Settings
    rootKey: string;
    mode: Mode;
    complexity: ComplexityLevel;
    numChords: number;

    setSettings: (settings: Partial<Pick<ProgressionState, "rootKey" | "mode" | "complexity" | "numChords" | "bpm">>) => void;
    generateNew: () => void;
    setIsPlaying: (playing: boolean) => void;
    addToHistory: (progression: Progression) => void;
    exportMidi: () => void;
}

type ComplexityOptions = Pick<
    AdvancedProgressionOptions,
    "complexity" | "useSecondaryDominants" | "usePassingChords" | "useSuspensions" | "useTritoneSubstitution"
>;

function complexityToOptions(complexity: ComplexityLevel): ComplexityOptions {
    switch (complexity) {
        case 1:
            return {
                complexity: 1,
                useSecondaryDominants: false,
                usePassingChords: false,
                useSuspensions: false,
                useTritoneSubstitution: false,
            };
        case 2:
            return {
                complexity: 2,
                useSecondaryDominants: true,
                usePassingChords: false,
                useSuspensions: false,
                useTritoneSubstitution: false,
            };
        case 3:
            return {
                complexity: 3,
                useSecondaryDominants: true,
                usePassingChords: true,
                useSuspensions: true,
                useTritoneSubstitution: false,
            };
        case 4:
            return {
                complexity: 4,
                useSecondaryDominants: true,
                usePassingChords: true,
                useSuspensions: true,
                useTritoneSubstitution: true,
            };
    }
}

export const useProgressionStore = create<ProgressionState>((set, get) => ({
    currentProgression: null,
    history: [],
    isPlaying: false,
    bpm: 120,

    rootKey: "C",
    mode: "ionian",
    complexity: 2,
    numChords: 4,

    setSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
    },

    generateNew: () => {
        const { rootKey, mode, complexity, numChords } = get();
        const rootPC = normalizeToPitchClass(rootKey) || "C";

        const result = generateAdvancedProgression({
            rootKey: rootPC,
            mode,
            numChords,
            voicingStyle: "auto",
            voiceCount: 4,
            rangeLow: 48,
            rangeHigh: 72,
            ...complexityToOptions(complexity),
        });

        const chords: Chord[] = result.chords.map((voiced) => {
            const pitchClasses = Array.from(new Set(voiced.midi.map((midi) => midiToPitchClass(midi))));
            const root = pitchClasses[0];

            return {
                symbol: voiced.symbol,
                notes: pitchClasses,
                romanNumeral: voiced.degreeLabel,
                notesWithOctave: voiced.notes,
                midiNotes: voiced.midi,
                root,
            };
        });

        const progression: Progression = {
            id: `prog-${Date.now()}`,
            chords,
            timestamp: Date.now(),
        };

        set({ currentProgression: progression });
        get().addToHistory(progression);
    },

    setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing });
    },

    addToHistory: (progression: Progression) => {
        set((state) => ({
            history: [progression, ...state.history].slice(0, 10),
        }));
    },

    exportMidi: () => {
        const { currentProgression, bpm, rootKey, mode } = get();
        if (!currentProgression) return;

        const midiChords = currentProgression.chords.map(c => ({
            symbol: c.symbol,
            notesWithOctave: c.notesWithOctave && c.notesWithOctave.length > 0
                ? c.notesWithOctave
                : c.notes.map(n => `${n}3`)
        }));

        const blob = progressionToMidi(midiChords, bpm);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `harmonia-${rootKey}-${mode}-${Date.now()}.mid`;
        a.click();
        URL.revokeObjectURL(url);
    },
}));
