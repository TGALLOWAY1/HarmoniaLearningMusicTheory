import { create } from "zustand";

export type FeedbackRating = "up" | "down";

export interface FeedbackEntry {
  id: string;
  timestamp: number;
  rating: FeedbackRating;
  // Progression snapshot
  progressionId: string;
  chordSymbols: string[];
  chordMidi: number[][];
  // Generation settings
  rootKey: string;
  mode: string;
  complexity: number;
  numChords: number;
  bpm: number;
  // Voicing settings
  voicingStyle: string;
  voiceCount: number;
  // Voice-leading quality metrics
  voiceLeadingCosts: number[];
  averageCost: number;
}

interface FeedbackState {
  entries: FeedbackEntry[];
  addFeedback: (entry: FeedbackEntry) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "harmonia-voicing-feedback";

function loadEntries(): FeedbackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: FeedbackEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable
  }
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  entries: loadEntries(),

  addFeedback: (entry) => {
    const updated = [...get().entries, entry];
    saveEntries(updated);
    set({ entries: updated });
  },

  clearAll: () => {
    saveEntries([]);
    set({ entries: [] });
  },
}));
