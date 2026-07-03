import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { NoteModal } from "./components/NoteModal";
import { CapturePage } from "./pages/CapturePage";
import { LibraryPage } from "./pages/LibraryPage";
import { SearchPage } from "./pages/SearchPage";
import { WritePage } from "./pages/WritePage";
import { useNotesStore } from "./store";
import type { Note, Page } from "./types";
import { formatDisplayDate, todayStr } from "./utils";

export default function App() {
  const { state, addNote, updateNote, deleteNote, saveArticle } = useNotesStore();
  const [page, setPage] = useState<Page>("capture");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const subtitles: Record<Page, string> = {
    capture: formatDisplayDate(todayStr()),
    library: "自动归类 · 标签索引",
    write: "每日成文 · 表达训练",
    search: "关键词检索观点",
  };

  const todayArticle = state.articles.find((a) => a.date === todayStr());

  const openNew = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleSaveNote = (data: { title: string; content: string; category: Note["category"]; tags: string[] }) => {
    if (editingNote) {
      updateNote(editingNote.id, data);
    } else {
      addNote({ ...data, title: data.title });
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-header__title">灵感笔记</h1>
        <p className="app-header__subtitle">{subtitles[page]}</p>
      </header>

      <main className="app-main">
        {page === "capture" && <CapturePage notes={state.notes} onNoteClick={openEdit} />}
        {page === "library" && <LibraryPage notes={state.notes} onNoteClick={openEdit} />}
        {page === "write" && (
          <WritePage
            notes={state.notes}
            existingArticle={todayArticle}
            onSave={(title, content, sourceIds) =>
              saveArticle({ date: todayStr(), title, content, sourceNoteIds: sourceIds })
            }
          />
        )}
        {page === "search" && <SearchPage notes={state.notes} onNoteClick={openEdit} />}
      </main>

      <button className="fab" onClick={openNew} aria-label="记录">+</button>
      <Navigation current={page} onChange={setPage} />

      <NoteModal
        open={modalOpen}
        note={editingNote}
        date={editingNote?.date ?? todayStr()}
        onClose={() => { setModalOpen(false); setEditingNote(null); }}
        onSave={handleSaveNote}
        onDelete={editingNote ? () => { deleteNote(editingNote.id); setModalOpen(false); setEditingNote(null); } : undefined}
      />
    </div>
  );
}
