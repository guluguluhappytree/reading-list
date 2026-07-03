import { useMemo, useState } from "react";
import type { Note, NoteCategory } from "../types";
import { CATEGORIES } from "../types";
import { NoteCard } from "../components/NoteCard";

export function LibraryPage({
  notes,
  onNoteClick,
}: {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}) {
  const [filter, setFilter] = useState<NoteCategory | "all">("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: notes.length };
    for (const c of CATEGORIES) map[c.id] = notes.filter((n) => n.category === c.id).length;
    return map;
  }, [notes]);

  const filtered = filter === "all" ? notes : notes.filter((n) => n.category === filter);

  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of notes) for (const t of n.tags) map.set(t, (map.get(t) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [notes]);

  return (
    <div className="fade-in">
      <div className="category-grid">
        <button
          className="category-card"
          style={filter === "all" ? { borderColor: "var(--accent)", background: "var(--accent-light)" } : undefined}
          onClick={() => setFilter("all")}
        >
          <div className="category-card__icon">📋</div>
          <div className="category-card__label">全部</div>
          <div className="category-card__count">{counts.all} 条</div>
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="category-card"
            style={filter === c.id ? { borderColor: c.color, background: `${c.color}12` } : undefined}
            onClick={() => setFilter(c.id)}
          >
            <div className="category-card__icon">{c.icon}</div>
            <div className="category-card__label">{c.label}</div>
            <div className="category-card__count">{counts[c.id]} 条</div>
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="card">
          <div className="section-title">热门标签</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTags.map(([tag, count]) => (
              <span key={tag} className="tag">#{tag} ({count})</span>
            ))}
          </div>
        </div>
      )}

      <div className="section-title">
        {filter === "all" ? "全部笔记" : CATEGORIES.find((c) => c.id === filter)?.label} · {filtered.length} 条
      </div>

      {filtered.length === 0 ? (
        <div className="empty">该分类下暂无笔记</div>
      ) : (
        filtered.map((n) => <NoteCard key={n.id} note={n} onClick={() => onNoteClick(n)} />)
      )}
    </div>
  );
}
