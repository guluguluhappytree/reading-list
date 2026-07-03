import type { Note, NoteCategory } from "../types";
import { getCategory } from "../types";
import { formatTime } from "../utils";

export function NoteCard({
  note,
  onClick,
  highlight,
}: {
  note: Note;
  onClick?: () => void;
  highlight?: string;
}) {
  const cat = getCategory(note.category);
  let preview = note.content;
  if (highlight) {
    const idx = preview.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx >= 0) preview = "…" + preview.slice(Math.max(0, idx - 10), idx + 40) + "…";
  }

  return (
    <article className="card note-card" onClick={onClick}>
      <div className="note-card__title">{note.title}</div>
      <div className="note-card__preview">{preview}</div>
      <div className="note-card__meta">
        <span className="cat-badge" style={{ background: `${cat.color}15`, color: cat.color }}>
          {cat.icon} {cat.label}
        </span>
        {note.tags.map((t) => (
          <span key={t} className="tag">#{t}</span>
        ))}
        <span>{formatTime(note.createdAt)}</span>
      </div>
    </article>
  );
}

export function CategoryBadge({ category }: { category: NoteCategory }) {
  const cat = getCategory(category);
  return (
    <span className="cat-badge" style={{ background: `${cat.color}15`, color: cat.color }}>
      {cat.icon} {cat.label}
    </span>
  );
}
