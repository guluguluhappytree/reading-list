import { useEffect, useRef, useState } from "react";
import type { Book } from "../types";
import { scrollInputIntoView, useKeyboardInset } from "../hooks/useKeyboardInset";
import { generateReadingList } from "../utils";

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
}

export function GoalModal({ open, onClose, onSave }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState<{ pathName: string; books: Book[]; matched: boolean } | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardInset(open);

  useEffect(() => {
    if (open) {
      setTitle("");
      setPreview(null);
      setInputFocused(false);
    }
  }, [open]);

  useEffect(() => {
    if (title.trim().length >= 2) {
      setPreview(generateReadingList(title));
    } else {
      setPreview(null);
    }
  }, [title]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--form" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">新建阅读目标</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        </div>

        <div className="modal__sticky-top">
          <div className="section-title">阅读目标</div>
          <input
            ref={inputRef}
            className="input input--modal"
            placeholder="例如：查理芒格思维模型、心理学入门……"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => {
              setInputFocused(true);
              scrollInputIntoView(inputRef.current);
            }}
            onBlur={() => setInputFocused(false)}
            autoComplete="off"
            enterKeyHint="done"
          />
        </div>

        <div className="modal__body">
          {!inputFocused && (
            <div className="tip-box">
              输入阅读目标，系统将匹配权威书单并按知识路径排序
            </div>
          )}

          {preview && (
            <>
              <div className="section-title">
                推荐路径：{preview.pathName}
                {!preview.matched && "（未精确匹配，已提供通用路径）"}
              </div>
              <div className="preview-list">
                {preview.books.map((b, i) => (
                  <div key={b.id} className="preview-item">
                    <div className="preview-item__title">{i + 1}. {b.title}</div>
                    <div className="preview-item__meta">{b.author} · {b.reason}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--primary" onClick={handleSave} disabled={!title.trim()}>
            创建书单
          </button>
        </div>
      </div>
    </div>
  );
}
