import { useMemo, useState } from "react";
import type { Note } from "../types";
import { NoteCard } from "../components/NoteCard";
import { searchNotes } from "../utils";

export function SearchPage({
  notes,
  onNoteClick,
}: {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchNotes(notes, query), [notes, query]);

  const hotTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of notes) for (const t of n.tags) map.set(t, (map.get(t) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [notes]);

  return (
    <div className="fade-in">
      <div className="search-box">
        <span style={{ color: "var(--text-muted)" }}>⌕</span>
        <input
          type="search"
          placeholder="搜索笔记、观点、标签……"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!query && hotTags.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="section-title">快速搜索</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {hotTags.map(([tag]) => (
              <button key={tag} className="tag" style={{ cursor: "pointer" }} onClick={() => setQuery(tag)}>
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="section-title">
        {query ? `找到 ${results.length} 条` : `全部 ${notes.length} 条`}
      </div>

      {results.length === 0 ? (
        <div className="empty">{query ? "没有匹配的结果" : "还没有任何笔记"}</div>
      ) : (
        results.map((n) => (
          <NoteCard key={n.id} note={n} onClick={() => onNoteClick(n)} highlight={query || undefined} />
        ))
      )}
    </div>
  );
}
