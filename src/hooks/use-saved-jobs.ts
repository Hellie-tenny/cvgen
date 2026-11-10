import { useCallback, useSyncExternalStore } from "react";

// Saved jobs live in this device's localStorage only (no account needed).
// Only the listing ID and the save time are stored; the listing itself is
// fetched live so edits to a closing date are always reflected.
const STORAGE_KEY = "etiquette-saved-jobs";
const CHANGE_EVENT = "etiquette-saved-jobs-change";

export interface SavedJob {
  id: string;
  savedAt: number;
}

// useSyncExternalStore needs a stable snapshot reference between changes,
// so cache the parsed list and only re-parse when the raw string changes.
let cachedRaw: string | null = null;
let cachedList: SavedJob[] = [];

function read(): SavedJob[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedList;
    cachedRaw = raw;
    const parsed = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed)
      ? parsed.filter((j) => j && typeof j.id === "string" && typeof j.savedAt === "number")
      : [];
  } catch {
    cachedList = [];
  }
  return cachedList;
}

function write(list: SavedJob[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Could not save jobs to localStorage:", error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback); // changes from another tab
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const getServerSnapshot = (): SavedJob[] => [];

export function useSavedJobs() {
  const saved = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const isSaved = useCallback((id: string) => saved.some((j) => j.id === id), [saved]);

  const toggle = useCallback((id: string) => {
    const current = read();
    if (current.some((j) => j.id === id)) {
      write(current.filter((j) => j.id !== id));
    } else {
      write([{ id, savedAt: Date.now() }, ...current]);
    }
  }, []);

  const remove = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    write(read().filter((j) => !ids.includes(j.id)));
  }, []);

  return { saved, isSaved, toggle, remove };
}
