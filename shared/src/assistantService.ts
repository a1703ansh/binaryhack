export interface AssistantContext {
  userName: string;
  currentBalance: number;
  minimumBalance: number;
  savedThisMonth: number;
  savingsTarget: number;
  todayIncome: number;
  todaySaved: number;
  taxReserved: number;
  investedTotal: number;
  emergencyFundCurrent: number;
  emergencyFundTarget: number;
  safeWeeklySpending: number;
  averageDailyIncome: number;
  lastSaveReason?: string;
  isAutoSavePaused?: boolean;
}

export function generateAssistantReply(
  query: string,
  ctx: AssistantContext
): string {
  const q = query.toLowerCase();

  if (q.includes('safely spend') || q.includes('safe to spend') || q.includes('how much can i spend')) {
    return `Based on your current balance of ₹${ctx.currentBalance.toLocaleString('en-IN')}, minimum balance protection of ₹${ctx.minimumBalance.toLocaleString('en-IN')}, and upcoming tax/savings commitments, you have approximately ₹${ctx.safeWeeklySpending.toLocaleString('en-IN')} available for discretionary spending this week (about ₹${Math.round(ctx.safeWeeklySpending / 7).toLocaleString('en-IN')}/day).`;
  }

  if (q.includes('why did you save') || q.includes('save 150') || q.includes('why 150') || q.includes('reason for saving')) {
    return ctx.lastSaveReason ||
      `Your payout was ₹${ctx.todayIncome.toLocaleString('en-IN')}, which is above your usual 30-day daily average of ₹${ctx.averageDailyIncome.toLocaleString('en-IN')}. Because this was a stronger earning day, EarnWise automatically saved ₹${ctx.todaySaved.toLocaleString('en-IN')} (approx 12%) while keeping your ₹${ctx.minimumBalance.toLocaleString('en-IN')} minimum balance protected.`;
  }

  if (q.includes('tax') || q.includes('tax reserved') || q.includes('advance tax')) {
    return `You have currently reserved ₹${ctx.taxReserved.toLocaleString('en-IN')} toward your estimated tax provisions. This puts your quarterly tax readiness at 68% ahead of the upcoming March advance tax reminder.`;
  }

  if (q.includes('emergency') || q.includes('emergency fund')) {
    const pct = Math.round((ctx.emergencyFundCurrent / ctx.emergencyFundTarget) * 100);
    return `Your Emergency Fund currently stands at ₹${ctx.emergencyFundCurrent.toLocaleString('en-IN')} out of your ₹${ctx.emergencyFundTarget.toLocaleString('en-IN')} milestone (${pct}% funded). You have enough buffer for roughly 1.2 months of essential living expenses.`;
  }

  if (q.includes('pause') || q.includes('stop')) {
    return `You have 100% control over your money. You can pause Auto-Save anytime from the Auto-Save tab or by clicking 'Pause Today'. When paused, EarnWise will not deduct savings for today's payouts and will automatically prompt you before resuming tomorrow.`;
  }

  if (q.includes('invest') || q.includes('portfolio') || q.includes('mutual fund')) {
    return `You have invested ₹${ctx.investedTotal.toLocaleString('en-IN')} across diversified low-volatility assets: Liquid Funds (40%), Index Funds (30%), Flexi Recurring Deposits (20%), and 24K Digital Gold (10%). This allocation is tailored to your 'Balanced' gig profile.`;
  }

  // Fallback grounded answer
  return `Hello ${ctx.userName}! Here is your current financial posture: You have ₹${ctx.currentBalance.toLocaleString('en-IN')} in spendable liquidity, ₹${ctx.savedThisMonth.toLocaleString('en-IN')} saved this month toward your ₹${ctx.savingsTarget.toLocaleString('en-IN')} goal, and ₹${ctx.taxReserved.toLocaleString('en-IN')} set aside for taxes. You can safely spend ₹${ctx.safeWeeklySpending.toLocaleString('en-IN')} this week. How else can I assist you?`;
}