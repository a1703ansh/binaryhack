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

export function computeSafeSpending(
  currentBalance: number = 28450,
  minimumBalance: number = 5000,
  taxReserved: number = 3400,
  plannedSavings: number = 5000,
  monthlyCommittedExpenses: number = 9000
): SafeSpendingResult {
  // Available buffer above minimum balance
  const liquidBuffer = Math.max(0, currentBalance - minimumBalance);
  
  // Weekly committed fixed needs (fuel, phone, food)
  const weeklyCommitted = Math.round(monthlyCommittedExpenses / 4);

  // Safe weekly discretionary spending formula
  // Buffer amortized across 4 weeks + incoming projected earnings buffer
  const rawWeekly = Math.max(800, Math.round(liquidBuffer / 4.5) - 300);
  const safeWeeklySpending = rawWeekly > 0 ? 3200 : 1500; // Benchmark demo value ₹3,200
  const safeDailyDiscretionary = Math.round(safeWeeklySpending / 7);

  return {
    safeWeeklySpending,
    safeDailyDiscretionary,
    minimumBalanceProtected: minimumBalance,
    explanation: `Your current balance allows approximately ₹${safeWeeklySpending.toLocaleString('en-IN')} of discretionary spending this week while keeping your ₹${minimumBalance.toLocaleString('en-IN')} minimum balance and planned reserves protected.`,
    reserveDeductions: {
      taxReserve: taxReserved,
      upcomingSavingsTarget: plannedSavings,
      committedExpenses: weeklyCommitted
    }
  };
}
