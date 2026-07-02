import type { ReadingGoal } from "../types";
import { getGoalDisplayName, getListLabel } from "../utils";
import { ProgressFromBooks } from "./ProgressBar";

export function GoalCard({
  goal,
  allGoals,
  onClick,
}: {
  goal: ReadingGoal;
  allGoals: ReadingGoal[];
  onClick: () => void;
}) {
  return (
    <article className="card goal-card" onClick={onClick}>
      <div className="goal-card__list">{getListLabel(goal.id, allGoals)}</div>
      <div className="goal-card__title">{getGoalDisplayName(goal.pathName)}</div>
      <div className="goal-card__desc">{goal.title}</div>
      {goal.lastQuiz && (
        <div className="goal-card__quiz">上次测验 {goal.lastQuiz.percent}% · {goal.lastQuiz.levelLabel}</div>
      )}
      <ProgressFromBooks books={goal.books} />
    </article>
  );
}
