import { useEffect, useRef, useState } from "react";
import type { Book } from "../types";
import { scrollInputIntoView, useKeyboardInset } from "../hooks/useKeyboardInset";

interface BookNoteModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSave: (notes: string) => void;
}

export function BookNoteModal({ open, book, onClose, onSave }: BookNoteModalProps) {
  const [notes, setNotes] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useKeyboardInset(open);

  useEffect(() => {
    if (open && book) setNotes(book.notes ?? "");
  }, [open, book]);

  if (!open || !book) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--form" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">阅读笔记</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        </div>

        <div className="modal__sticky-top">
          <div className="book-note-head">
            <div className="book-note-head__title">{book.title}</div>
            {book.author && <div className="book-note-head__author">{book.author}</div>}
          </div>
        </div>

        <div className="modal__body">
          <div className="section-title">笔记与想法</div>
          <textarea
            ref={textareaRef}
            className="textarea input--modal"
            placeholder="摘录、感悟、可行动的点……（结业测验会参考你的笔记）"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={() => scrollInputIntoView(textareaRef.current)}
            style={{ minHeight: 160 }}
          />
        </div>

        <div className="modal__footer">
          <button
            className="btn btn--primary"
            onClick={() => {
              onSave(notes);
              onClose();
            }}
          >
            保存笔记
          </button>
        </div>
      </div>
    </div>
  );
}
