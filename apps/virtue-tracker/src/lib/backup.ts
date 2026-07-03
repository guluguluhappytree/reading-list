import type { AppState } from "../types";

export type VirtueBackup = {
  version: 1;
  exportedAt: string;
  source: "virtue-tracker";
  state: AppState;
};

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const s = value as AppState;
  return Array.isArray(s.habits) && Array.isArray(s.weekHistory) && Array.isArray(s.currentWeekRecords);
}

export function exportBackup(state: AppState): VirtueBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: "virtue-tracker",
    state,
  };
}

export function downloadBackup(state: AppState) {
  const backup = exportBackup(state);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `virtue-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackupFile(text: string): AppState {
  const json = JSON.parse(text) as unknown;
  if (json && typeof json === "object" && "state" in json) {
    const state = (json as VirtueBackup).state;
    if (isAppState(state)) return state;
  }
  if (isAppState(json)) return json;
  throw new Error("无法识别的备份文件");
}
