import type { ApiEnvelope, AuthUser, UserDataSnapshot } from "shared";
import { homeApiUrl } from "./homeSync.js";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Accept", "application/json");

  const url = homeApiUrl(path);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("当前无网络，日记仍安全保存在本机");
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error(
      `无法连接家里同步服务器。请确认已连上家里 Wi‑Fi，且电脑已运行 npm run dev:lifestyle（或 npm run dev:api）。`,
    );
  }

  const raw = await res.text();
  let json: ApiEnvelope<T>;
  try {
    json = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    const hint = raw.trim().slice(0, 80);
    const isHtml = hint.startsWith("<");
    throw new Error(
      isHtml
        ? `云同步请求被拦截（${res.status}）。请确认用 https:// 打开本 App（不是 http），Safari 下拉刷新后再试`
        : `云同步服务响应异常（${res.status}）${hint ? `：${hint}` : ""}`,
    );
  }

  if (!json.success) {
    throw new Error(json.error.message);
  }
  return json.data;
}

export async function registerUser(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchUserData(
  appKey: string,
  token: string,
): Promise<UserDataSnapshot | null> {
  return request(`/user-data/${encodeURIComponent(appKey)}`, { token });
}

export async function pushUserData(
  appKey: string,
  payload: unknown,
  token: string,
): Promise<UserDataSnapshot> {
  return request(`/user-data/${encodeURIComponent(appKey)}`, {
    method: "PUT",
    token,
    body: JSON.stringify({ payload }),
  });
}
