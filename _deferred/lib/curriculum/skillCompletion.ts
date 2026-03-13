/**
 * Skill Module Completion Tracking
 * 
 * Tracks completion status of skill modules using localStorage.
 * Completion is per-browser and persists across sessions.
 */

const STORAGE_KEY = "harmonia.skillCompletion.v1";

export type SkillCompletionMap = Record<string, boolean>;

/**
 * Load skill completion map from localStorage
 * @returns Map of module ID to completion status
 */
export function loadSkillCompletion(): SkillCompletionMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored) as SkillCompletionMap;
    // Validate that it's an object
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to load skill completion from localStorage:", error);
    return {};
  }
}

/**
 * Save skill completion map to localStorage
 * @param map - Map of module ID to completion status
 */
export function saveSkillCompletion(map: SkillCompletionMap): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn("Failed to save skill completion to localStorage:", error);
  }
}

/**
 * Check if a module is completed
 * @param id - Module ID
 * @returns True if the module is marked as completed
 */
export function isModuleCompleted(id: string): boolean {
  const map = loadSkillCompletion();
  return map[id] === true;
}

/**
 * Mark a module as completed
 * @param id - Module ID
 */
export function markModuleCompleted(id: string): void {
  const map = loadSkillCompletion();
  map[id] = true;
  saveSkillCompletion(map);
  
  // Dispatch custom event for same-window updates
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("skillModuleCompleted", { detail: { moduleId: id } })
    );
  }
}

/**
 * Clear completion status for a module (for testing/reset)
 * @param id - Module ID
 */
export function clearModuleCompletion(id: string): void {
  const map = loadSkillCompletion();
  delete map[id];
  saveSkillCompletion(map);
}

