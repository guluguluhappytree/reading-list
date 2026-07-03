import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AppState, Habit, WeekSession } from "../types";
import { WeekSessionList } from "../components/WeekSessionList";
import { downloadBackup, parseBackupFile } from "../lib/backup";
import {
  loadReminderSettings,
  requestReminderPermission,
  saveReminderSettings,
  type ReminderSettings,
} from "../lib/reminder";
import { createId } from "../lib/id";
import { createMultiWeekSession, countSessionStats, isMultiMode } from "../utils";

interface HistoryPageProps {
  state: AppState;
  onAddHabit: (habit: Habit) => void;
  onRemoveHabit: (id: string) => void;
  onUpdateHabit: (id: string, patch: { name: string; description?: string }) => void;
  onGraduate: () => void;
  onReset: () => void;
  onRestoreBackup: (state: AppState) => void;
}

export function HistoryPage({
  state,
  onAddHabit,
  onRemoveHabit,
  onUpdateHabit,
  onGraduate,
  onReset,
  onRestoreBackup,
}: HistoryPageProps) {
  const [showGraduateConfirm, setShowGraduateConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [reminder, setReminder] = useState<ReminderSettings>(() => loadReminderSettings());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveReminderSettings(reminder);
  }, [reminder]);

  const handleAddHabit = () => {
    const name = newName.trim();
    if (!name) return;
    onAddHabit({ id: createId(), name, description: newDesc.trim() || undefined });
    setNewName("");
    setNewDesc("");
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const text = await file.text();
      const next = parseBackupFile(text);
      setPendingImport(next);
      setShowImportConfirm(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "导入失败");
    }
  };

  const confirmImport = () => {
    if (pendingImport) onRestoreBackup(pendingImport);
    setPendingImport(null);
    setShowImportConfirm(false);
    setImportError(null);
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditDesc(habit.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onUpdateHabit(editingId, { name: editName, description: editDesc });
    cancelEdit();
  };

  const pendingDeleteHabit = pendingDeleteId
    ? state.habits.find((h) => h.id === pendingDeleteId)
    : null;

  const hasCurrentWeekData = isMultiMode(state)
    ? state.multiWeekRecords.some((r) => Object.values(r.statuses).some((s) => s !== null))
    : state.currentWeekRecords.some((r) => r.status !== null);

  const allSessions: WeekSession[] = [
    ...state.weekHistory,
    ...(hasCurrentWeekData
      ? [
          isMultiMode(state)
            ? {
                ...createMultiWeekSession(state, state.multiWeekRecords),
                id: "current",
              }
            : {
                id: "current",
                habitId: state.habits[state.currentHabitIndex]?.id ?? "",
                habitName: state.habits[state.currentHabitIndex]?.name ?? "",
                cycleNumber: state.cycleNumber,
                weekIndex: state.currentHabitIndex,
                startDate: state.currentWeekRecords[0]?.date ?? "",
                endDate: state.currentWeekRecords[6]?.date ?? "",
                records: state.currentWeekRecords,
              },
        ]
      : []),
  ].reverse();

  const totalWeeks = allSessions.length;
  const totalSuccess = allSessions.reduce((acc, s) => acc + countSessionStats(s).success, 0);
  const totalFail = allSessions.reduce((acc, s) => acc + countSessionStats(s).fail, 0);

  const handleReminderToggle = async () => {
    if (reminder.enabled) {
      setReminder((prev) => ({ ...prev, enabled: false }));
      return;
    }
    const granted = await requestReminderPermission();
    if (!granted) return;
    setReminder((prev) => ({ ...prev, enabled: true }));
  };

  return (
    <div className="history-page fade-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">总体统计</div>
        <div style={{ display: "flex", gap: 12 }}>
          <SummaryStat label="训练周数" value={totalWeeks} />
          <SummaryStat label="累计 ✓" value={totalSuccess} color="var(--success)" />
          <SummaryStat label="累计 ✗" value={totalFail} color="var(--fail)" />
          <SummaryStat label="当前轮次" value={state.cycleNumber} />
        </div>
      </div>

      <WeekSessionList sessions={allSessions} />

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">习惯清单</div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          {isMultiMode(state)
            ? "多轨模式下，所有目标每天一起打卡。点击名称可编辑；无记录的目标可删除。"
            : "点击名称可编辑。新增的习惯会排在队列末尾，本轮现有习惯依次练完后再轮到它。"}
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {state.habits.map((h, i) => {
            const canRemove = isMultiMode(state)
              ? !state.multiWeekRecords.some((r) => r.statuses[h.id] !== null)
              : i > state.currentHabitIndex;
            const isActive = isMultiMode(state) ? true : i === state.currentHabitIndex;
            const isEditing = editingId === h.id;

            return (
              <li
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: isActive ? "var(--highlight-bg)" : "var(--bg-elevated)",
                  border:
                    isEditing
                      ? "1px solid var(--accent-gold-dim)"
                      : isActive
                        ? "1px solid var(--border-strong)"
                        : "1px solid var(--border)",
                  fontSize: "1rem",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    minWidth: 24,
                    paddingTop: 2,
                    fontSize: "1.25rem",
                    fontFamily: "var(--font-display)",
                    lineHeight: 1.3,
                  }}
                >
                  {i + 1}
                </span>
                {isEditing ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={inputStyle}
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="说明（可选）"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      style={inputStyle}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn--primary"
                        style={{ flex: 1, padding: "8px 12px", fontSize: "0.8125rem" }}
                        onClick={saveEdit}
                        disabled={!editName.trim()}
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        style={{ flex: 1, padding: "8px 12px", fontSize: "0.8125rem" }}
                        onClick={cancelEdit}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(h)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "1.0625rem", lineHeight: 1.35 }}>
                        {h.targetHours ? `${h.targetHours}h · ${h.name}` : h.name}
                      </span>
                      {h.description ? (
                        <span style={{ display: "block", fontSize: "0.9375rem", color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>
                          {h.description}
                        </span>
                      ) : (
                        <span style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 4 }}>
                          点击编辑
                        </span>
                      )}
                    </button>
                    {isMultiMode(state) ? (
                      <span className="badge badge--gold" style={{ fontSize: "0.625rem" }}>
                        每日
                      </span>
                    ) : (
                      i === state.currentHabitIndex && (
                        <span className="badge badge--gold" style={{ fontSize: "0.625rem" }}>
                          本周
                        </span>
                      )
                    )}
                    {!isMultiMode(state) && i > state.currentHabitIndex && (
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>待练</span>
                    )}
                    {canRemove && !pendingDeleteId && (
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(h.id)}
                        style={{ color: "var(--text-muted)", fontSize: "1.125rem", padding: "0 4px", lineHeight: 1 }}
                        aria-label={`删除 ${h.name}`}
                      >
                        ×
                      </button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {pendingDeleteHabit && (
          <div className="card" style={{ marginTop: 12, borderColor: "var(--fail)" }}>
            <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--text-secondary)" }}>
              确认删除「{pendingDeleteHabit.name}」？该习惯尚未开始训练，删除后无法恢复。
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn--fail"
                style={{ flex: 1, background: "var(--fail)", color: "white", border: "none" }}
                onClick={() => {
                  onRemoveHabit(pendingDeleteHabit.id);
                  setPendingDeleteId(null);
                }}
              >
                确认删除
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => setPendingDeleteId(null)}
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="新习惯名称，如：每日运动"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="说明（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            style={inputStyle}
          />
          <button className="btn btn--ghost btn--block" onClick={handleAddHabit} disabled={!newName.trim()}>
            + 添加习惯
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">每日提醒（可选）</div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          默认不提醒。只有你主动开启后，才会在设定时间、且今日尚未打卡时发送通知；关闭后不会再打扰。
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={reminder.enabled} onChange={() => void handleReminderToggle()} />
          <span style={{ fontSize: "0.875rem" }}>开启每日提醒</span>
        </label>
        {reminder.enabled ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="time"
              value={`${String(reminder.hour).padStart(2, "0")}:${String(reminder.minute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                setReminder((prev) => ({ ...prev, hour: h, minute: m }));
              }}
              style={inputStyle}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              已开启：每天 {String(reminder.hour).padStart(2, "0")}:{String(reminder.minute).padStart(2, "0")} 提醒（需允许通知权限）
            </p>
          </div>
        ) : (
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>当前未开启，不会发送任何提醒</p>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">本地备份</div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          数据保存在本机。换手机或重装前，请先导出 JSON 备份文件。
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => downloadBackup(state)}>
            导出备份 JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => fileInputRef.current?.click()}
          >
            从备份文件恢复
          </button>
        </div>
        {importError && (
          <p style={{ fontSize: "0.8125rem", color: "var(--fail)", marginTop: 10 }}>{importError}</p>
        )}
        {showImportConfirm && pendingImport && (
          <div className="card" style={{ marginTop: 12, borderColor: "var(--accent)" }}>
            <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--text-secondary)" }}>
              将用备份覆盖当前数据（{pendingImport.weekHistory.length} 周历史、
              {pendingImport.habits.length} 项习惯）。继续？
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={confirmImport}>
                确认恢复
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowImportConfirm(false);
                  setPendingImport(null);
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {!showGraduateConfirm ? (
          <button className="btn btn--ghost btn--block" onClick={() => setShowGraduateConfirm(true)}>
            我已养成习惯，退出训练
          </button>
        ) : (
          <div className="card" style={{ borderColor: "var(--success)" }}>
            <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--text-secondary)" }}>
              确认退出？你的所有记录将被保留，可以随时重新开始。
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={onGraduate}>
                确认退出
              </button>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowGraduateConfirm(false)}>
                取消
              </button>
            </div>
          </div>
        )}

        {!showResetConfirm ? (
          <button
            className="btn btn--ghost btn--block"
            style={{ color: "var(--fail)", borderColor: "rgba(184, 92, 92, 0.3)" }}
            onClick={() => setShowResetConfirm(true)}
          >
            重置所有数据
          </button>
        ) : (
          <div className="card" style={{ borderColor: "var(--fail)" }}>
            <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--fail)" }}>
              此操作不可恢复，所有记录将被清除。
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn--fail"
                style={{ flex: 1, background: "var(--fail)", color: "white", border: "none" }}
                onClick={onReset}
              >
                确认重置
              </button>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowResetConfirm(false)}>
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--bg-deep)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontSize: "0.9375rem",
  outline: "none",
};

function SummaryStat({
  label,
  value,
  color = "var(--text-primary)",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 700,
          color,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
