import { useCallback, useEffect, useState } from "react";
import type { AppState, DayStatus, Habit, TrackingMode } from "./types";
import { STORAGE_KEY } from "./types";
import {
  createMultiWeekRecords,
  createMultiWeekSession,
  createWeekRecords,
  createWeekSession,
  formatDate,
  getMondayOfWeek,
  isMultiMode,
  parseDate,
  shouldAutoAdvanceWeek,
} from "./utils";

function createInitialState(): AppState {
  const monday = getMondayOfWeek(new Date());
  const weekStart = formatDate(monday);
  return {
    habits: [],
    currentHabitIndex: 0,
    cycleNumber: 1,
    weekStartDate: weekStart,
    currentWeekRecords: createWeekRecords(weekStart),
    multiWeekRecords: [],
    trackingMode: "franklin",
    weekHistory: [],
    graduated: false,
    setupComplete: false,
  };
}

function migrateState(parsed: Partial<AppState>): AppState {
  const monday = getMondayOfWeek(new Date());
  const weekStart = parsed.weekStartDate ?? formatDate(monday);
  const habits = parsed.habits ?? [];
  const trackingMode: TrackingMode = parsed.trackingMode ?? "franklin";

  const base: AppState = {
    habits,
    currentHabitIndex: parsed.currentHabitIndex ?? 0,
    cycleNumber: parsed.cycleNumber ?? 1,
    weekStartDate: weekStart,
    currentWeekRecords: parsed.currentWeekRecords ?? createWeekRecords(weekStart),
    multiWeekRecords:
      parsed.multiWeekRecords ?? createMultiWeekRecords(weekStart, habits.map((h) => h.id)),
    trackingMode,
    weekHistory: parsed.weekHistory ?? [],
    graduated: parsed.graduated ?? false,
    setupComplete: parsed.setupComplete ?? false,
  };

  if (base.trackingMode === "multi") {
    base.multiWeekRecords = base.multiWeekRecords.map((day) => {
      const statuses = { ...day.statuses };
      for (const h of base.habits) {
        if (!(h.id in statuses)) statuses[h.id] = null;
      }
      return { date: day.date, statuses };
    });
  }

  return base;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return migrateState(parsed);
  } catch {
    return createInitialState();
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 隐私模式或存储已满时忽略
  }
}

function advanceFranklinWeek(state: AppState, archiveCurrent = true): AppState {
  const hasCurrentWeekData = state.currentWeekRecords.some((r) => r.status !== null);
  const weekHistory =
    archiveCurrent && hasCurrentWeekData
      ? [...state.weekHistory, createWeekSession(state, state.currentWeekRecords)]
      : state.weekHistory;

  const nextIndex = state.currentHabitIndex + 1;
  const isNewCycle = nextIndex >= state.habits.length;
  const newIndex = isNewCycle ? 0 : nextIndex;
  const newCycle = isNewCycle ? state.cycleNumber + 1 : state.cycleNumber;

  const currentMonday = parseDate(state.weekStartDate);
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);
  const weekStart = formatDate(nextMonday);

  return {
    ...state,
    currentHabitIndex: newIndex,
    cycleNumber: newCycle,
    weekStartDate: weekStart,
    currentWeekRecords: createWeekRecords(weekStart),
    weekHistory,
  };
}

function advanceMultiWeek(state: AppState, archiveCurrent = true): AppState {
  const hasData = state.multiWeekRecords.some((r) =>
    Object.values(r.statuses).some((s) => s !== null),
  );
  const weekHistory =
    archiveCurrent && hasData
      ? [...state.weekHistory, createMultiWeekSession(state, state.multiWeekRecords)]
      : state.weekHistory;

  const currentMonday = parseDate(state.weekStartDate);
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);
  const weekStart = formatDate(nextMonday);

  return {
    ...state,
    cycleNumber: state.cycleNumber + 1,
    weekStartDate: weekStart,
    currentWeekRecords: createWeekRecords(weekStart),
    multiWeekRecords: createMultiWeekRecords(
      weekStart,
      state.habits.map((h) => h.id),
    ),
    weekHistory,
  };
}

function advanceToNextWeek(state: AppState, archiveCurrent = true): AppState {
  if (isMultiMode(state)) {
    return advanceMultiWeek(state, archiveCurrent);
  }
  return advanceFranklinWeek(state, archiveCurrent);
}

/** 跨周 / 多周未打开时，循环推进直到当前日历周 */
export function maybeAutoAdvanceAll(state: AppState): AppState {
  if (!state.setupComplete || state.graduated || state.habits.length === 0) {
    return state;
  }

  let next = state;
  let guard = 0;
  while (shouldAutoAdvanceWeek(next) && guard < 52) {
    next = advanceToNextWeek(next, true);
    guard++;
  }
  return next;
}

/** 确保今天落在当前周记录中（App 常驻跨天时） */
function ensureWeekForToday(state: AppState): AppState {
  let next = maybeAutoAdvanceAll(state);
  const today = formatDate(new Date());

  if (isMultiMode(next)) {
    if (next.multiWeekRecords.some((r) => r.date === today)) return next;
    const monday = formatDate(getMondayOfWeek(new Date()));
    return {
      ...next,
      weekStartDate: monday,
      currentWeekRecords: createWeekRecords(monday),
      multiWeekRecords: createMultiWeekRecords(
        monday,
        next.habits.map((h) => h.id),
      ),
    };
  }

  if (next.currentWeekRecords.some((r) => r.date === today)) {
    return next;
  }

  const monday = formatDate(getMondayOfWeek(new Date()));
  return {
    ...next,
    weekStartDate: monday,
    currentWeekRecords: createWeekRecords(monday),
  };
}

export function useAppStore() {
  const [state, setStateRaw] = useState<AppState>(() => maybeAutoAdvanceAll(loadState()));

  const setState = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }, []);

  const refreshWeek = useCallback(() => {
    setState((prev) => ensureWeekForToday(prev));
  }, [setState]);

  useEffect(() => {
    refreshWeek();

    const onVisible = () => {
      if (document.visibilityState === "visible") refreshWeek();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshWeek);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshWeek);
    };
  }, [refreshWeek]);

  const setupHabits = useCallback(
    (habits: Habit[], trackingMode: TrackingMode = "franklin") => {
      const monday = getMondayOfWeek(new Date());
      const weekStart = formatDate(monday);
      setState({
        habits,
        currentHabitIndex: 0,
        cycleNumber: 1,
        weekStartDate: weekStart,
        currentWeekRecords: createWeekRecords(weekStart),
        multiWeekRecords: createMultiWeekRecords(
          weekStart,
          habits.map((h) => h.id),
        ),
        trackingMode,
        weekHistory: [],
        graduated: false,
        setupComplete: true,
      });
    },
    [setState],
  );

  const recordDay = useCallback(
    (date: string, status: DayStatus, habitId?: string) => {
      setState((prev) => {
        const synced = ensureWeekForToday(prev);

        if (isMultiMode(synced)) {
          if (!habitId) return synced;
          const hasDate = synced.multiWeekRecords.some((r) => r.date === date);
          if (!hasDate) return synced;

          return {
            ...synced,
            multiWeekRecords: synced.multiWeekRecords.map((r) =>
              r.date === date
                ? { ...r, statuses: { ...r.statuses, [habitId]: status } }
                : r,
            ),
          };
        }

        const hasDate = synced.currentWeekRecords.some((r) => r.date === date);
        if (!hasDate) return synced;

        return {
          ...synced,
          currentWeekRecords: synced.currentWeekRecords.map((r) =>
            r.date === date ? { ...r, status } : r,
          ),
        };
      });
    },
    [setState],
  );

  const advanceWeek = useCallback(() => {
    setState((prev) => advanceToNextWeek(prev, true));
  }, [setState]);

  const graduate = useCallback(() => {
    setState((prev) => {
      const synced = ensureWeekForToday(prev);
      let weekHistory = synced.weekHistory;

      if (isMultiMode(synced)) {
        const hasData = synced.multiWeekRecords.some((r) =>
          Object.values(r.statuses).some((s) => s !== null),
        );
        if (hasData) {
          weekHistory = [
            ...weekHistory,
            createMultiWeekSession(synced, synced.multiWeekRecords),
          ];
        }
      } else {
        const hasCurrentWeekData = synced.currentWeekRecords.some((r) => r.status !== null);
        if (hasCurrentWeekData) {
          weekHistory = [
            ...weekHistory,
            createWeekSession(synced, synced.currentWeekRecords),
          ];
        }
      }

      return {
        ...synced,
        graduated: true,
        weekHistory,
      };
    });
  }, [setState]);

  const resetApp = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    saveState(fresh);
  }, [setState]);

  const restartTraining = useCallback(() => {
    setState((prev) => {
      if (prev.habits.length === 0) return createInitialState();

      const monday = getMondayOfWeek(new Date());
      const weekStart = formatDate(monday);
      return {
        ...prev,
        graduated: false,
        setupComplete: true,
        currentHabitIndex: 0,
        cycleNumber: prev.cycleNumber + 1,
        weekStartDate: weekStart,
        currentWeekRecords: createWeekRecords(weekStart),
        multiWeekRecords: createMultiWeekRecords(
          weekStart,
          prev.habits.map((h) => h.id),
        ),
      };
    });
  }, [setState]);

  const restoreBackup = useCallback(
    (next: AppState) => {
      setState(maybeAutoAdvanceAll(migrateState(next)));
    },
    [setState],
  );

  const addHabit = useCallback(
    (habit: Habit) => {
      setState((prev) => {
        const habits = [...prev.habits, habit];
        if (!isMultiMode(prev)) {
          return { ...prev, habits };
        }
        return {
          ...prev,
          habits,
          multiWeekRecords: prev.multiWeekRecords.map((r) => ({
            ...r,
            statuses: { ...r.statuses, [habit.id]: null },
          })),
        };
      });
    },
    [setState],
  );

  const removeHabit = useCallback(
    (id: string) => {
      setState((prev) => {
        if (isMultiMode(prev)) {
          const hasRecords = prev.multiWeekRecords.some((r) => r.statuses[id] !== null);
          if (hasRecords) return prev;
          return {
            ...prev,
            habits: prev.habits.filter((h) => h.id !== id),
            multiWeekRecords: prev.multiWeekRecords.map((r) => {
              const { [id]: _, ...rest } = r.statuses;
              return { ...r, statuses: rest };
            }),
          };
        }

        const index = prev.habits.findIndex((h) => h.id === id);
        if (index === -1 || index <= prev.currentHabitIndex) return prev;
        return {
          ...prev,
          habits: prev.habits.filter((h) => h.id !== id),
        };
      });
    },
    [setState],
  );

  const updateHabit = useCallback(
    (id: string, patch: { name: string; description?: string; targetHours?: number }) => {
      const name = patch.name.trim();
      if (!name) return;
      setState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                name,
                description: patch.description?.trim() || undefined,
                targetHours: patch.targetHours,
              }
            : h,
        ),
        weekHistory: prev.weekHistory.map((session) =>
          session.habitId === id ? { ...session, habitName: name } : session,
        ),
      }));
    },
    [setState],
  );

  return {
    state,
    setupHabits,
    recordDay,
    advanceWeek,
    graduate,
    resetApp,
    restartTraining,
    restoreBackup,
    addHabit,
    removeHabit,
    updateHabit,
  };
}
