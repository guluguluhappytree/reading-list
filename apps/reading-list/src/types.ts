export interface Book {
  id: string;
  title: string;
  author: string;
  reason: string;
  order: number;
  read: boolean;
  custom: boolean;
  notes: string;
}

export interface QuizQuestion {
  id: string;
  bookId?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizResult {
  score: number;
  total: number;
  percent: number;
  level: "near" | "mid" | "far";
  levelLabel: string;
  summary: string;
  weakBooks: { id: string; title: string }[];
  rereadSuggestions: string[];
  supplementSuggestions: string[];
  completedAt: string;
}

export interface ReadingGoal {
  id: string;
  title: string;
  pathName: string;
  books: Book[];
  createdAt: string;
  updatedAt: string;
  lastQuiz?: QuizResult;
}

export interface AppState {
  goals: ReadingGoal[];
}

export const STORAGE_KEY = "reading-list-app-v1";

export function getProgress(books: Book[]): { read: number; total: number; percent: number } {
  const total = books.length;
  const read = books.filter((b) => b.read).length;
  return { read, total, percent: total === 0 ? 0 : Math.round((read / total) * 100) };
}

export function isListComplete(books: Book[]): boolean {
  return books.length > 0 && books.every((b) => b.read);
}
