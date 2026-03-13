import { create } from "zustand";

type ScaleType = "major" | "natural_minor" | "dorian" | "mixolydian" | "phrygian";

interface TheorySelectionState {
  selectedKey: string | null;
  selectedScaleType: ScaleType | null;
  selectedChordSymbol: string | null;
  setSelectedKey: (key: string | null) => void;
  setSelectedScaleType: (scaleType: ScaleType | null) => void;
  setSelectedChordSymbol: (chordSymbol: string | null) => void;
}

export const useTheorySelectionStore = create<TheorySelectionState>((set) => ({
  selectedKey: null,
  selectedScaleType: null,
  selectedChordSymbol: null,
  setSelectedKey: (key: string | null) => set({ selectedKey: key }),
  setSelectedScaleType: (scaleType: ScaleType | null) =>
    set({ selectedScaleType: scaleType }),
  setSelectedChordSymbol: (chordSymbol: string | null) =>
    set({ selectedChordSymbol: chordSymbol }),
}));

