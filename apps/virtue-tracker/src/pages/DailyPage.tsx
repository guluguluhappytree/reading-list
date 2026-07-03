import type { AppState } from "../types";
import { MultiWeekGrid } from "../components/MultiWeekGrid";
import {
  formatDate,
  getCurrentHabit,
  getDisplayDate,
  getDayLabel,
  getWeekProgress,
  isFutureDate,
  isMultiMode,
  isToday,
} from "../utils";
import { StatusBadge } from "../components/StatusBadge";

interface DailyPageProps {
  state: AppState;
  onRecord: (date: string, status: "success" | "fail" | null, habitId?: string) => void;
}

export function DailyPage({ state, onRecord }: DailyPageProps) {
  if (isMultiMode(state)) {
    return <MultiDailyPage state={state} onRecord={onRecord} />;
  }
  return <FranklinDailyPage state={state} onRecord={onRecord} />;
}

function MultiDailyPage({ state, onRecord }: DailyPageProps) {
  return (
    <div className="daily-page fade-in">
      <MultiWeekGrid state={state} onRecord={onRecord} title="每日明细" interactive compactGoals />
    </div>
  );
}

function FranklinDailyPage({ state, onRecord }: DailyPageProps) {
  const habit = getCurrentHabit(state);
  const today = formatDate(new Date());
  const { dayOfWeek, totalDays } = getWeekProgress(state);
  const todayRecord = state.currentWeekRecords.find((r) => r.date === today);

  if (!habit) return null;

  return (
    <div className="daily-page fade-in stack">
      <div className="card card--highlight" style={{ textAlign: "left" }}>
        <div style={{ marginBottom: 12 }}>
          <span className="badge badge--gold">本周专注</span>
          <span className="badge badge--cycle" style={{ marginLeft: 6 }}>
            第 {state.cycleNumber} 轮 · 第 {dayOfWeek}/{totalDays} 天
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 7vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            marginBottom: 8,
            letterSpacing: "-0.03em",
          }}
        >
          {habit.name}
        </h2>
        {habit.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", fontStyle: "italic" }}>
            {habit.description}
          </p>
        )}
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${(dayOfWeek / totalDays) * 100}%` }} />
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 8 }}>
          习惯 {state.currentHabitIndex + 1} / {state.habits.length}
          {state.habits.length > 1 && (
            <> · 下一周：{state.habits[(state.currentHabitIndex + 1) % state.habits.length].name}</>
          )}
        </p>
      </div>

      <div className="card">
        <div className="section-title">今日记录 · {getDisplayDate(today)}</div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 20 }}>
          今天，你在「{habit.name}」上做到了吗？
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className={`btn btn--success ${todayRecord?.status === "success" ? "active" : ""}`}
            style={{ flex: 1, padding: "20px 16px", fontSize: "1.125rem" }}
            onClick={() => onRecord(today, "success")}
          >
            ✓ 做到了
          </button>
          <button
            className={`btn btn--fail ${todayRecord?.status === "fail" ? "active" : ""}`}
            style={{ flex: 1, padding: "20px 16px", fontSize: "1.125rem" }}
            onClick={() => onRecord(today, "fail")}
          >
            ✗ 没做到
          </button>
        </div>
        {todayRecord?.status && (
          <p style={{ textAlign: "center", marginTop: 16, fontSize: "0.875rem", color: "var(--text-muted)" }}>
            已记录，点击可修改
          </p>
        )}
      </div>

      <div className="card">
        <div className="section-title">本周其他日期</div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {state.currentWeekRecords.map((record) => {
            const future = isFutureDate(record.date);
            const todayFlag = isToday(record.date);
            return (
              <li
                key={record.date}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: todayFlag ? "var(--highlight-bg)" : "transparent",
                  border: todayFlag ? "1px solid var(--border)" : "1px solid transparent",
                  opacity: future ? 0.45 : 1,
                }}
              >
                <span style={{ minWidth: 72, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  周{getDayLabel(record.date)}
                  {todayFlag && (
                    <span style={{ color: "var(--accent)", marginLeft: 4, fontSize: "0.75rem" }}>今</span>
                  )}
                </span>
                <span style={{ flex: 1, fontSize: "0.875rem" }}>{getDisplayDate(record.date)}</span>
                <StatusBadge status={record.status} size="sm" />
                {!future && !todayFlag && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className={`btn btn--success ${record.status === "success" ? "active" : ""}`}
                      style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
                      onClick={() => onRecord(record.date, "success")}
                      aria-label="标记做到了"
                    >
                      ✓
                    </button>
                    <button
                      className={`btn btn--fail ${record.status === "fail" ? "active" : ""}`}
                      style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
                      onClick={() => onRecord(record.date, "fail")}
                      aria-label="标记没做到"
                    >
                      ✗
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
