import type { SavingsGoal } from './types.js';

/**
 * The only goal fields the 70/30 waterfall reads. Narrowing to this keeps the
 * helpers usable straight from Prisma rows (where dates are `Date`, not `string`).
 */
export type GoalAllocationTarget = Pick<
  SavingsGoal,
  'id' | 'category' | 'currentAmount' | 'targetAmount'
>;

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 25000,
    currentAmount: 10500,
    deadline: 'June 2027',
    priority: 'High',
    category: 'Emergency',
    icon: 'ShieldAlert'
  },
  {
    id: 'goal-2',
    name: 'Vehicle Maintenance & Tyre Replacement',
    targetAmount: 10000,
    currentAmount: 4500,
    deadline: 'April 2027',
    priority: 'High',
    category: 'Vehicle',
    icon: 'Bike'
  },
  {
    id: 'goal-3',
    name: 'Diwali Festival Fund',
    targetAmount: 8000,
    currentAmount: 2000,
    deadline: 'November 2027',
    priority: 'Medium',
    category: 'Festival',
    icon: 'Sparkles'
  }
];

/**
 * Exact per-goal deltas that allocateSavedAmountToGoals would apply.
 * Recorded on each auto-save log so Undo can reverse the waterfall precisely.
 */
export function computeGoalDeltas(
  goals: GoalAllocationTarget[],
  savedAmount: number
): { goalId: string; amount: number }[] {
  if (savedAmount <= 0) return [];

  const deltas: { goalId: string; amount: number }[] = [];

  for (const goal of goals) {
    if (goal.category === 'Emergency' && goal.currentAmount < goal.targetAmount) {
      const topUp = Math.min(Math.round(savedAmount * 0.70), goal.targetAmount - goal.currentAmount);
      if (topUp > 0) deltas.push({ goalId: goal.id, amount: topUp });
    } else if (goal.category === 'Vehicle' && goal.currentAmount < goal.targetAmount) {
      const topUp = Math.min(Math.round(savedAmount * 0.30), goal.targetAmount - goal.currentAmount);
      if (topUp > 0) deltas.push({ goalId: goal.id, amount: topUp });
    }
  }

  return deltas;
}

export function allocateSavedAmountToGoals(
  goals: GoalAllocationTarget[],
  savedAmount: number
): GoalAllocationTarget[] {
  if (savedAmount <= 0) return goals;

  return goals.map(goal => {
    if (goal.category === 'Emergency' && goal.currentAmount < goal.targetAmount) {
      const topUp = Math.round(savedAmount * 0.70);
      return {
        ...goal,
        currentAmount: Math.min(goal.targetAmount, goal.currentAmount + topUp)
      };
    }
    if (goal.category === 'Vehicle' && goal.currentAmount < goal.targetAmount) {
      const topUp = Math.round(savedAmount * 0.30);
      return {
        ...goal,
        currentAmount: Math.min(goal.targetAmount, goal.currentAmount + topUp)
      };
    }
    return goal;
  });
}