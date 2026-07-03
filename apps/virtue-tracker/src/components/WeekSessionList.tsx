import { useState } from "react";
import type { WeekSession } from "../types";
import { StatusBadge } from "./StatusBadge";
import { countSessionStats, getDisplayDate, weekSuccessRate } from "../utils";

interface WeekSessionListProps {
  sessions: WeekSession[];
  grouped?: boolean;
  emptyMessage?: string;
}

export function WeekSessionList({
  sessions,
  grouped = true,
  emptyMessage = "尚无历史记录",
}: WeekSessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="empty-state card">
        <div className="empty-state__icon">📜</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const renderSession = (session: WeekSession) => {
    const stats = countSessionStats(session);
    const isMulti = session.trackingMode === "multi" && session.multiRecords;
    const rate = isMulti
      ? stats.success + stats.fail > 0
        ? Math.round((stats.success / (stats.success + stats.fail)) * 100)
        : 0
      : weekSuccessRate(session.records);
    const isExpanded = expandedId === session.id;
    const isCurrent = session.id === "current";

    return (
      <div
        key={session.id}
        className="card"
        style={{ marginBottom: 8, cursor: "pointer" }}
        onClick={() => setExpandedId(isExpanded ? null : session.id)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: "1rem" }}>{session.habitName}</span>
              {isMulti && (
                <span className="badge badge--gold" style={{ fontSize: "0.625rem" }}>
                  多轨
                </span>
              )}
              {isCurrent && (
                <span className="badge badge--gold" style={{ fontSize: "0.625rem" }}>
                  进行中
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 4 }}>
              {getDisplayDate(session.startDate)} — {getDisplayDate(session.endDate)}
              {" · "}✓ {stats.success} / ✗ {stats.fail}
              {stats.success + stats.fail > 0 && ` · ${rate}%`}
            </div>
          </div>
          {!isMulti && (
            <div style={{ display: "flex", gap: 4 }}>
              {session.records.map((r) => (
                <StatusBadge key={r.date} status={r.status} size="sm" />
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isMulti && session.multiRecords ? (
              <MultiSessionDetail session={session} />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 6,
                }}
              >
                {session.records.map((record) => (
                  <div
                    key={record.date}
                    style={{
                      textAlign: "center",
                      padding: "8px 2px",
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", marginBottom: 4 }}>
                      {parseInt(record.date.slice(8))}日
                    </div>
                    <StatusBadge status={record.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!grouped) {
    return <div>{sessions.map(renderSession)}</div>;
  }

  const groupedByCycle = sessions.reduce<Record<number, WeekSession[]>>((acc, session) => {
    if (!acc[session.cycleNumber]) acc[session.cycleNumber] = [];
    acc[session.cycleNumber].push(session);
    return acc;
  }, {});

  const cycleNumbers = Object.keys(groupedByCycle)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      {cycleNumbers.map((cycle) => (
        <div key={cycle} style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: "0.8125rem",
              color: "var(--accent)",
              letterSpacing: "0.1em",
              marginBottom: 10,
              paddingLeft: 4,
            }}
          >
            第 {cycle} 轮
          </div>
          {groupedByCycle[cycle].map(renderSession)}
        </div>
      ))}
    </>
  );
}

function MultiSessionDetail({ session }: { session: WeekSession }) {
  const labels: { id: string; name: string; targetHours?: number }[] =
    session.multiHabitLabels ??
    (session.multiRecords?.[0]
      ? Object.keys(session.multiRecords[0].statuses).map((id) => ({ id, name: id }))
      : []);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 4px", color: "var(--text-muted)" }}>日期</th>
            {labels.map((h) => (
              <th key={h.id} style={{ textAlign: "center", padding: "6px 2px", color: "var(--text-muted)" }}>
                {h.targetHours ? `${h.targetHours}h` : ""}
                {h.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {session.multiRecords?.map((day) => (
            <tr key={day.date}>
              <td style={{ padding: "6px 4px" }}>{parseInt(day.date.slice(8))}日</td>
              {labels.map((h) => (
                <td key={h.id} style={{ textAlign: "center", padding: "4px 2px" }}>
                  <StatusBadge status={day.statuses[h.id] ?? null} size="sm" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
