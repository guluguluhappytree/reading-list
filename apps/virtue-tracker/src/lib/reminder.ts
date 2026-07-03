import { useEffect, useState } from "react";
import type { AppState } from "../types";
import { formatDate } from "../utils";

export const REMINDER_STORAGE_KEY = "virtue-tracker-reminder-v1";

export type ReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

const LAST_SENT_KEY = "virtue-tracker-reminder-last-sent";

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return { enabled: false, hour: 21, minute: 0 };
    return JSON.parse(raw) as ReminderSettings;
  } catch {
    return { enabled: false, hour: 21, minute: 0 };
  }
}

export function saveReminderSettings(settings: ReminderSettings) {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("virtue-reminder-change", { detail: settings }));
}

export function isReminderEnabled(settings = loadReminderSettings()): boolean {
  return settings.enabled === true;
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function todayNeedsReminder(state: AppState): boolean {
  if (!state.setupComplete || state.graduated) return false;
  const today = formatDate(new Date());

  if (state.trackingMode === "multi") {
    const record = state.multiWeekRecords.find((r) => r.date === today);
    if (!record) return true;
    return state.habits.some((h) => record.statuses[h.id] === null || record.statuses[h.id] === undefined);
  }

  const record = state.currentWeekRecords.find((r) => r.date === today);
  return !record || record.status === null;
}

function alreadySentToday(): boolean {
  return localStorage.getItem(LAST_SENT_KEY) === formatDate(new Date());
}

function markSentToday() {
  localStorage.setItem(LAST_SENT_KEY, formatDate(new Date()));
}

export function maybeSendDailyReminder(state: AppState, settings = loadReminderSettings()) {
  if (!settings.enabled || !todayNeedsReminder(state)) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (alreadySentToday()) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = settings.hour * 60 + settings.minute;
  if (currentMinutes < targetMinutes) return;

  const habit = state.habits[state.currentHabitIndex];
  const body =
    state.trackingMode === "multi"
      ? "今日还有目标未打卡，记得完成四项记录"
      : habit
        ? `今日「${habit.name}」还没记录，记得打卡`
        : "今日还没记录，记得打卡";
  new Notification("美德训练", {
    body,
    tag: "virtue-daily-reminder",
  });
  markSentToday();
}

/** 仅当用户主动开启提醒时，才每分钟检查是否该发通知 */
export function useDailyReminder(state: AppState) {
  const [settings, setSettings] = useState<ReminderSettings>(() => loadReminderSettings());

  useEffect(() => {
    const onChange = () => setSettings(loadReminderSettings());
    window.addEventListener("virtue-reminder-change", onChange);
    return () => window.removeEventListener("virtue-reminder-change", onChange);
  }, []);

  useEffect(() => {
    if (!settings.enabled || !state.setupComplete || state.graduated) return;

    const tick = () => {
      const current = loadReminderSettings();
      if (current.enabled) maybeSendDailyReminder(state, current);
    };

    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, [state, settings.enabled, settings.hour, settings.minute]);
}
