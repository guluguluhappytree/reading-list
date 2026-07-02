import { useCallback, useEffect, useState } from "react";
import { useCloudPush } from "lifestyle-sync";
import type { AppState, Book, QuizResult, ReadingGoal } from "./types";
import { STORAGE_KEY } from "./types";
import { createId, generateReadingList } from "./utils";

let applyRemoteState: ((state: AppState) => void) | null = null;

export function applyRemotePayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("goals" in payload)) return;
  const parsed = payload as AppState;
  applyRemoteState?.({ goals: parsed.goals.map(migrateGoal) });
}

function migrateGoal(goal: ReadingGoal): ReadingGoal {
  return {
    ...goal,
    books: goal.books.map((b) => ({
      ...b,
      notes: typeof b.notes === "string" ? b.notes : "",
    })),
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { goals: [] };
    const parsed = JSON.parse(raw) as AppState;
    return { goals: parsed.goals.map(migrateGoal) };
  } catch {
    return { goals: [] };
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useReadingStore() {
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

  const addGoal = useCallback(
    (title: string, books?: Book[], pathName?: string) => {
      const trimmed = title.trim();
      const generated = books ? { pathName: pathName ?? "自定义书单", books, matched: true } : generateReadingList(trimmed);
      const now = new Date().toISOString();
      const goal: ReadingGoal = {
        id: createId(),
        title: trimmed,
        pathName: generated.pathName,
        books: generated.books,
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
      return goal;
    },
    [setState]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
    },
    [setState]
  );

  const toggleBookRead = useCallback(
    (goalId: string, bookId: string) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          return {
            ...g,
            books: g.books.map((b) => (b.id === bookId ? { ...b, read: !b.read } : b)),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [setState]
  );

  const updateBookNotes = useCallback(
    (goalId: string, bookId: string, notes: string) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          return {
            ...g,
            books: g.books.map((b) => (b.id === bookId ? { ...b, notes: notes.trim() } : b)),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [setState]
  );

  const saveQuizResult = useCallback(
    (goalId: string, result: QuizResult) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === goalId ? { ...g, lastQuiz: result, updatedAt: new Date().toISOString() } : g
        ),
      }));
    },
    [setState]
  );

  const markBooksForReread = useCallback(
    (goalId: string, bookIds: string[]) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const idSet = new Set(bookIds);
          return {
            ...g,
            books: g.books.map((b) =>
              idSet.has(b.id) ? { ...b, read: false } : b
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [setState]
  );

  const addBook = useCallback(
    (goalId: string, data: { title: string; author?: string; reason?: string }) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const order = g.books.length;
          const book: Book = {
            id: createId(),
            title: data.title.trim(),
            author: data.author?.trim() ?? "",
            reason: data.reason?.trim() ?? "自定义补充",
            order,
            read: false,
            custom: true,
            notes: "",
          };
          return { ...g, books: [...g.books, book], updatedAt: new Date().toISOString() };
        }),
      }));
    },
    [setState]
  );

  const removeBook = useCallback(
    (goalId: string, bookId: string) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const books = g.books.filter((b) => b.id !== bookId).map((b, i) => ({ ...b, order: i }));
          return { ...g, books, updatedAt: new Date().toISOString() };
        }),
      }));
    },
    [setState]
  );

  const regenerateList = useCallback(
    (goalId: string) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const generated = generateReadingList(g.title);
          const metaByTitle = new Map(
            g.books.map((b) => [b.title, { read: b.read, notes: b.notes }])
          );
          const customBooks = g.books.filter((b) => b.custom);
          const merged = [
            ...generated.books.map((b) => {
              const meta = metaByTitle.get(b.title);
              return { ...b, read: meta?.read ?? false, notes: meta?.notes ?? "" };
            }),
            ...customBooks.map((b, i) => ({ ...b, order: generated.books.length + i })),
          ];
          return {
            ...g,
            pathName: generated.pathName,
            books: merged,
            lastQuiz: undefined,
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [setState]
  );

  return {
    state,
    addGoal,
    deleteGoal,
    toggleBookRead,
    updateBookNotes,
    saveQuizResult,
    markBooksForReread,
    addBook,
    removeBook,
    regenerateList,
    replaceState: setState,
  };
}
