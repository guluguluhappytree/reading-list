import { useState } from "react";
import type { WeekSession } from "../types";
import { WeekSessionList } from "../components/WeekSessionList";

interface GraduatePageProps {
  onRestart: () => void;
  totalWeeks: number;
  totalSuccess: number;
  weekHistory: WeekSession[];
}

export function GraduatePage({ onRestart, totalWeeks, totalSuccess, weekHistory }: GraduatePageProps) {
  const [showHistory, setShowHistory] = useState(false);
  const sessions = [...weekHistory].reverse();

  return (
    <div
      className="fade-in"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "24px 20px",
        overflowY: "auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.8 }}>🏛</div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          训练完成
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8 }}>
          如富兰克林所言：
          <br />
          <em style={{ color: "var(--text-primary)" }}>
            「尽管永远无法达到完美，
            <br />
            但接近完美本身即是胜利。」
          </em>
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {totalWeeks}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>训练周数</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>
              {totalSuccess}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>累计做到</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--block"
        style={{ marginBottom: showHistory ? 16 : 24 }}
        onClick={() => setShowHistory((v) => !v)}
      >
        {showHistory ? "收起历史明细" : "查看历史明细"}
      </button>

      {showHistory && (
        <div style={{ marginBottom: 24 }}>
          <WeekSessionList sessions={sessions} emptyMessage="暂无历史记录" />
        </div>
      )}

      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6, textAlign: "center" }}>
        所有历史记录会完整保留。开始新一轮时，从第一个习惯重新练起。
      </p>

      <button className="btn btn--primary btn--block" onClick={onRestart}>
        开始新一轮训练（保留历史）
      </button>
    </div>
  );
}
