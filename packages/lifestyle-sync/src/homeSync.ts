import { API_PREFIX } from "shared";

const DEFAULT_HOME_API = "https://192.168.1.4:4000";
const HOME_CHECK_MS = 2500;

export function getHomeApiBaseUrl(): string {
  const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
  const fromEnv = env?.VITE_HOME_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  // 浏览器内始终走 App 同源 /api 代理，避免直连 4000 端口证书问题
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return DEFAULT_HOME_API;
}

export function homeApiUrl(path: string): string {
  const base = `${getHomeApiBaseUrl()}${API_PREFIX}${path}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}_t=${Date.now()}`;
}

let homeReachableCache: { at: number; ok: boolean } | null = null;

/** 检测家里同步服务器是否在线（仅在家 Wi‑Fi 时为 true） */
export async function isHomeServerReachable(force = false): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    homeReachableCache = { at: Date.now(), ok: false };
    return false;
  }

  const now = Date.now();
  if (!force && homeReachableCache && now - homeReachableCache.at < 8000) {
    return homeReachableCache.ok;
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), HOME_CHECK_MS);
    const res = await fetch(homeApiUrl("/health"), {
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    const ok = res.ok;
    homeReachableCache = { at: now, ok };
    return ok;
  } catch {
    homeReachableCache = { at: now, ok: false };
    return false;
  }
}

export function clearHomeReachableCache() {
  homeReachableCache = null;
}

const PENDING_KEY = "lifestyle-pending-sync-keys";

export function markPendingSync(appKey: string) {
  try {
    const set = new Set(readPendingSyncKeys());
    set.add(appKey);
    localStorage.setItem(PENDING_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export function clearPendingSync(appKey: string) {
  try {
    const set = new Set(readPendingSyncKeys());
    set.delete(appKey);
    localStorage.setItem(PENDING_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export function readPendingSyncKeys(): string[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === "string") : [];
  } catch {
    return [];
  }
}
