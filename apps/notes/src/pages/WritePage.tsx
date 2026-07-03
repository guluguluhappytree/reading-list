import { useMemo, useState } from "react";
import type { DailyArticle, Note } from "../types";
import { WRITING_PROMPTS } from "../types";
import { formatDisplayDate, generateArticleDraft, getWritingTips, todayStr } from "../utils";

export function WritePage({
  notes,
  existingArticle,
  onSave,
}: {
  notes: Note[];
  existingArticle?: DailyArticle;
  onSave: (title: string, content: string, sourceIds: string[]) => void;
}) {
  const today = todayStr();
  const todayNotes = useMemo(() => notes.filter((n) => n.date === today), [notes, today]);
  const [promptId, setPromptId] = useState("connect");
  const [title, setTitle] = useState(existingArticle?.title ?? `${today.slice(5).replace("-", "月")}日所思`);
  const [content, setContent] = useState(existingArticle?.content ?? "");
  const [generated, setGenerated] = useState(false);

  const tips = getWritingTips(todayNotes.length);

  const handleGenerate = () => {
    const draft = generateArticleDraft(todayNotes, promptId);
    setContent(draft);
    setGenerated(true);
  };

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(title, content, todayNotes.map((n) => n.id));
  };

  return (
    <div className="fade-in stack">
      <div className="tip-box">
        把今日 {todayNotes.length} 条笔记炼成一篇文章，训练思维与表达
      </div>

      <div className="card">
        <div className="section-title">写作模式</div>
        <div className="picker-row">
          {WRITING_PROMPTS.map((p) => (
            <button
              key={p.id}
              className={`chip ${promptId === p.id ? "selected" : ""}`}
              onClick={() => setPromptId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 12 }}>
          {WRITING_PROMPTS.find((p) => p.id === promptId)?.hint}
        </p>
        <button className="btn btn--ghost" onClick={handleGenerate} disabled={todayNotes.length === 0}>
          ✨ 从今日笔记生成初稿
        </button>
      </div>

      {todayNotes.length > 0 && (
        <div className="card">
          <div className="section-title">今日素材</div>
          {todayNotes.map((n, i) => (
            <div key={n.id} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              {i + 1}. {n.content.slice(0, 60)}{n.content.length > 60 ? "…" : ""}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="section-title">表达训练提示</div>
        <ul className="tip-list">
          {tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>

      <div className="card">
        <div className="section-title">{formatDisplayDate(today)} · 成文</div>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 10 }} />
        <textarea
          className="textarea article-editor"
          placeholder="点击「生成初稿」或在此自由写作……"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ minHeight: 240 }}
        />
        <button className="btn btn--primary" style={{ marginTop: 12 }} onClick={handleSave} disabled={!content.trim()}>
          {generated ? "保存文章" : "保存成文"}
        </button>
      </div>
    </div>
  );
}
