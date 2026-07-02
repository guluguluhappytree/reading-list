import { useState } from "react";
import { AddBookModal } from "./components/AddBookModal";
import { BackupModal } from "./components/BackupModal";
import { BookNoteModal } from "./components/BookNoteModal";
import { GoalModal } from "./components/GoalModal";
import { GoalDetailPage } from "./pages/GoalDetailPage";
import { GoalsPage } from "./pages/GoalsPage";
import { useReadingStore } from "./store";
import type { Book, ReadingGoal } from "./types";
import { getGoalDisplayName, getListLabel } from "./utils";

export default function App() {
  const {
    state,
    addGoal,
    deleteGoal,
    toggleBookRead,
    updateBookNotes,
    saveQuizResult,
    markBooksForReread,
    addBook,
    removeBook,
    regenerateList,
    replaceState,
  } = useReadingStore();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [noteBook, setNoteBook] = useState<Book | null>(null);

  const selectedGoal = state.goals.find((g) => g.id === selectedGoalId) ?? null;

  const openGoal = (goal: ReadingGoal) => setSelectedGoalId(goal.id);
  const backToList = () => setSelectedGoalId(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        {selectedGoal && (
          <button className="app-header__back" onClick={backToList} aria-label="返回">←</button>
        )}
        <div className="app-header__text">
          <h1 className="app-header__title">
            {selectedGoal
              ? getListLabel(selectedGoal.id, state.goals)
              : "阅读书单"}
          </h1>
          <p className={`app-header__subtitle ${selectedGoal ? "app-header__subtitle--desc" : ""}`}>
            {selectedGoal
              ? `${getGoalDisplayName(selectedGoal.pathName)} · ${selectedGoal.title}`
              : `${state.goals.length} 个阅读目标`}
          </p>
        </div>
        {!selectedGoal && (
          <button
            type="button"
            className="backup-btn"
            onClick={() => setBackupModalOpen(true)}
            aria-label="导出备份"
            title="导出 / 导入备份"
          >
            ⬇
          </button>
        )}
      </header>

      <main className="app-main">
        {selectedGoal ? (
          <GoalDetailPage
            goal={selectedGoal}
            allGoals={state.goals}
            onToggleBook={(bookId) => toggleBookRead(selectedGoal.id, bookId)}
            onOpenNotes={(book) => setNoteBook(book)}
            onAddBook={() => setAddBookModalOpen(true)}
            onRemoveBook={(bookId) => removeBook(selectedGoal.id, bookId)}
            onRegenerate={() => {
              if (confirm("根据目标重新生成权威书单？已读标记与笔记会尽量保留。")) {
                regenerateList(selectedGoal.id);
              }
            }}
            onSaveQuiz={(result) => saveQuizResult(selectedGoal.id, result)}
            onReread={(bookIds) => markBooksForReread(selectedGoal.id, bookIds)}
            onDeleteGoal={() => {
              if (confirm(`确定删除「${getListLabel(selectedGoal.id, state.goals)}」及其书单？`)) {
                deleteGoal(selectedGoal.id);
                setSelectedGoalId(null);
              }
            }}
          />
        ) : (
          <GoalsPage goals={state.goals} onGoalClick={openGoal} />
        )}
      </main>

      {!selectedGoal && (
        <button className="fab" onClick={() => setGoalModalOpen(true)} aria-label="新建目标">+</button>
      )}

      <GoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={(title) => {
          const goal = addGoal(title);
          setSelectedGoalId(goal.id);
        }}
      />

      <BackupModal
        open={backupModalOpen}
        state={state}
        onClose={() => setBackupModalOpen(false)}
        onImport={replaceState}
      />

      {selectedGoal && (
        <>
          <AddBookModal
            open={addBookModalOpen}
            onClose={() => setAddBookModalOpen(false)}
            onSave={(data) => addBook(selectedGoal.id, data)}
          />
          <BookNoteModal
            open={!!noteBook}
            book={noteBook}
            onClose={() => setNoteBook(null)}
            onSave={(notes) => {
              if (noteBook) updateBookNotes(selectedGoal.id, noteBook.id, notes);
            }}
          />
        </>
      )}
    </div>
  );
}
