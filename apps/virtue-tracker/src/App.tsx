import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { DailyPage } from "./pages/DailyPage";
import { GraduatePage } from "./pages/GraduatePage";
import { HistoryPage } from "./pages/HistoryPage";
import { SetupPage } from "./pages/SetupPage";
import { WeeklyPage } from "./pages/WeeklyPage";
import { useDailyReminder } from "./lib/reminder";
import { useAppStore } from "./store";
import type { Page } from "./types";
import { countSessionStats, formatDate, getCurrentHabit, isMultiMode } from "./utils";

export default function App() {
  const {
    state,
    setupHabits,
    recordDay,
    advanceWeek,
    graduate,
    resetApp,
    restartTraining,
    restoreBackup,
    addHabit,
    removeHabit,
    updateHabit,
    applyHabitTemplate,
  } = useAppStore();
  const [page, setPage] = useState<Page>("daily");

  useDailyReminder(state);
  if (!state.setupComplete) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__eyebrow">Virtue Tracker</div>
          <h1 className="app-header__title">美德训练</h1>
          <p className="app-header__subtitle">富兰克林式 · 或多轨并行打卡</p>
        </header>
        <main className="app-main">
          <SetupPage onComplete={setupHabits} />
        </main>
      </div>
    );
  }

  if (state.graduated) {
    const totalWeeks = state.weekHistory.length;
    const totalSuccess = state.weekHistory.reduce(
      (acc, s) => acc + countSessionStats(s).success,
      0,
    );
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__eyebrow">Virtue Tracker</div>
          <h1 className="app-header__title">美德训练</h1>
        </header>
        <GraduatePage
          onRestart={restartTraining}
          totalWeeks={totalWeeks}
          totalSuccess={totalSuccess}
          weekHistory={state.weekHistory}
        />      </div>
    );
  }

  const habit = getCurrentHabit(state);
  const today = formatDate(new Date());
  const multi = isMultiMode(state);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__eyebrow">
          {multi
            ? `第 ${state.cycleNumber} 轮 · 多轨并行`
            : `第 ${state.cycleNumber} 轮 · 第 ${state.currentHabitIndex + 1} 项`}
        </div>
        <h1 className="app-header__title">
          {multi ? "每日打卡" : (habit?.name ?? "美德训练")}
        </h1>
        <p className="app-header__subtitle">
          {page === "daily" && `${today.slice(5).replace("-", "月")}日 · 今日记录`}
          {page === "weekly" && "本周成果一览"}
          {page === "history" && "所有过往记录汇总"}
        </p>
      </header>

      <main className="app-main">
        {page === "daily" && <DailyPage state={state} onRecord={recordDay} />}
        {page === "weekly" && <WeeklyPage state={state} onAdvanceWeek={advanceWeek} />}
        {page === "history" && (
          <HistoryPage
            state={state}
            onAddHabit={addHabit}
            onRemoveHabit={removeHabit}
            onUpdateHabit={updateHabit}
            onGraduate={graduate}
            onReset={resetApp}
            onRestoreBackup={restoreBackup}
            onApplyTemplate={applyHabitTemplate}
          />        )}
      </main>

      <Navigation current={page} onChange={setPage} />
    </div>
  );
}
