import type { GameState } from "../types/game";
import { hydrateGameState } from "./character";

const STORAGE_KEY = "hogwarts-portal-save-v1";

export function loadGameState(): GameState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return hydrateGameState(JSON.parse(raw) as GameState);
  } catch (error) {
    console.error("Failed to load saved game:", error);
    return null;
  }
}

export function saveGameState(state: GameState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

export function clearGameState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear saved game:", error);
  }
}
