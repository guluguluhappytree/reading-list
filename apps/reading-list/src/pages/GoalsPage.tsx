import type { ReadingGoal } from "../types";

import { GoalCard } from "../components/GoalCard";



export function GoalsPage({

  goals,

  onGoalClick,

}: {

  goals: ReadingGoal[];

  onGoalClick: (goal: ReadingGoal) => void;

}) {

  return (

    <div className="fade-in">

      <div className="tip-box">

        设定阅读目标，自动生成权威书单。写笔记、标记已读，读完后做结业测验

      </div>



      {goals.length === 0 ? (

        <div className="empty">还没有阅读目标，点右下角 ＋ 创建第一个书单</div>

      ) : (

        goals.map((g) => (

          <GoalCard key={g.id} goal={g} allGoals={goals} onClick={() => onGoalClick(g)} />

        ))

      )}

    </div>

  );

}

