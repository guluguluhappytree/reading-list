import { useState } from "react";
import type { AppState } from "../types";
import { MultiWeekGrid } from "../components/MultiWeekGrid";
import { StatusBadge } from "../components/StatusBadge";
import {
  countMultiWeekStats,
  countStatus,
  formatDate,
  getCurrentHabit,
  getDayLabel,
  getDisplayDate,
  getWeekProgress,
  isFutureDate,
  isMultiMode,
  isToday,
  multiWeekSuccessRate,
  parseDate,
  weekSuccessRate,
} from "../utils";

interface WeeklyPageProps {
  state: AppState;
  onAdvanceWeek: () => void;
}

export function WeeklyPage({ state, onAdvanceWeek }: WeeklyPageProps) {
  if (isMultiMode(state)) {
    return <MultiWeeklyPage state={state} onAdvanceWeek={onAdvanceWeek} />;
  }
  return <FranklinWeeklyPage state={state} onAdvanceWeek={onAdvanceWeek} />;
}

function MultiWeeklyPage({ state, onAdvanceWeek }: WeeklyPageProps) {
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);
  const { weekDates } = getWeekProgress(state);
  const stats = countMultiWeekStats(state);
  const rate = multiWeekSuccessRate(state);
  const recorded = stats.success + stats.fail;

  const today = formatDate(new Date());
  const weekEndDate = weekDates[6];
  const weekHasEnded = parseDate(today) > parseDate(weekEndDate);

  const allPastDaysRecorded = weekDates
    .filter((d) => !isFutureDate(d))
    .every((d) => {
      const day = state.multiWeekRecords.find((r) => r.date === d);
      if (!day) return false;
      return state.habits.every(
        (h) => day.statuses[h.id] !== null && day.statuses[h.id] !== undefined,
      );
    });

  const canAdvance = weekHasEnded || allPastDaysRecorded;

  return (
    <div className="weekly-page fade-in stack">
      <div className="card card--highlight">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>本周成果</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700 }}>
              每日 {state.habits.length} 项目标
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: rate >= 70 ? "var(--success)" : rate >= 40 ? "var(--text-primary)" : "var(--fail)",
                lineHeight: 1,
              }}
            >
              {recorded > 0 ? `${rate}%` : "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>完成率</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
          <Stat label="做到了" value={stats.success} color="var(--success)" />
          <Stat label="没做到" value={stats.fail} color="var(--fail)" />
          <Stat label="未记录" value={stats.pending} color="var(--text-muted)" />
        </div>
      </div>

      <MultiWeekGrid state={state} title="每日明细" interactive={false} />

      <div className="card">
        <div className="section-title">本周信息</div>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: "0.875rem" }}>
          <dt style={{ color: "var(--text-muted)" }}>周期</dt>
          <dd>第 {state.cycleNumber} 轮</dd>
          <dt style={{ color: "var(--text-muted)" }}>日期</dt>
          <dd>
            {getDisplayDate(weekDates[0])} — {getDisplayDate(weekDates[6])}
          </dd>
          <dt style={{ color: "var(--text-muted)" }}>模式</dt>
          <dd>多轨并行 · {state.habits.length} 项每日打卡</dd>
        </dl>
      </div>

      {canAdvance ? (
        !showAdvanceConfirm ? (
          <button className="btn btn--primary btn--block" onClick={() => setShowAdvanceConfirm(true)}>
            进入下一周
          </button>
        ) : (
          <div className="card" style={{ borderColor: "var(--accent)" }}>
            <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--text-secondary)" }}>
              确认进入下一周？本周记录将归档，继续每日 {state.habits.length} 项打卡。
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => {
                  onAdvanceWeek();
                  setShowAdvanceConfirm(false);
                }}
              >
                确认进入
              </button>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowAdvanceConfirm(false)}>
                取消
              </button>
            </div>
          </div>
        )
      ) : (
        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          本周尚未结束，继续每日打卡吧
        </p>
      )}
    </div>
  );
}

function FranklinWeeklyPage({ state, onAdvanceWeek }: WeeklyPageProps) {
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);
  const habit = getCurrentHabit(state);
  const { weekDates } = getWeekProgress(state);
  const stats = countStatus(state.currentWeekRecords);
  const rate = weekSuccessRate(state.currentWeekRecords);
  const recordedDays = stats.success + stats.fail;

  const today = formatDate(new Date());
  const weekEndDate = weekDates[6];
  const weekHasEnded = parseDate(today) > parseDate(weekEndDate);

  const allPastDaysRecorded = weekDates
    .filter((d) => !isFutureDate(d))
    .every((d) => {
      const r = state.currentWeekRecords.find((rec) => rec.date === d);
      return r?.status !== null && r?.status !== undefined;
    });

  const canAdvance = weekHasEnded || allPastDaysRecorded;
  const nextHabit = state.habits[(state.currentHabitIndex + 1) % state.habits.length];

  if (!habit) return null;

  return (
    <div className="weekly-page fade-in stack">
      <div className="card card--highlight">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>本周成果</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700 }}>
              {habit.name}
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: rate >= 70 ? "var(--success)" : rate >= 40 ? "var(--text-primary)" : "var(--fail)",
                lineHeight: 1,
              }}
            >
              {recordedDays > 0 ? `${rate}%` : "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>完成率</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
          <Stat label="做到了" value={stats.success} color="var(--success)" />
          <Stat label="没做到" value={stats.fail} color="var(--fail)" />
          <Stat label="未记录" value={stats.pending} color="var(--text-muted)" />
        </div>
      </div>

      <div className="card">
        <div className="section-title">每日明细</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {state.currentWeekRecords.map((record) => {
            const future = isFutureDate(record.date);
            const todayFlag = isToday(record.date);
            return (
              <div
                key={record.date}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 4px",
                  borderRadius: "var(--radius-sm)",
                  background: todayFlag ? "var(--highlight-bg)" : "var(--bg-elevated)",
                  border: todayFlag ? "1px solid var(--border-strong)" : "1px solid var(--border)",
                  opacity: future ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                  周{getDayLabel(record.date)}
                </span>
                <StatusBadge status={record.status} size="md" />
                <span style={{ fontSize: "0.625rem", color: "var(--text-secondary)" }}>
                  {parseInt(record.date.slice(8))}日
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="section-title">本周信息</div>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: "0.875rem" }}>
          <dt style={{ color: "var(--text-muted)" }}>周期</dt>
          <dd>第 {state.cycleNumber} 轮</dd>
          <dt style={{ color: "var(--text-muted)" }}>日期</dt>
          <dd>
            {getDisplayDate(weekDates[0])} — {getDisplayDate(weekDates[6])}
          </dd>
          <dt style={{ color: "var(--text-muted)" }}>进度</dt>
          <dd>
            第 {state.currentHabitIndex + 1} / {state.habits.length} 项习惯
          </dd>
          <dt style={{ color: "var(--text-muted)" }}>下周</dt>
          <dd>{nextHabit.name}</dd>
        </dl>
      </div>

      {canAdvance ? (
        !showAdvanceConfirm ? (
          <button className="btn btn--primary btn--block" onClick={() => setShowAdvanceConfirm(true)}>
            进入下一周 · {nextHabit.name}
          </button>
        ) : (
          <div className="card" style={{ borderColor: "var(--accent)" }}>
            <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--text-secondary)" }}>
              确认进入下一周？本周记录将归档，下周专注「{nextHabit.name}」。
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => {
                  onAdvanceWeek();
                  setShowAdvanceConfirm(false);
                }}
              >
                确认进入
              </button>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowAdvanceConfirm(false)}>
                取消
              </button>
            </div>
          </div>
        )
      ) : (
        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          本周尚未结束，继续每日记录吧
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color, fontFamily: "var(--font-display)" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
