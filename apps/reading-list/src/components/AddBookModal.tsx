import { useEffect, useRef, useState } from "react";
import { scrollInputIntoView, useKeyboardInset } from "../hooks/useKeyboardInset";

interface AddBookModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; author: string; reason: string }) => void;
}

export function AddBookModal({ open, onClose, onSave }: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [reason, setReason] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useKeyboardInset(open);

  useEffect(() => {
    if (open) {
      setTitle("");
      setAuthor("");
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), author: author.trim(), reason: reason.trim() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--form" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">补充书籍</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        </div>

        <div className="modal__body">
          <div className="section-title">书名</div>
          <input
            ref={titleRef}
            className="input input--modal"
            placeholder="书名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => scrollInputIntoView(titleRef.current)}
            autoComplete="off"
            style={{ marginBottom: 12 }}
          />

          <div className="section-title">作者（可选）</div>
          <input className="input input--modal" placeholder="作者" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ marginBottom: 12 }} />

          <div className="section-title">备注（可选）</div>
          <textarea className="textarea input--modal" placeholder="为什么想读这本书" value={reason} onChange={(e) => setReason(e.target.value)} style={{ marginBottom: 12 }} />
        </div>

        <div className="modal__footer">
          <button className="btn btn--primary" onClick={handleSave} disabled={!title.trim()}>添加到书单</button>
        </div>
      </div>
    </div>
  );
}
