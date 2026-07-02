import type { AppState } from "./types";
import { STORAGE_KEY } from "./types";

export const BACKUP_VERSION = 1;

export type BackupFile = {
  version: number;
  appKey: typeof STORAGE_KEY;
  exportedAt: string;
  goals: AppState["goals"];
};

export function buildBackup(state: AppState): BackupFile {
  return {
    version: BACKUP_VERSION,
    appKey: STORAGE_KEY,
    exportedAt: new Date().toISOString(),
    goals: state.goals,
  };
}

export function backupToJson(state: AppState, pretty = true): string {
  return JSON.stringify(buildBackup(state), null, pretty ? 2 : 0);
}

export function parseBackup(raw: string): AppState {
  const parsed = JSON.parse(raw) as Partial<BackupFile> & { goals?: AppState["goals"] };
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.goals)) {
    throw new Error("备份格式无效：缺少 goals 列表");
  }
  if (parsed.appKey && parsed.appKey !== STORAGE_KEY) {
    throw new Error("这不是阅读书单的备份文件");
  }
  return { goals: parsed.goals };
}

export function backupFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `阅读书单备份-${stamp}.json`;
}

export function downloadBackupJson(state: AppState): void {
  const json = backupToJson(state);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = backupFilename();
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyBackupJson(state: AppState): Promise<void> {
  const json = backupToJson(state);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(json);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = json;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function shareBackupFile(state: AppState): Promise<boolean> {
  if (!navigator.share) return false;
  const json = backupToJson(state);
  const file = new File([json], backupFilename(), { type: "application/json" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: "阅读书单备份",
      text: "阅读书单数据备份",
      files: [file],
    });
    return true;
  }
  return false;
}

export function buildReadableSummary(state: AppState): string {
  const lines = [`📚 阅读书单备份 ${new Date().toLocaleString("zh-CN")}`, ""];
  if (state.goals.length === 0) {
    lines.push("（暂无阅读目标）");
    return lines.join("\n");
  }
  for (const goal of state.goals) {
    const read = goal.books.filter((b) => b.read).length;
    lines.push(`【${goal.title}】${read}/${goal.books.length} 已读`);
    for (const book of goal.books) {
      const mark = book.read ? "✓" : "○";
      lines.push(`${mark} ${book.title}${book.author ? ` · ${book.author}` : ""}`);
      if (book.notes.trim()) lines.push(`   笔记：${book.notes.trim()}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function backupStats(state: AppState) {
  const books = state.goals.reduce((n, g) => n + g.books.length, 0);
  const read = state.goals.reduce((n, g) => n + g.books.filter((b) => b.read).length, 0);
  const notes = state.goals.reduce(
    (n, g) => n + g.books.filter((b) => b.notes.trim()).length,
    0,
  );
  return { goals: state.goals.length, books, read, notes };
}
