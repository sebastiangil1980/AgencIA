import type { Level } from "./tutor";

export type Prefs = { level: Level; goal: string; gender: string; done: boolean };
const KEY = "agencia-prefs";
const DEFAULT: Prefs = { level: "intermediate", goal: "", gender: "", done: false };

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* almacenamiento no disponible */
  }
}
