import { create } from "zustand";

interface SettingsState {
  freeExploreMode: boolean;
  enableAdvancedTopics: boolean;
  hintLevel: "none" | "light";
  setFreeExploreMode: (value: boolean) => void;
  setEnableAdvancedTopics: (value: boolean) => void;
  setHintLevel: (level: "none" | "light") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  freeExploreMode: false,
  enableAdvancedTopics: false,
  hintLevel: "light",
  setFreeExploreMode: (value: boolean) => set({ freeExploreMode: value }),
  setEnableAdvancedTopics: (value: boolean) =>
    set({ enableAdvancedTopics: value }),
  setHintLevel: (level: "none" | "light") => set({ hintLevel: level }),
}));

