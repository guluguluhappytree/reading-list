import type { Note } from "../types";
import { NoteCard } from "../components/NoteCard";
import { formatDisplayDate, todayStr } from "../utils";

export function CapturePage({
  notes,
  onNoteClick,
}: {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}) {
  const today = todayStr();
  const todayNotes = notes.filter((n) => n.date === today);

  return (
    <div className="fade-in">
      <div className="tip-box">
        写下阅读摘录、灵感或思考，App 会自动归类并提取标签
      </div>

      <div className="section-title">
        今日笔记 · {formatDisplayDate(today)} · {todayNotes.length} 条
      </div>

      {todayNotes.length === 0 ? (
        <div className="empty">今天还没有记录，点右下角 ＋ 开始</div>
      ) : (
        todayNotes.map((n) => <NoteCard key={n.id} note={n} onClick={() => onNoteClick(n)} />)
      )}

      {notes.filter((n) => n.date !== today).length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 16 }}>更早的记录</div>
          {notes
            .filter((n) => n.date !== today)
            .slice(0, 5)
            .map((n) => (
              <NoteCard key={n.id} note={n} onClick={() => onNoteClick(n)} />
            ))}
        </>
      )}
    </div>
  );
}
