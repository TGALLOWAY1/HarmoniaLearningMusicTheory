"use client";

import { useSettingsStore } from "@/lib/state/settingsStore";

export default function Home() {
  const freeExploreMode = useSettingsStore((state) => state.freeExploreMode);
  const setFreeExploreMode = useSettingsStore((state) => state.setFreeExploreMode);

  return (
    <main>
      <h1 className="text-4xl font-bold mb-4">Harmonia – Music Theory Learning App</h1>
      
      {/* Debug component to test Zustand */}
      <div className="mt-8 p-4 border border-slate-700 rounded-lg bg-slate-900">
        <h2 className="text-lg font-semibold mb-2">Debug: Settings Store</h2>
        <div className="flex items-center gap-4">
          <span className="text-slate-300">
            Free Explore Mode: <span className="font-mono">{freeExploreMode ? "ON" : "OFF"}</span>
          </span>
          <button
            onClick={() => setFreeExploreMode(!freeExploreMode)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded transition-colors"
          >
            Toggle
          </button>
        </div>
      </div>
    </main>
  );
}

