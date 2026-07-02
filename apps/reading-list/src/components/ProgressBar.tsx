import { getProgress, type Book } from "../types";

export function ProgressBar({
  read,
  total,
  percent,
  showLabel = true,
}: {
  read: number;
  total: number;
  percent: number;
  showLabel?: boolean;
}) {
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      {showLabel && (
        <div className="progress-label">
          <span>{read} / {total} 本已读</span>
          <span>{percent}%</span>
        </div>
      )}
    </div>
  );
}

export function ProgressFromBooks({ books }: { books: Book[] }) {
  const p = getProgress(books);
  return <ProgressBar {...p} />;
}
