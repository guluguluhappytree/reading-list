export type DayStatus = "success" | "fail" | null;

export type TrackingMode = "franklin" | "multi";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  /** 目标时长（小时），仅展示用 */
  targetHours?: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  status: DayStatus;
}

/** 多轨模式：每天每项习惯独立打卡 */
export interface MultiDayRecord {
  date: string;
  statuses: Record<string, DayStatus>;
}

export interface WeekSession {
  id: string;
  habitId: string;
  habitName: string;
  cycleNumber: number;
  weekIndex: number;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string; // YYYY-MM-DD (Sunday)
  records: DayRecord[];
  trackingMode?: TrackingMode;
  multiRecords?: MultiDayRecord[];
  /** 多轨模式归档时的习惯名称快照 */
  multiHabitLabels?: { id: string; name: string; targetHours?: number }[];
}

export interface AppState {
  habits: Habit[];
  currentHabitIndex: number;
  cycleNumber: number;
  weekStartDate: string;
  currentWeekRecords: DayRecord[];
  multiWeekRecords: MultiDayRecord[];
  trackingMode: TrackingMode;
  weekHistory: WeekSession[];
  graduated: boolean;
  setupComplete: boolean;
}

export type Page = "daily" | "weekly" | "history";

export const STORAGE_KEY = "virtue-tracker-state-v1";

export const TRACKING_MODE_LABELS: Record<TrackingMode, string> = {
  franklin: "富兰克林 · 每周一项",
  multi: "多轨并行 · 每日全打卡",
};

/** 每日四件事模板（工作向） */
export const DAILY_FOUR_GOALS: Omit<Habit, "id">[] = [
  {
    name: "学习",
    description: "AI、商业、阅读",
    targetHours: 1,
  },
  {
    name: "产品",
    description: "儿童故事、AI 工具等",
    targetHours: 2,
  },
  {
    name: "内容",
    description: "短视频、图文、复盘",
    targetHours: 2,
  },
  {
    name: "复盘",
    description: "数据、收入、问题、第二天计划",
    targetHours: 1,
  },
];

/** 生活五习惯模板 */
export const LIFESTYLE_FIVE_HABITS: Omit<Habit, "id">[] = [
  { name: "早睡", description: "晚上 10 点前" },
  { name: "早起", description: "早上 6 点前" },
  { name: "早起阅读", description: "1 小时", targetHours: 1 },
  { name: "少刷手机", description: "少于 2 小时", targetHours: 2 },
  { name: "每天运动", description: "30 分钟以上" },
];

export const FRANKLIN_VIRTUES: Omit<Habit, "id">[] = [
  { name: "节制", description: "食不过饱，饮不过量" },
  { name: "沉默", description: "言必有益，避免闲谈" },
  { name: "秩序", description: "物归其位，事有定时" },
  { name: "决心", description: "该做必做，做则做好" },
  { name: "节俭", description: "只花该花，不浪费一分" },
  { name: "勤奋", description: "珍惜时间，从事有益之事" },
  { name: "真诚", description: "不欺骗，不伤害，思想正当" },
  { name: "公正", description: "不冤枉，不遗漏应尽之责" },
  { name: "中庸", description: "避免极端，容忍伤害" },
  { name: "清洁", description: "身体、衣着、居所保持洁净" },
  { name: "平静", description: "不为琐事或不可避免之事烦扰" },
  { name: "贞洁", description: "少行房事，不损体气与声誉" },
  { name: "谦逊", description: "效法耶稣与苏格拉底" },
];
