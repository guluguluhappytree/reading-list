import type { ReadingGoal } from "../types";
import { getProgress, isListComplete } from "../types";
import { BookItem } from "../components/BookItem";
import { ProgressBar } from "../components/ProgressBar";
import { QuizPanel } from "../components/QuizPanel";
import { getGoalDisplayName, getListLabel } from "../utils";

export function GoalDetailPage({
  goal,
  allGoals,
  onToggleBook,
  onOpenNotes,
  onAddBook,
  onRemoveBook,
  onDeleteGoal,
  onRegenerate,
  onSaveQuiz,
  onReread,
}: {
  goal: ReadingGoal;
  allGoals: ReadingGoal[];
  onToggleBook: (bookId: string) => void;
  onOpenNotes: (book: ReadingGoal["books"][0]) => void;
  onAddBook: () => void;
  onRemoveBook: (bookId: string) => void;
  onDeleteGoal: () => void;
  onRegenerate: () => void;
  onSaveQuiz: (result: NonNullable<ReadingGoal["lastQuiz"]>) => void;
  onReread: (bookIds: string[]) => void;
}) {
  const progress = getProgress(goal.books);
  const complete = isListComplete(goal.books);

  return (
    <div className="fade-in">
      <div className="detail-progress">
        <div className="detail-progress__title">{getListLabel(goal.id, allGoals)} · 阅读进度</div>
        <ProgressBar {...progress} />
      </div>

      {complete && (
        <QuizPanel goal={goal} onSubmit={onSaveQuiz} onReread={onReread} />
      )}

      <div className="section-title">书单 · {getGoalDisplayName(goal.pathName)} · 按学习路径排序</div>
      <div className="card" style={{ padding: "4px 16px" }}>
        {goal.books.map((book, i) => (
          <BookItem
            key={book.id}
            book={book}
            index={i}
            onToggle={() => onToggleBook(book.id)}
            onOpenNotes={() => onOpenNotes(book)}
            onRemove={book.custom ? () => onRemoveBook(book.id) : undefined}
          />
        ))}
      </div>

      <button className="add-book-btn" onClick={onAddBook}>＋ 补充书籍</button>

      <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={onRegenerate}>
        更新书单（重新匹配权威书目）
      </button>

      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
        左侧圆圈标记已读 · 点击书名写笔记 · 补充书右侧可删除
      </p>

      <button className="btn btn--ghost" style={{ marginTop: 16, color: "#d44c47" }} onClick={onDeleteGoal}>
        删除此目标
      </button>
    </div>
  );
}
