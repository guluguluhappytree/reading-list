import type { QuizQuestion, QuizResult, ReadingGoal } from "./types";
import { createId } from "./utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function truncate(s: string, max = 18): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max) + "…";
}

function buildOptions(correct: string, wrongPool: string[]): { options: string[]; correctIndex: number } {
  const unique = [correct, ...wrongPool.filter((w) => w && w !== correct)];
  const options = shuffle(Array.from(new Set(unique)).slice(0, 4));
  if (options.length < 2) options.push("需要再读一遍才能掌握", "与本书核心观点无关");
  return { options, correctIndex: options.indexOf(correct) };
}

const SUPPLEMENT_BY_PATH: Record<string, string[]> = {
  "投资大师养成记": [
    "重读《证券分析》中安全边际章节，做读书笔记",
    "补充《货币金融学》理解利率与央行政策",
    "增加《巴菲特致股东的信》年度信精读",
  ],
  "投资大师体系（一级/二级市场）": [
    "重读《证券分析》中安全边际章节",
    "补充宏观周期类读物《债务危机》",
  ],
  "芒格多元思维模型": [
    "重读《穷查理宝典》误判心理学清单",
    "补充《探求智慧》决策原则章节",
    "增加心理学类《影响力》精读",
  ],
  "经济学构建": [
    "重读《经济学原理》供需与宏观章节",
    "补充《国富论》分工与市场部分",
  ],
};

const DEFAULT_SUPPLEMENT = [
  "重读得分偏低的书籍，对照原书目录逐章回顾",
  "为每本薄弱书补充 3 条结构化笔记：核心观点 / 可行动建议 / 疑问",
  "在书单中增加 1–2 本同主题进阶读物",
];

/** 全书读完后生成 1–5 道测验题 */
export function generateQuiz(goal: ReadingGoal): QuizQuestion[] {
  const readBooks = goal.books.filter((b) => b.read);
  if (readBooks.length === 0) return [];

  const questions: QuizQuestion[] = [];
  const candidates = shuffle(readBooks);

  for (const book of candidates) {
    if (questions.length >= 5) break;

    const wrongReasons = goal.books
      .filter((b) => b.id !== book.id)
      .map((b) => b.reason)
      .filter(Boolean);
    if (wrongReasons.length >= 1) {
      const { options, correctIndex } = buildOptions(book.reason, wrongReasons);
      questions.push({
        id: createId(),
        bookId: book.id,
        question: `《${truncate(book.title)}》在本书单中的阅读重点是？`,
        options,
        correctIndex,
      });
    }

    if (questions.length >= 5) break;

    if (book.author) {
      const wrongAuthors = goal.books
        .filter((b) => b.id !== book.id && b.author)
        .map((b) => b.author);
      if (wrongAuthors.length >= 1) {
        const { options, correctIndex } = buildOptions(book.author, wrongAuthors);
        questions.push({
          id: createId(),
          bookId: book.id,
          question: `《${truncate(book.title)}》的作者是？`,
          options,
          correctIndex,
        });
      }
    }

    if (questions.length >= 5) break;

    if (book.notes.trim().length > 12) {
      const excerpt = truncate(book.notes.trim(), 36);
      const { options, correctIndex } = buildOptions(excerpt, [
        "尚未形成清晰笔记",
        "与本书主题关系不大",
        "需要重新阅读才能总结",
      ]);
      questions.push({
        id: createId(),
        bookId: book.id,
        question: `关于《${truncate(book.title)}》，哪条最接近你的阅读笔记？`,
        options,
        correctIndex,
      });
    }
  }

  if (questions.length < 5) {
    const { options, correctIndex } = buildOptions(goal.title, [
      "随便读几本书即可",
      "只读畅销榜，不用系统学习",
      "与当前书单主题无关",
    ]);
    questions.push({
      id: createId(),
      question: "本书单对应的阅读目标是？",
      options,
      correctIndex,
    });
  }

  if (questions.length < 5 && goal.pathName) {
    const { options, correctIndex } = buildOptions(goal.pathName, [
      "随机通用书单",
      "无主题阅读",
      "仅读小说消遣",
    ]);
    questions.push({
      id: createId(),
      question: "本书单采用的学习路径是？",
      options,
      correctIndex,
    });
  }

  return questions.slice(0, 5);
}

export function evaluateQuiz(
  goal: ReadingGoal,
  questions: QuizQuestion[],
  answers: number[]
): QuizResult {
  let score = 0;
  const weakIds = new Set<string>();

  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) {
      score++;
    } else if (q.bookId) {
      weakIds.add(q.bookId);
    }
  });

  const total = questions.length;
  const percent = Math.round((score / total) * 100);
  const weakBooks = goal.books
    .filter((b) => weakIds.has(b.id))
    .map((b) => ({ id: b.id, title: b.title }));

  let level: QuizResult["level"];
  let levelLabel: string;
  let summary: string;

  if (percent >= 80) {
    level = "near";
    levelLabel = "离目标很近";
    summary = `答对 ${score}/${total} 题（${percent}%）。核心内容掌握较好，可进入下一书单或深化实践。`;
  } else if (percent >= 60) {
    level = "mid";
    levelLabel = "中等距离";
    summary = `答对 ${score}/${total} 题（${percent}%）。主线已有框架，但部分书籍理解不够扎实，建议针对性重读。`;
  } else {
    level = "far";
    levelLabel = "距离目标较远";
    summary = `答对 ${score}/${total} 题（${percent}%）。建议重读薄弱书目、补充笔记，并考虑增加基础读物。`;
  }

  const rereadSuggestions =
    weakBooks.length > 0
      ? weakBooks.map((b) => `重读《${b.title}》，补充结构化笔记与行动清单`)
      : percent < 80
        ? ["回顾全书单，为每本书补写「一句话核心收获」"]
        : ["保持定期回顾笔记即可"];

  const pathSup = SUPPLEMENT_BY_PATH[goal.pathName] ?? DEFAULT_SUPPLEMENT;
  const supplementSuggestions =
    percent >= 80
      ? ["当前路径掌握良好，可创建进阶书单或开始输出（写作/视频）"]
      : [...pathSup.slice(0, 2), weakBooks.length > 0 ? `优先攻克：${weakBooks.map((b) => b.title).join("、")}` : pathSup[2] ?? DEFAULT_SUPPLEMENT[2]].filter(Boolean);

  return {
    score,
    total,
    percent,
    level,
    levelLabel,
    summary,
    weakBooks,
    rereadSuggestions,
    supplementSuggestions,
    completedAt: new Date().toISOString(),
  };
}
