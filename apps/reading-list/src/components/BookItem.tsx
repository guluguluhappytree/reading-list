import type { Book } from "../types";

export function BookItem({
  book,
  index,
  onToggle,
  onOpenNotes,
  onRemove,
}: {
  book: Book;
  index: number;
  onToggle: () => void;
  onOpenNotes: () => void;
  onRemove?: () => void;
}) {
  const hasNotes = book.notes.trim().length > 0;

  return (
    <div className={`book-item ${book.read ? "book-item--read" : ""}`}>
      <button
        type="button"
        className="book-item__check"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={book.read ? "标记未读" : "标记已读"}
      >
        {book.read ? "✓" : index + 1}
      </button>
      <button
        type="button"
        className="book-item__body book-item__body--btn"
        onClick={onOpenNotes}
      >
        <div className="book-item__title">
          {book.title}
          {book.custom && <span className="book-item__badge">补充</span>}
          {hasNotes && <span className="book-item__badge book-item__badge--note">有笔记</span>}
        </div>
        {book.author && <div className="book-item__author">{book.author}</div>}
        <div className="book-item__reason">{book.reason}</div>
        {hasNotes && (
          <div className="book-item__notes-preview">
            {book.notes.trim().length > 48 ? `${book.notes.trim().slice(0, 48)}…` : book.notes.trim()}
          </div>
        )}
        <div className="book-item__tap-hint">点击写笔记 / 想法</div>
      </button>
      {onRemove && (
        <button
          type="button"
          className="book-item__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="删除"
        >
          ×
        </button>
      )}
    </div>
  );
}
