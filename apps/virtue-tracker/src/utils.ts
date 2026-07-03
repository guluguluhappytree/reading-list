import type { AppState, DayRecord, DayStatus, MultiDayRecord, WeekSession } from "./types";
import { createId } from "./lib/id";

export function isMultiMode(state: AppState): boolean {
  return state.trackingMode === "multi";
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getSundayOfWeek(monday: Date): Date {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

export function getWeekDates(weekStart: string): string[] {
  const monday = parseDate(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return formatDate(d);
  });
}

export function getDayLabel(dateStr: string): string {
  const labels = ["日", "一", "二", "三", "四", "五", "六"];
  return labels[parseDate(dateStr).getDay()];
}

export function getDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export function isFutureDate(dateStr: string): boolean {
  return parseDate(dateStr) > parseDate(formatDate(new Date()));
}

export function countStatus(records: DayRecord[]): { success: number; fail: number; pending: number } {
  let success = 0;
  let fail = 0;
  let pending = 0;
  for (const r of records) {
    if (r.status === "success") success++;
    else if (r.status === "fail") fail++;
    else pending++;
  }
  return { success, fail, pending };
}

export function weekSuccessRate(records: DayRecord[]): number {
  const { success, fail } = countStatus(records);
  const total = success + fail;
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
}

export function createWeekRecords(weekStart: string): DayRecord[] {
  return getWeekDates(weekStart).map((date) => ({ date, status: null }));
}

export function createMultiWeekRecords(weekStart: string, habitIds: string[]): MultiDayRecord[] {
  return getWeekDates(weekStart).map((date) => ({
    date,
    statuses: Object.fromEntries(habitIds.map((id) => [id, null])),
  }));
}

export function createWeekSession(state: AppState, records: DayRecord[]): WeekSession {
  const habit = state.habits[state.currentHabitIndex];
  const weekDates = getWeekDates(state.weekStartDate);
  return {
    id: createId(),
    habitId: habit.id,
    habitName: habit.name,
    cycleNumber: state.cycleNumber,
    weekIndex: state.currentHabitIndex,
    startDate: weekDates[0],
    endDate: weekDates[6],
    records: [...records],
    trackingMode: "franklin",
  };
}

export function createMultiWeekSession(state: AppState, records: MultiDayRecord[]): WeekSession {
  const weekDates = getWeekDates(state.weekStartDate);
  return {
    id: createId(),
    habitId: "multi",
    habitName: "每日目标",
    cycleNumber: state.cycleNumber,
    weekIndex: 0,
    startDate: weekDates[0],
    endDate: weekDates[6],
    records: [],
    trackingMode: "multi",
    multiRecords: records.map((r) => ({ date: r.date, statuses: { ...r.statuses } })),
    multiHabitLabels: state.habits.map((h) => ({
      id: h.id,
      name: h.name,
      targetHours: h.targetHours,
    })),
  };
}

export function getMultiDayRecord(state: AppState, date: string): MultiDayRecord | undefined {
  return state.multiWeekRecords.find((r) => r.date === date);
}

export function getMultiStatus(state: AppState, date: string, habitId: string): DayStatus {
  return getMultiDayRecord(state, date)?.statuses[habitId] ?? null;
}

export function countMultiDayProgress(state: AppState, date: string) {
  const record = getMultiDayRecord(state, date);
  if (!record) return { done: 0, total: state.habits.length };
  let done = 0;
  for (const habit of state.habits) {
    if (record.statuses[habit.id] !== null && record.statuses[habit.id] !== undefined) done++;
  }
  return { done, total: state.habits.length };
}

export function countMultiWeekStats(state: AppState) {
  let success = 0;
  let fail = 0;
  let pending = 0;
  for (const day of state.multiWeekRecords) {
    for (const habit of state.habits) {
      const status = day.statuses[habit.id];
      if (status === "success") success++;
      else if (status === "fail") fail++;
      else pending++;
    }
  }
  return { success, fail, pending };
}

export function multiWeekSuccessRate(state: AppState): number {
  const { success, fail } = countMultiWeekStats(state);
  const total = success + fail;
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
}

export function countSessionStats(session: WeekSession): { success: number; fail: number; pending: number } {
  if (session.trackingMode === "multi" && session.multiRecords) {
    let success = 0;
    let fail = 0;
    let pending = 0;
    for (const day of session.multiRecords) {
      for (const s of Object.values(day.statuses)) {
        if (s === "success") success++;
        else if (s === "fail") fail++;
        else pending++;
      }
    }
    return { success, fail, pending };
  }
  return countStatus(session.records);
}

export function getCurrentHabit(state: AppState) {
  return state.habits[state.currentHabitIndex] ?? null;
}

export function getWeekProgress(state: AppState) {
  const today = formatDate(new Date());
  const weekDates = getWeekDates(state.weekStartDate);
  const todayIndex = weekDates.indexOf(today);
  const dayOfWeek = todayIndex >= 0 ? todayIndex + 1 : 1;
  return { dayOfWeek, totalDays: 7, weekDates };
}

export function shouldAutoAdvanceWeek(state: AppState): boolean {
  const weekDates = getWeekDates(state.weekStartDate);
  const lastDay = weekDates[6];
  const today = formatDate(new Date());
  return parseDate(today) > parseDate(lastDay);
}
