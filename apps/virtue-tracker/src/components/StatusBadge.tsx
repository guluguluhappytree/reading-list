import type { DayStatus } from "../types";

interface StatusBadgeProps {
  status: DayStatus;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeMap = { sm: 28, md: 36, lg: 48 };
  const px = sizeMap[size];

  if (status === "success") {
    return (
      <span
        className="status-icon status-icon--success"
        style={{ width: px, height: px, fontSize: size === "lg" ? "1.5rem" : "1.125rem" }}
        aria-label="做到了"
      >
        ✓
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span
        className="status-icon status-icon--fail"
        style={{ width: px, height: px, fontSize: size === "lg" ? "1.5rem" : "1.125rem" }}
        aria-label="没做到"
      >
        ✗
      </span>
    );
  }
  return (
    <span
      className="status-icon status-icon--pending"
      style={{ width: px, height: px }}
      aria-label="未记录"
    >
      ·
    </span>
  );
}
