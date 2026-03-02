import { PitchClass } from "../theory/midiUtils";
import { ChordQuality, RomanNumeral } from "../theory/chord";

export interface Chord {
    symbol: string;
    notes: string[];
    romanNumeral: string;
    notesWithOctave?: string[];
    midiNotes?: number[];
    root?: PitchClass;
    quality?: ChordQuality;
    isLocked?: boolean;
}

export interface Progression {
    id: string;
    chords: Chord[];
    timestamp: number;
}
