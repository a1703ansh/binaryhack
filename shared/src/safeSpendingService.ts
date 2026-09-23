export interface SafeSpendingResult {
  safeWeeklySpending: number;
  safeDailyDiscretionary: number;
  minimumBalanceProtected: number;
  explanation: string;
  reserveDeductions: {
    taxReserve: number;
    upcomingSavingsTarget: number;
    committedExpenses: number;
  };
}

/**
 * Safe-to-Spend calculator.
 *
 * Formula (explainable in plain English):
 *   liquidBuffer       = currentBalance - minimumBalance - taxReserved
 *   weeklyCommitted    = trailing monthly operating expenses / 4.3
 *   safeWeeklySpending = liquidBuffer / 4 - weeklyCommitted   (floored at 0, rounded to ₹10)
 *
 * Every rupee of tracked operating expense genuinely reduces the allowance,
 * which is why the Expenses module feeds this calculation live.
 */
export function computeSafeSpending(
  currentBalance: number = 17710,
  minimumBalance: number = 5000,
  taxReserved: number = 3400,
  plannedSavings: number = 5000,
  trailingMonthlyExpenses: number = 1600
): SafeSpendingResult {
  const liquidBuffer = Math.max(0, currentBalance - minimumBalance - taxReserved);

  const weeklyCommitted = Math.round(trailingMonthlyExpenses / 4.3);

  const rawWeekly = Math.round(liquidBuffer / 4) - weeklyCommitted;
  const safeWeeklySpending = Math.max(0, Math.round(rawWeekly / 10) * 10);
  const safeDailyDiscretionary = Math.round(safeWeeklySpending / 7);

  return {
    safeWeeklySpending,
    safeDailyDiscretionary,
    minimumBalanceProtected: minimumBalance,
    explanation: `You have ₹${Math.round(liquidBuffer).toLocaleString('en-IN')} above your protected ₹${minimumBalance.toLocaleString('en-IN')} floor and ₹${taxReserved.toLocaleString('en-IN')} tax reserve. After your ~₹${weeklyCommitted.toLocaleString('en-IN')}/week average operating costs (from tracked expenses), about ₹${safeWeeklySpending.toLocaleString('en-IN')} is safe to spend this week — keeping your floor intact.`,
    reserveDeductions: {
      taxReserve: taxReserved,
      upcomingSavingsTarget: plannedSavings,
      committedExpenses: weeklyCommitted
    }
  };
}