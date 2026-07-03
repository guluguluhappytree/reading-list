import { useEffect, useState } from "react";
import type { Note, NoteCategory } from "../types";
import { CATEGORIES } from "../types";
import { CategoryBadge } from "./NoteCard";
import { classifyContent, extractTags, formatDisplayDate, suggestTitle } from "../utils";

interface NoteModalProps {
  open: boolean;
  note?: Note | null;
  date?: string;
  onClose: () => void;
  onSave: (data: { title: string; content: string; category: NoteCategory; tags: string[] }) => void;
  onDelete?: () => void;
}

export function NoteModal({ open, note, date, onClose, onSave, onDelete }: NoteModalProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NoteCategory>("reflection");
  const [tags, setTags] = useState<string[]>([]);
  const [manualCategory, setManualCategory] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(note?.content ?? "");
      setTitle(note?.title ?? "");
      setCategory(note?.category ?? "reflection");
      setTags(note?.tags ?? []);
      setManualCategory(!!note);
    }
  }, [open, note]);

  useEffect(() => {
    if (!manualCategory && content.trim()) {
      setCategory(classifyContent(content));
      setTags(extractTags(content));
      if (!title) setTitle(suggestTitle(content));
    }
  }, [content, manualCategory, title]);

  if (!open) return null;

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      title: title.trim() || suggestTitle(content),
      content: content.trim(),
      category,
      tags,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{note ? "编辑笔记" : "记录灵感"}</span>
          <button className="btn btn--ghost" style={{ width: "auto", padding: "6px 12px" }} onClick={onClose}>取消</button>
        </div>

        {date && (
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {formatDisplayDate(date)}
          </p>
        )}

        {!manualCategory && content.trim() && (
          <div className="tip-box" style={{ marginBottom: 12 }}>
            已自动归类为 <CategoryBadge category={category} />
            {tags.length > 0 && <> · 标签 {tags.map((t) => `#${t}`).join(" ")}</>}
          </div>
        )}

        <div className="section-title">内容</div>
        <textarea
          className="textarea"
          placeholder="阅读摘录、灵感闪念、今日思考……"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
          style={{ minHeight: 140, marginBottom: 12 }}
        />

        <div className="section-title">标题（可选）</div>
        <input className="input" placeholder="自动生成" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 12 }} />

        <div className="section-title">分类</div>
        <div className="picker-row">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip ${category === c.id ? "selected" : ""}`}
              onClick={() => { setCategory(c.id); setManualCategory(true); }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <button className="btn btn--primary" onClick={handleSave} disabled={!content.trim()}>保存</button>
        {note && onDelete && (
          <button className="btn btn--ghost" style={{ marginTop: 8, color: "var(--danger, #d44c47)" }} onClick={onDelete}>
            删除
          </button>
        )}
      </div>
    </div>
  );
}
