import {
  calculateIncomeForecast,
  calculateFinancialHealth,
  computeSafeSpending,
  type TaxProfile
} from '@earnwise/shared';
import { prisma } from '../db.js';

function formatClock(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}, ${h12}:${minutes} ${period}`;
}

function formatRelative(date: Date, now = new Date()): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays <= 0) return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export interface DashboardPayload {
  user: { id: string; name: string; email: string; occupation: string };
  month: { income: number; saved: number; invested: number; taxReserved: number; spendable: number };
  ledgers: Record<string, number>;
  currentBalance: number;
  todayAction: {
    payoutAmount: number;
    recommendedSave: number;
    recommendedInvest: number;
    recommendedTax: number;
    availableSpendable: number;
    reason: string;
    details: {
      incomeComparison: string;
      guardrailStatus: string;
      taxStatus: string;
      investmentRationale: string;
    } | null;
  };
  financialHealth: ReturnType<typeof calculateFinancialHealth>;
  safeSpending: ReturnType<typeof computeSafeSpending>;
  forecast: ReturnType<typeof calculateIncomeForecast>;
  incomeSources: unknown[];
  transactions: unknown[];
  expenses: unknown[];
  goals: unknown[];
  settings: unknown;
  investmentProfile: unknown;
  taxProfile: TaxProfile;
  logs: unknown[];
  chatMessages: unknown[];
  investmentCategories: unknown[];
}

export async function buildDashboard(userId: string): Promise<DashboardPayload> {
  const [user, accounts, settings, goals, taxProfile, investmentProfile, incomeSources, transactions, expenses, logs, chats] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.ledgerAccount.findMany({ where: { userId } }),
      prisma.savingsSettings.findUniqueOrThrow({ where: { userId } }),
      prisma.savingsGoal.findMany({ where: { userId } }),
      prisma.taxProfile.findUniqueOrThrow({ where: { userId } }),
      prisma.investmentProfile.findUniqueOrThrow({ where: { userId } }),
      prisma.incomeSource.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 }),
      prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 }),
      prisma.automationLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.chatMessage.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })
    ]);

  const accountMap = new Map(accounts.map((a) => [a.type, a.balance]));
  const getBalance = (type: string) => accountMap.get(type as never) ?? 0;
  const spendableBalance = getBalance('SPENDABLE');

  // Month aggregates from all transactions (income history + payouts)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthTx = transactions.filter((t) => t.date >= monthStart);
  const sum = (arr: typeof monthTx, key: keyof typeof monthTx[number]) =>
    arr.reduce((acc, t) => acc + ((t[key] ?? 0) as number), 0);

  const month = {
    income: sum(monthTx, 'amount'),
    saved: sum(monthTx, 'autoSavedAmount'),
    invested: sum(monthTx, 'investRecommendedAmount'),
    taxReserved: sum(monthTx, 'taxReservedAmount'),
    spendable: sum(monthTx, 'spendableAmount')
  };

  // Forecast (last N transactions including imports)
  const forecast = calculateIncomeForecast(
    transactions.map((t) => ({
      id: t.id,
      source: t.source as never,
      amount: t.amount,
      date: t.date.toISOString().split('T')[0],
      description: t.description,
      status: t.status as 'Received'
    }))
  );

  // Trailing 30-day expenses feed safe spending live
  const trailingCutoff = new Date(Date.now() - 30 * 86400000);
  const trailingMonthlyExpenses = expenses
    .filter((e) => e.date >= trailingCutoff)
    .reduce((acc, e) => acc + e.amount, 0);

  const safeSpending = computeSafeSpending(
    spendableBalance,
    settings.minimumBalance,
    getBalance('TAX'),
    settings.monthlySavingsTarget,
    Math.max(trailingMonthlyExpenses, 1600)
  );

  // Today's action from the most recent payout run
  const lastRun = await prisma.payoutRun.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
  const todayAction = lastRun
    ? {
        payoutAmount: lastRun.amount,
        recommendedSave: lastRun.saveAmount,
        recommendedInvest: lastRun.investRecommendAmount,
        recommendedTax: lastRun.taxReserveAmount,
        availableSpendable: lastRun.spendableAmount,
        reason: lastRun.reason,
        details: JSON.parse(lastRun.explanationDetails) as DashboardPayload['todayAction']['details']
      }
    : {
        payoutAmount: 0,
        recommendedSave: 0,
        recommendedInvest: 0,
        recommendedTax: 0,
        availableSpendable: 0,
        reason: 'Process your first payout to see a live auto-save plan.',
        details: null as null
      };

  // Financial health — derived from real ledger + behavior
  const emergencyFundProgress = (getBalance('EMERGENCY') / (settings.emergencyFundTarget || 1)) * 100;
  const volatility = forecast.volatility;
  const incomeStability = volatility === 'Low' ? 90 : volatility === 'Moderate' ? 72 : 55;
  const savingsConsistency = Math.max(20, Math.min(100, Math.round((month.saved / (settings.monthlySavingsTarget || 1)) * 100)));
  const investmentDiscipline = Math.min(100, 74 + Math.floor(getBalance('INVESTED') / 1000));
  const financialHealth = calculateFinancialHealth(
    emergencyFundProgress,
    taxProfile.readinessPercentage,
    savingsConsistency,
    incomeStability,
    investmentDiscipline
  );

  const taxProfileDto: TaxProfile = {
    estimatedAnnualIncome: taxProfile.estimatedAnnualIncome,
    taxAlreadyReserved: taxProfile.taxAlreadyReserved,
    mockTaxRate: taxProfile.mockTaxRate / 100,
    quarterlyDueDate: taxProfile.quarterlyDueDate,
    quarterlyDaysRemaining: taxProfile.quarterlyDaysRemaining,
    readinessPercentage: taxProfile.readinessPercentage
  };

  return {
    user: { id: user.id, name: user.name, email: user.email, occupation: user.occupation },
    month,
    ledgers: Object.fromEntries(accountMap),
    currentBalance: spendableBalance,
    todayAction,
    financialHealth,
    safeSpending,
    forecast,
    taxProfile: taxProfileDto,
    incomeSources: incomeSources.map((s) => ({
      id: s.id,
      name: s.name,
      connected: s.connected,
      type: s.type,
      monthlyTotal: s.monthlyTotal,
      lastPayoutDate: s.lastPayoutDate ? formatRelative(s.lastPayoutDate) : '—',
      payoutFrequency: s.payoutFrequency,
      color: s.color
    })),
    transactions: transactions.map((t) => ({
      id: t.id,
      source: t.source,
      amount: t.amount,
      date: t.date.toISOString().split('T')[0],
      description: t.description,
      status: t.status,
      autoSavedAmount: t.autoSavedAmount,
      taxReservedAmount: t.taxReservedAmount,
      investRecommendedAmount: t.investRecommendedAmount,
      spendableAmount: t.spendableAmount
    })),
    expenses: expenses.map((e) => ({
      id: e.id,
      date: formatClock(e.date),
      amount: e.amount,
      category: e.category,
      note: e.note,
      receiptStatus: e.receiptStatus,
      receiptPath: e.receiptPath ?? undefined
    })),
    goals: goals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline ?? '',
      priority: g.priority,
      category: g.category,
      icon: g.icon
    })),
    settings: {
      minimumBalance: settings.minimumBalance,
      monthlySavingsTarget: settings.monthlySavingsTarget,
      emergencyFundTarget: settings.emergencyFundTarget,
      autoSaveActive: settings.autoSaveActive,
      pausedToday: settings.pausedToday,
      skipToday: settings.skipToday,
      maxMonthlyCap: settings.maxMonthlyCap
    },
    investmentProfile: {
      riskLevel: investmentProfile.riskLevel,
      score: investmentProfile.score,
      factors: {
        savingConsistency: investmentProfile.savingConsistency,
        incomeVolatility: investmentProfile.incomeVolatility,
        emergencyFundProgress: investmentProfile.emergencyFundProgress,
        withdrawalFrequency: investmentProfile.withdrawalFrequency,
        goalHorizonMonths: investmentProfile.goalHorizonMonths
      },
      explanation: investmentProfile.explanation
    },
    logs: logs.map((l) => ({
      id: l.id,
      timestamp: formatRelative(l.createdAt),
      type: l.type.toLowerCase().replace('_', '-'),
      title: l.title,
      amount: l.amount,
      reason: l.reason,
      canUndo: l.canUndo,
      undone: l.undone,
      payoutAmount: l.payoutAmount ?? undefined,
      spendableRemaining: l.spendableRemaining ?? undefined
    })),
    chatMessages: chats.map((c) => ({
      id: c.id,
      sender: c.sender,
      text: c.text,
      timestamp: formatRelative(c.createdAt),
      chips: c.chips ? JSON.parse(c.chips) : undefined
    })),
    investmentCategories: []
  };
}