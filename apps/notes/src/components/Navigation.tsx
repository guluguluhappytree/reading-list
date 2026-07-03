import type { Page } from "../types";

const ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "capture", label: "记录", icon: "✎" },
  { id: "library", label: "归类", icon: "▦" },
  { id: "write", label: "成文", icon: "¶" },
  { id: "search", label: "搜索", icon: "⌕" },
];

export function Navigation({ current, onChange }: { current: Page; onChange: (p: Page) => void }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${current === item.id ? "active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          <span className="nav-item__icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
