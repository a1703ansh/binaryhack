import { Prisma } from '@prisma/client';
import {
  INITIAL_INCOME_SOURCES,
  INITIAL_SAVINGS_GOALS,
  INITIAL_INVESTMENT_CATEGORIES,
  generateInitial30DayTransactions
} from '@earnwise/shared';

/**
 * Onboard a user with a realistic persistent starting ledger.
 * Every new account — including the demo user — gets this data in their own DB.
 */
export async function createUserWithOnboardData(
  tx: Prisma.TransactionClient,
  userId: string
) {
  // Ledger accounts (benchmark snapshot — matches the demo profile)
  const accounts = {
    SPENDABLE: 17710,
    EMERGENCY: 10500,
    VEHICLE: 4500,
    TAX: 3400,
    INVESTED: 2100
  } as const;

  await tx.ledgerAccount.createMany({
    data: (Object.keys(accounts) as (keyof typeof accounts)[]).map((type) => ({
      userId,
      type,
      balance: accounts[type]
    }))
  });

  // Savings settings
  await tx.savingsSettings.create({
    data: {
      userId,
      minimumBalance: 5000,
      monthlySavingsTarget: 5000,
      emergencyFundTarget: 25000,
      autoSaveActive: true,
      pausedToday: false,
      skipToday: false,
      maxMonthlyCap: 8000
    }
  });

  // Income sources
  await tx.incomeSource.createMany({
    data: INITIAL_INCOME_SOURCES.map((s) => ({
      userId,
      name: s.name,
      type: s.type,
      connected: s.connected,
      monthlyTotal: s.monthlyTotal,
      lastPayoutDate: null,
      payoutFrequency: s.payoutFrequency,
      color: s.color
    }))
  });

  // 30-day transaction history (for forecasting)
  const transactions = generateInitial30DayTransactions();
  await tx.transaction.createMany({
    data: transactions.map((t) => ({
      userId,
      source: t.source,
      amount: t.amount,
      date: new Date(t.date),
      description: t.description,
      status: t.status,
      autoSavedAmount: t.autoSavedAmount,
      taxReservedAmount: t.taxReservedAmount,
      investRecommendedAmount: t.investRecommendedAmount,
      spendableAmount: t.spendableAmount,
      kind: 'import'
    }))
  });

  // Savings goals
  await tx.savingsGoal.createMany({
    data: INITIAL_SAVINGS_GOALS.map((g) => ({
      userId,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline,
      priority: g.priority,
      category: g.category,
      icon: g.icon
    }))
  });

  // Tax profile
  await tx.taxProfile.create({
    data: {
      userId,
      estimatedAnnualIncome: 342000,
      taxAlreadyReserved: 3400,
      mockTaxRate: 10,
      quarterlyDueDate: 'March 15, 2027',
      quarterlyDaysRemaining: 24,
      readinessPercentage: 68
    }
  });

  // Investment profile
  await tx.investmentProfile.create({
    data: {
      userId,
      riskLevel: 'Balanced',
      score: 68,
      savingConsistency: 84,
      incomeVolatility: 'Moderate',
      emergencyFundProgress: 42,
      withdrawalFrequency: 'Low',
      goalHorizonMonths: 18,
      explanation: "Balanced — your savings consistency (84%) is robust, but your income exhibits moderate volatility. EarnWise prioritizes liquidity first, then conservative growth."
    }
  });

  // Initial expenses (behavioral signals for safe-spending)
  const expenses = [
    { date: new Date(), amount: 450, category: 'Fuel', note: 'HP Petrol Pump refuel (Tank fill)', receiptStatus: 'verified' },
    { date: new Date(Date.now() - 86400000), amount: 220, category: 'Food', note: 'Mid-shift lunch & hydration', receiptStatus: 'manual' },
    { date: new Date(Date.now() - 3 * 86400000), amount: 650, category: 'Vehicle Maintenance', note: 'Engine oil top-up & brake tightening', receiptStatus: 'verified' },
    { date: new Date(Date.now() - 5 * 86400000), amount: 399, category: 'Phone/Data', note: 'Jio 5G 3-Month high-speed gig data pack', receiptStatus: 'verified' }
  ];
  await tx.expense.createMany({
    data: expenses.map((e) => ({ userId, ...e }))
  });

  // Welcome chat message
  await tx.chatMessage.create({
    data: {
      userId,
      sender: 'assistant',
      text: "Hello! I am your EarnWise financial copilot. Ask me anything about your safe spending, today's auto-save decision, or tax reserves.",
      chips: JSON.stringify([
        "How much can I safely spend this week?",
        "Why did you save ₹150 today?",
        "How much tax have I reserved?",
        "What is my emergency fund status?"
      ])
    }
  });

  // Initial activity logs documenting onboarding
  const initialLogs = [
    {
      userId,
      type: 'SYSTEM_ALERT' as const,
      title: 'EarnWise profile created',
      amount: 0,
      reason: 'Your financial workspace was provisioned with your connected gig platforms, ledger accounts, and savings goals.',
      canUndo: false,
      undone: false
    },
    {
      userId,
      type: 'SYSTEM_ALERT' as const,
      title: '30-day income history imported',
      amount: 28450,
      reason: 'Income intelligence scanned your recent settlements to calibrate your 30-day earning average for smarter auto-save decisions.',
      canUndo: false,
      undone: false
    }
  ];
  await tx.automationLog.createMany({ data: initialLogs });

  return { accounts, transactions };
}

export const INVESTMENT_CATEGORIES = INITIAL_INVESTMENT_CATEGORIES;