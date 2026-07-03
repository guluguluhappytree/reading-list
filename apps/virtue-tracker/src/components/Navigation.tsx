import type { Page } from "../types";

interface NavigationProps {
  current: Page;
  onChange: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "daily", label: "今日", icon: "○" },
  { id: "weekly", label: "本周", icon: "▦" },
  { id: "history", label: "汇总", icon: "≡" },
];

export function Navigation({ current, onChange }: NavigationProps) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="主导航">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${current === item.id ? "active" : ""}`}
          onClick={() => onChange(item.id)}
          aria-current={current === item.id ? "page" : undefined}
        >
          <span className="nav-item__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="nav-item__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
