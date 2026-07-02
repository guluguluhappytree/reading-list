import { useState } from "react";
import type { QuizQuestion, QuizResult, ReadingGoal } from "../types";
import { evaluateQuiz, generateQuiz } from "../quiz";

export function QuizPanel({
  goal,
  onSubmit,
  onReread,
}: {
  goal: ReadingGoal;
  onSubmit: (result: QuizResult) => void;
  onReread: (bookIds: string[]) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "quiz" | "result">(goal.lastQuiz ? "result" : "idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(goal.lastQuiz ?? null);

  const startQuiz = () => {
    const qs = generateQuiz(goal);
    if (qs.length === 0) return;
    setQuestions(qs);
    setAnswers(qs.map(() => -1));
    setPhase("quiz");
  };

  const submit = () => {
    if (answers.some((a) => a < 0)) return;
    const r = evaluateQuiz(goal, questions, answers);
    setResult(r);
    setPhase("result");
    onSubmit(r);
  };

  const display = result ?? goal.lastQuiz;

  if (phase === "idle") {
    return (
      <div className="card quiz-card">
        <div className="quiz-card__title">🎓 书单已读完，开始结业测验</div>
        <p className="quiz-card__desc">系统将根据 1–5 道题评估你对本书单的掌握程度，并给出重读与补充建议。</p>
        <button className="btn btn--primary" onClick={startQuiz}>开始测验（1–5 题）</button>
      </div>
    );
  }

  if (phase === "quiz") {
    return (
      <div className="card quiz-card">
        <div className="section-title">结业测验 · 共 {questions.length} 题</div>
        {questions.map((q, qi) => (
          <div key={q.id} className="quiz-q">
            <div className="quiz-q__title">{qi + 1}. {q.question}</div>
            <div className="quiz-q__options">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  className={`quiz-opt ${answers[qi] === oi ? "quiz-opt--selected" : ""}`}
                  onClick={() => {
                    const next = [...answers];
                    next[qi] = oi;
                    setAnswers(next);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          className="btn btn--primary"
          style={{ marginTop: 12 }}
          disabled={answers.some((a) => a < 0)}
          onClick={submit}
        >
          提交答案
        </button>
      </div>
    );
  }

  if (display) {
    return (
      <div className="card quiz-card">
        <div className={`quiz-level quiz-level--${display.level}`}>{display.levelLabel}</div>
        <div className="quiz-score">{display.score} / {display.total} 题正确 · {display.percent}%</div>
        <p className="quiz-summary">{display.summary}</p>

        {display.weakBooks.length > 0 && (
          <div className="quiz-block">
            <div className="quiz-block__title">薄弱书目</div>
            <ul className="quiz-list">
              {display.weakBooks.map((b) => (
                <li key={b.id}>《{b.title}》</li>
              ))}
            </ul>
            <button
              className="btn btn--ghost btn--sm"
              style={{ marginTop: 8 }}
              onClick={() => onReread(display.weakBooks.map((b) => b.id))}
            >
              标记为待重读
            </button>
          </div>
        )}

        <div className="quiz-block">
          <div className="quiz-block__title">建议重读</div>
          <ul className="quiz-list">
            {display.rereadSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="quiz-block">
          <div className="quiz-block__title">建议补充</div>
          <ul className="quiz-list">
            {display.supplementSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={startQuiz}>
          重新测验
        </button>
      </div>
    );
  }

  return null;
}
