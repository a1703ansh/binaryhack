import { SavingsGoal } from '../types/index.ts';

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

export function allocateSavedAmountToGoals(
  goals: SavingsGoal[],
  savedAmount: number
): SavingsGoal[] {
  if (savedAmount <= 0) return goals;
  
  // Allocate 70% to Emergency Fund if not full, remainder to next highest priority
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
