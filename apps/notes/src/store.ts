import { useCallback, useEffect, useState } from "react";
import { useCloudPush } from "lifestyle-sync";
import type { AppState, DailyArticle, Note, NoteCategory } from "./types";
import { STORAGE_KEY } from "./types";
import { classifyContent, createId, extractTags, suggestTitle, todayStr } from "./utils";

let applyRemoteState: ((state: AppState) => void) | null = null;

export function applyRemotePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return;
  applyRemoteState?.(payload as AppState);
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { notes: [], articles: [] };
    return JSON.parse(raw) as AppState;
  } catch {
    return { notes: [], articles: [] };
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useNotesStore() {
  const [state, setStateRaw] = useState<AppState>(loadState);

  useEffect(() => {
    applyRemoteState = (data) => setStateRaw(data);
    return () => {
      applyRemoteState = null;
    };
  }, []);

  useCloudPush(STORAGE_KEY, state);

  const setState = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNote = useCallback(
    (data: { title?: string; content: string; category?: NoteCategory; date?: string }) => {
      const content = data.content.trim();
      const category = data.category ?? classifyContent(content);
      const tags = extractTags(content);
      const now = new Date().toISOString();
      const note: Note = {
        id: createId(),
        title: data.title?.trim() || suggestTitle(content),
        content,
        category,
        tags,
        date: data.date ?? todayStr(),
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
      return note;
    },
    [setState]
  );

  const updateNote = useCallback(
    (id: string, patch: Partial<Pick<Note, "title" | "content" | "category" | "tags">>) => {
      setState((prev) => ({
        ...prev,
        notes: prev.notes.map((n) => {
          if (n.id !== id) return n;
          const content = patch.content?.trim() ?? n.content;
          return {
            ...n,
            ...patch,
            content,
            title: patch.title ?? (patch.content ? suggestTitle(content) : n.title),
            category: patch.category ?? (patch.content ? classifyContent(content) : n.category),
            tags: patch.tags ?? (patch.content ? extractTags(content) : n.tags),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [setState]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
    },
    [setState]
  );

  const saveArticle = useCallback(
    (data: { date: string; title: string; content: string; sourceNoteIds: string[] }) => {
      const now = new Date().toISOString();
      setState((prev) => {
        const existing = prev.articles.find((a) => a.date === data.date);
        if (existing) {
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.date === data.date
                ? { ...a, ...data, updatedAt: now }
                : a
            ),
          };
        }
        const article: DailyArticle = {
          id: createId(),
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, articles: [article, ...prev.articles] };
      });
    },
    [setState]
  );

  return { state, addNote, updateNote, deleteNote, saveArticle };
}
