import type { AppState, DayStatus } from "../types";
import { StatusBadge } from "./StatusBadge";
import {
  cycleDayStatus,
  formatHabitLabel,
  getDayLabel,
  isFutureDate,
  isToday,
} from "../utils";

interface MultiWeekGridProps {
  state: AppState;
  onRecord?: (date: string, status: DayStatus, habitId: string) => void;
  title?: string;
  interactive?: boolean;
  /** 仅显示「1h 学习」式主标签，不显示副说明 */
  compactGoals?: boolean;
}

export function MultiWeekGrid({
  state,
  onRecord,
  title = "每日明细",
  interactive = true,
  compactGoals = false,
}: MultiWeekGridProps) {
  return (
    <div className="card multi-week-grid">
      <div className="section-title">{title}</div>
      <div className="multi-week-grid__scroll">
        <table className="multi-week-grid__table">
          <thead>
            <tr>
              <th className="multi-week-grid__goal-col">目标</th>
              {state.multiWeekRecords.map((day) => {
                const todayFlag = isToday(day.date);
                return (
                  <th
                    key={day.date}
                    className={`multi-week-grid__day-col${todayFlag ? " multi-week-grid__day-col--today" : ""}`}
                  >
                    周{getDayLabel(day.date)}
                    {todayFlag && <span className="multi-week-grid__today-tag">今</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {state.habits.map((habit) => (
              <tr key={habit.id}>
                <td className="multi-week-grid__goal">
                  <span className="multi-week-grid__goal-name">{formatHabitLabel(habit)}</span>
                  {!compactGoals && habit.description && (
                    <span className="multi-week-grid__goal-desc">{habit.description}</span>
                  )}
                </td>
                {state.multiWeekRecords.map((day) => {
                  const status = day.statuses[habit.id] ?? null;
                  const future = isFutureDate(day.date);
                  const todayFlag = isToday(day.date);
                  const canTap = interactive && onRecord && !future;

                  return (
                    <td
                      key={day.date}
                      className={`multi-week-grid__cell${todayFlag ? " multi-week-grid__cell--today" : ""}${future ? " multi-week-grid__cell--future" : ""}`}
                    >
                      {canTap ? (
                        <button
                          type="button"
                          className="multi-week-grid__cell-btn"
                          onClick={() => {
                            onRecord(day.date, cycleDayStatus(status), habit.id);
                          }}
                          aria-label={`${habit.name} 周${getDayLabel(day.date)} ${status ?? "未记录"}`}
                        >
                          <StatusBadge status={status} size="sm" />
                        </button>
                      ) : (
                        <StatusBadge status={status} size="sm" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {interactive && !compactGoals && (
        <p className="multi-week-grid__hint">点击格子切换：未记录 → ✓ → ✗ → 未记录</p>
      )}
    </div>
  );
}
