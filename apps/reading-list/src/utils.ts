import { FALLBACK_BOOKS, READING_PATHS, type PathBook, type ReadingPath } from "./reading-paths";
import type { Book } from "./types";

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function pathBooksToItems(books: PathBook[]): Book[] {
  return books.map((b, i) => ({
    id: createId(),
    title: b.title,
    author: b.author,
    reason: b.reason,
    order: i,
    read: false,
    custom: false,
    notes: "",
  }));
}

export interface GenerateResult {
  pathName: string;
  books: Book[];
  matched: boolean;
}

function countOccurrences(text: string, kw: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(kw, pos)) !== -1) {
    count++;
    pos += kw.length;
  }
  return count;
}

function scorePath(text: string, lower: string, path: ReadingPath): number {
  let score = 0;

  for (const kw of path.priorityKeywords ?? []) {
    if (text.includes(kw)) score += kw.length * 3;
  }

  for (const kw of path.keywords) {
    if (text.includes(kw) || lower.includes(kw.toLowerCase())) {
      const hits = Math.min(countOccurrences(text, kw), 3);
      score += kw.length * hits;
    }
  }

  if (text.includes(path.name)) score += 15;

  return score;
}

function dedupeBooks(books: PathBook[]): PathBook[] {
  const seen = new Set<string>();
  const result: PathBook[] = [];
  for (const b of books) {
    const key = b.title.replace(/\s/g, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(b);
  }
  return result;
}

function mergePaths(paths: ReadingPath[], label: string): GenerateResult {
  const merged = dedupeBooks(paths.flatMap((p) => p.books));
  return {
    pathName: label,
    books: pathBooksToItems(merged),
    matched: true,
  };
}

/** 根据目标关键词匹配权威书单，按知识路径排序；复合目标可合并多条路径 */
export function generateReadingList(goalText: string): GenerateResult {
  const text = goalText.trim();
  const lower = text.toLowerCase();

  const scored = READING_PATHS.map((path) => ({
    path,
    score: scorePath(text, lower, path),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      pathName: "通用阅读路径",
      books: pathBooksToItems(FALLBACK_BOOKS),
      matched: false,
    };
  }

  const best = scored[0];

  // 投资大师路径优先：得分达标则单独给出完整体系
  if (best.path.id === "investment-master" && best.score >= 12) {
    return {
      pathName: best.path.name,
      books: pathBooksToItems(best.path.books),
      matched: true,
    };
  }

  // 芒格思维模型路径：复合跨学科目标单独成体系
  if (best.path.id === "munger-models" && best.score >= 10) {
    return {
      pathName: best.path.name,
      books: pathBooksToItems(best.path.books),
      matched: true,
    };
  }

  // 复合目标：多条路径得分接近时合并（去重）
  const second = scored[1];
  if (second && second.score >= best.score * 0.45 && scored.length >= 2) {
    const toMerge = scored.filter((s, i) => i < 3 && s.score >= best.score * 0.45).map((s) => s.path);
    const names = toMerge.map((p) => p.name.replace(/（.*?）/, "")).join(" + ");
    return mergePaths(toMerge, `综合路径：${names}`);
  }

  return {
    pathName: best.path.name,
    books: pathBooksToItems(best.path.books),
    matched: true,
  };
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const GOAL_DISPLAY_NAMES: Record<string, string> = {
  "投资大师体系（一级/二级市场）": "投资大师养成记",
};

/** 卡片/页头展示的系列名（如「投资大师养成记」） */
export function getGoalDisplayName(pathName: string): string {
  return GOAL_DISPLAY_NAMES[pathName] ?? pathName;
}

const CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export function toChineseListNum(n: number): string {
  if (n <= 0) return String(n);
  if (n <= 10) return CN_NUM[n];
  if (n < 20) return `十${n % 10 === 0 ? "" : CN_NUM[n % 10]}`;
  return String(n);
}

export function getListNumber(goalId: string, goals: { id: string; createdAt: string }[]): number {
  const sorted = [...goals].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const idx = sorted.findIndex((g) => g.id === goalId);
  return idx >= 0 ? idx + 1 : sorted.length + 1;
}

export function getListLabel(goalId: string, goals: { id: string; createdAt: string }[]): string {
  return `阅读书单${toChineseListNum(getListNumber(goalId, goals))}`;
}
