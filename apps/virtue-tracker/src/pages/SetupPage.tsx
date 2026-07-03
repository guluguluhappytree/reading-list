import { useState, type CSSProperties } from "react";
import type { Habit, TrackingMode } from "../types";
import { DAILY_FOUR_GOALS, FRANKLIN_VIRTUES, LIFESTYLE_FIVE_HABITS, TRACKING_MODE_LABELS } from "../types";
import { createId } from "../lib/id";

interface SetupPageProps {
  onComplete: (habits: Habit[], trackingMode: TrackingMode) => void;
}

export function SetupPage({ onComplete }: SetupPageProps) {
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("multi");
  const [habits, setHabits] = useState<Habit[]>(() =>
    DAILY_FOUR_GOALS.map((v) => ({ ...v, id: createId() })),
  );
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    setHabits((prev) => [
      ...prev,
      { id: createId(), name, description: newDesc.trim() || undefined },
    ]);
    setNewName("");
    setNewDesc("");
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (editingId === id) setEditingId(null);
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
    const name = editName.trim();
    if (!name || !editingId) return;
    setHabits((prev) =>
      prev.map((h) =>
        h.id === editingId
          ? { ...h, name, description: editDesc.trim() || undefined }
          : h,
      ),
    );
    cancelEdit();
  };

  const loadFranklin = () => {
    setTrackingMode("franklin");
    setHabits(FRANKLIN_VIRTUES.map((v) => ({ ...v, id: createId() })));
  };

  const loadLifestyleFive = () => {
    setTrackingMode("multi");
    setHabits(LIFESTYLE_FIVE_HABITS.map((v) => ({ ...v, id: createId() })));
  };

  const loadDailyFour = () => {
    setTrackingMode("multi");
    setHabits(DAILY_FOUR_GOALS.map((v) => ({ ...v, id: createId() })));
  };

  const clearAll = () => setHabits([]);

  const handleStart = () => {
    if (habits.length === 0) return;
    onComplete(habits, trackingMode);
  };

  const startLabel =
    trackingMode === "multi"
      ? `同时追踪 ${habits.length} 项目标`
      : `第 1 周从「${habits[0]?.name ?? "…"}」开始`;

  return (
    <div className="setup-page fade-in stack">
      <div style={{ textAlign: "left", marginBottom: 24 }}>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
          两种训练方式：
          <br />
          <strong>富兰克林</strong> — 每周只专注一项，循环往复；
          <br />
          <strong>多轨并行</strong> — 每天同时对多个目标打卡。
        </p>
      </div>

      <div className="card">
        <div className="section-title">训练模式</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(["multi", "franklin"] as TrackingMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`btn ${trackingMode === mode ? "btn--primary" : "btn--ghost"}`}
              style={{ textAlign: "left", padding: "12px 14px" }}
              onClick={() => setTrackingMode(mode)}
            >
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{TRACKING_MODE_LABELS[mode]}</div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.85, marginTop: 4 }}>
                {mode === "franklin"
                  ? "一次只练一项，适合深度养成单一美德"
                  : "每天多项一起打卡，适合日常节奏管理"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">添加习惯</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            placeholder="习惯名称，如：早起"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="说明（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            style={inputStyle}
          />
          <button className="btn btn--ghost btn--block" onClick={addHabit} disabled={!newName.trim()}>
            + 添加
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          className="btn btn--ghost btn--block"
          style={{ fontSize: "0.8125rem", padding: "10px 12px" }}
          onClick={loadDailyFour}
        >
          载入每日四目标（学习 / 产品 / 内容 / 复盘）
        </button>
        <button
          className="btn btn--ghost btn--block"
          style={{ fontSize: "0.8125rem", padding: "10px 12px" }}
          onClick={loadLifestyleFive}
        >
          载入生活五习惯（早睡 / 早起 / 阅读 / 少刷手机 / 运动）
        </button>
        <button
          className="btn btn--ghost btn--block"
          style={{ fontSize: "0.8125rem", padding: "10px 12px" }}
          onClick={loadFranklin}
        >
          载入富兰克林十三美德
        </button>
        <button
          className="btn btn--ghost btn--block"
          style={{ fontSize: "0.8125rem", padding: "10px 12px", color: "var(--text-muted)" }}
          onClick={clearAll}
        >
          清空列表
        </button>
      </div>

      <div className="card">
        <div className="section-title">
          习惯清单
          <span className="badge badge--gold" style={{ marginLeft: 8 }}>
            {habits.length} 项
          </span>
        </div>
        {habits.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: "16px 0" }}>
            请至少添加一项习惯
          </p>
        ) : (
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {habits.map((h, i) => (
              <li
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 14px",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  border: editingId === h.id ? "1px solid var(--accent-gold-dim)" : "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.375rem",
                    color: "var(--text-secondary)",
                    minWidth: 28,
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {i + 1}
                </span>
                {editingId === h.id ? (
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
                    <div style={{ fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.35 }}>
                      {h.targetHours ? `${h.targetHours} 小时 · ${h.name}` : h.name}
                    </div>
                    {h.description ? (
                      <div style={{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
                        {h.description}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.9375rem", color: "var(--text-muted)", marginTop: 4 }}>点击编辑</div>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeHabit(h.id)}
                  style={{ color: "var(--text-muted)", fontSize: "1.125rem", padding: "0 4px" }}
                  aria-label={`删除 ${h.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="btn btn--primary btn--block" onClick={handleStart} disabled={habits.length === 0}>
        开始训练 · {startLabel}
      </button>
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
