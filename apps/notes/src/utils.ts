import type { NoteCategory } from "./types";

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const CATEGORY_RULES: { category: NoteCategory; keywords: string[] }[] = [
  { category: "reading", keywords: ["读", "书", "文章", "章节", "作者", "摘录", "读后", "阅读", "段落", "书籍"] },
  { category: "inspiration", keywords: ["灵感", "突然", "想法", "创意", "点子", "启发", "闪念", "顿悟", "假如", "或许"] },
  { category: "reflection", keywords: ["思考", "反思", "觉得", "认为", "为什么", "意义", "本质", "观点", "逻辑", "哲学"] },
  { category: "learning", keywords: ["学习", "课程", "笔记", "知识", "方法", "技能", "练习", "掌握", "理解", "教程"] },
  { category: "work", keywords: ["工作", "项目", "会议", "客户", "任务", "同事", "业务", "产品", "方案", "职业"] },
  { category: "life", keywords: ["生活", "家人", "朋友", "健康", "运动", "旅行", "美食", "日常", "心情", "周末"] },
];

const TAG_KEYWORDS = [
  "写作", "表达", "思维", "沟通", "管理", "效率", "情绪", "习惯", "目标", "决策",
  "创新", "领导力", "心理学", "历史", "科技", "商业", "投资", "健康", "关系", "成长",
];

export function classifyContent(text: string): NoteCategory {
  const scores: Record<NoteCategory, number> = {
    reading: 0, inspiration: 0, reflection: 0, learning: 0, work: 0, life: 0,
  };
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) scores[rule.category]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? (best[0] as NoteCategory) : "reflection";
}

export function extractTags(text: string): string[] {
  const tags = new Set<string>();
  for (const kw of TAG_KEYWORDS) {
    if (text.includes(kw)) tags.add(kw);
  }
  const quoted = text.match(/[「『""]([^」』""]{2,8})[」』""]/g);
  if (quoted) {
    quoted.slice(0, 2).forEach((q) => tags.add(q.replace(/[「『""」』""]/g, "")));
  }
  return Array.from(tags).slice(0, 5);
}

export function suggestTitle(content: string): string {
  const first = content.trim().split(/[\n。！？.!?]/)[0]?.trim() ?? "";
  if (first.length <= 24) return first || "无标题笔记";
  return first.slice(0, 24) + "…";
}

export function searchNotes<T extends { title: string; content: string; tags: string[] }>(
  items: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function generateArticleDraft(
  notes: { title: string; content: string; category: NoteCategory }[],
  promptId: string
): string {
  if (notes.length === 0) return "";

  const blocks = notes.map((n, i) => `【${i + 1}】${n.content.trim()}`).join("\n\n");

  switch (promptId) {
    case "summary":
      return `## 今日三句话\n\n${notes
        .slice(0, 3)
        .map((n, i) => `${i + 1}. ${n.content.trim().split(/[。！？.!?]/)[0] || n.content.trim()}`)
        .join("\n")}\n\n---\n\n${notes.length > 3 ? `还有 ${notes.length - 3} 条笔记可作为补充素材。` : ""}`;

    case "connect":
      return `## 今日所思\n\n${notes
        .map((n) => n.content.trim())
        .join(" ")}\n\n---\n\n💡 写作提示：试着找出上述内容之间的共同主题，用过渡句把它们串起来。`;

    case "argue":
      return `## 核心观点\n\n${notes[0]?.content.trim() ?? ""}\n\n## 论据与支撑\n\n${notes
        .slice(1)
        .map((n) => `- ${n.content.trim()}`)
        .join("\n")}\n\n## 结论\n\n（在此写出你的判断……）`;

    case "story":
      return `今天，我有了这些想法：\n\n${notes
        .map((n) => n.content.trim())
        .join("\n\n")}\n\n---\n\n💡 写作提示：用第一人称，按时间或情绪线索重新组织以上内容。`;

    default:
      return blocks;
  }
}

export function getWritingTips(notesCount: number): string[] {
  const tips = [
    "先写再改：不要追求第一遍完美，把想法倒出来最重要",
    "一个段落只表达一个观点，避免信息堆砌",
    "用具体例子代替抽象形容，读者更容易理解",
    "写完后大声读一遍，感受节奏是否顺畅",
  ];
  if (notesCount >= 5) tips.unshift("今日素材丰富，试着找出 1 个主线观点贯穿全文");
  if (notesCount <= 2) tips.unshift("素材较少时，可以深入展开一个观点而非贪多");
  return tips.slice(0, 3);
}
