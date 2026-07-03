export type NoteCategory = "reading" | "inspiration" | "reflection" | "learning" | "work" | "life";

export type Page = "capture" | "library" | "write" | "search";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface DailyArticle {
  id: string;
  date: string;
  title: string;
  content: string;
  sourceNoteIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  notes: Note[];
  articles: DailyArticle[];
}

export const STORAGE_KEY = "notes-app-v1";

export const CATEGORIES: { id: NoteCategory; label: string; icon: string; color: string }[] = [
  { id: "reading", label: "阅读", icon: "📖", color: "#2383e2" },
  { id: "inspiration", label: "灵感", icon: "💡", color: "#d9730d" },
  { id: "reflection", label: "思考", icon: "🧠", color: "#6B4FBB" },
  { id: "learning", label: "学习", icon: "📚", color: "#0f7b6c" },
  { id: "work", label: "工作", icon: "💼", color: "#37352f" },
  { id: "life", label: "生活", icon: "🌿", color: "#5a9a6e" },
];

export function getCategory(id: NoteCategory) {
  return CATEGORIES.find((c) => c.id === id)!;
}

export const WRITING_PROMPTS = [
  { id: "summary", label: "三句话总结", hint: "用三句话提炼今日最核心的观点" },
  { id: "connect", label: "串联成文", hint: "把零散灵感连成一段完整文字" },
  { id: "argue", label: "论证观点", hint: "选一个问题，给出论据和结论" },
  { id: "story", label: "叙事表达", hint: "用讲故事的方式 recount 今日所思" },
];
