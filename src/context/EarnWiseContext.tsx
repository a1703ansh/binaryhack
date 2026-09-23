import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  IncomeSource,
  IncomeTransaction,
  Expense,
  SavingsSettings,
  SavingsGoal,
  InvestmentProfile,
  TaxProfile,
  AutomationLog,
  FinancialHealthScore,
  ChatMessage,
  DecisionResult,
  ForecastMetrics,
  SafeSpendingResult
} from '@earnwise/shared';
import { api, ApiError } from '../api/client';
import { useAuth } from './AuthContext';

export interface EarnWiseContextType {
  // Profile
  userName: string;
  occupation: string;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  resetToDemoBenchmark: () => void;

  // Key Financial Cards (This Month)
  monthIncome: number;
  monthSaved: number;
  monthInvested: number;
  monthTaxReserved: number;
  monthSpendable: number;
  currentBalance: number;

  // Financial Health
  financialHealth: FinancialHealthScore;

  // Today's Action Recommendation
  todayAction: {
    payoutAmount: number;
    recommendedSave: number;
    recommendedInvest: number;
    recommendedTax: number;
    availableSpendable: number;
    reason: string;
    details?: DecisionResult['explanationDetails'];
  };

  // Income Intelligence
  incomeSources: IncomeSource[];
  transactions: IncomeTransaction[];
  forecast: ForecastMetrics;
  addIncomeSource: (name: Platform, type: IncomeSource['type']) => void;
  simulatePlatformConnection: (name: Platform) => Promise<void>;
  importIncomeTransactions: (txs: IncomeTransaction[]) => void;

  // Auto-Save Engine
  savingsSettings: SavingsSettings;
  updateSavingsSettings: (settings: Partial<SavingsSettings>) => void;
  togglePauseAutoSave: () => void;
  skipTodayAutoSave: () => void;
  undoAutoSave: (logId: string) => void;

  // Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;

  // Investment
  investmentProfile: InvestmentProfile;
  pendingInvestPool: number;
  approveInvestmentPlan: (amount: number) => void;

  // Tax Copilot
  taxProfile: TaxProfile;
  updateTaxReserve: (additional: number) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  // Safe Spending
  safeSpending: SafeSpendingResult;

  // Automation Log
  activityLogs: AutomationLog[];

  // Assistant
  chatMessages: ChatMessage[];
  sendAssistantMessage: (text: string) => void;

  // Core Demo Action: New Payout Simulator
  isSimulatingPayout: boolean;
  simulateNewPayout: (source: Platform, amount: number) => Promise<DecisionResult>;

  // Data-readiness signal (true once the live dashboard has loaded)
  ready: boolean;

  // Re-pull the live dashboard from the API
  refresh: () => Promise<void>;
}

interface DashboardPayload {
  user: { id: string; name: string; email: string; occupation: string };
  month: { income: number; saved: number; invested: number; taxReserved: number; spendable: number };
  ledgers: Record<string, number>;
  currentBalance: number;
  todayAction: EarnWiseContextType['todayAction'];
  financialHealth: FinancialHealthScore;
  safeSpending: SafeSpendingResult;
  forecast: ForecastMetrics;
  incomeSources: IncomeSource[];
  transactions: IncomeTransaction[];
  expenses: Expense[];
  goals: SavingsGoal[];
  settings: SavingsSettings;
  investmentProfile: InvestmentProfile;
  taxProfile: TaxProfile;
  logs: AutomationLog[];
  chatMessages: ChatMessage[];
}

const EMPTY: DashboardPayload = {
  user: { id: '', name: '', email: '', occupation: '' },
  month: { income: 0, saved: 0, invested: 0, taxReserved: 0, spendable: 0 },
  ledgers: {},
  currentBalance: 0,
  todayAction: {
    payoutAmount: 0, recommendedSave: 0, recommendedInvest: 0, recommendedTax: 0,
    availableSpendable: 0, reason: '', details: null as never
  },
  financialHealth: { overall: 0, incomeStability: 0, savingsConsistency: 0, emergencyFund: 0, taxReadiness: 0, investmentDiscipline: 0, summary: '' },
  safeSpending: {
    safeWeeklySpending: 0, safeDailyDiscretionary: 0, minimumBalanceProtected: 0, explanation: '',
    reserveDeductions: { taxReserve: 0, upcomingSavingsTarget: 0, committedExpenses: 0 }
  },
  forecast: {
    todayIncome: 0, sevenDayIncome: 0, thirtyDayIncome: 0, averageDailyIncome: 0, sevenDayAverage: 0,
    trendPercentage: 0, volatility: 'Low', forecastNext7DaysMin: 0, forecastNext7DaysMax: 0,
    historicalChartData: []
  },
  incomeSources: [],
  transactions: [],
  expenses: [],
  goals: [],
  settings: { minimumBalance: 5000, monthlySavingsTarget: 5000, emergencyFundTarget: 25000, autoSaveActive: true, pausedToday: false, skipToday: false, maxMonthlyCap: 8000 },
  investmentProfile: {
    riskLevel: 'Balanced', score: 0,
    factors: { savingConsistency: 0, incomeVolatility: 'Low', emergencyFundProgress: 0, withdrawalFrequency: 'Low', goalHorizonMonths: 0 },
    explanation: ''
  },
  taxProfile: { estimatedAnnualIncome: 0, taxAlreadyReserved: 0, mockTaxRate: 0.1, quarterlyDueDate: '', quarterlyDaysRemaining: 0, readinessPercentage: 0 },
  logs: [],
  chatMessages: []
};

const EarnWiseContext = createContext<EarnWiseContextType | undefined>(undefined);

export const EarnWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [isDemoMode, setDemoModeState] = useState(true);
  const [isSimulatingPayout, setIsSimulatingPayout] = useState(false);

  const refreshDashboard = useCallback(async () => {
    const data = await api.get<DashboardPayload>('/dashboard');
    setDashboard(data);
  }, []);

  useEffect(() => {
    if (user) {
      // oxlint-disable-next-line react/set-state-in-effect -- dashboard must be pulled once the session resolves
      refreshDashboard().catch((err) => console.warn('[earnwise] dashboard load failed', err));
    } else {
      setDashboard(null);
    }
  }, [user, refreshDashboard]);

  const setDemoMode = useCallback((val: boolean) => setDemoModeState(val), []);

  const resetToDemoBenchmark = useCallback(async () => {
    await api.post('/demo/reset');
    await refreshDashboard();
  }, [refreshDashboard]);

  const addIncomeSource = useCallback(async (name: Platform, type: IncomeSource['type']) => {
    try {
      await api.post('/income/sources', { name, type });
      await refreshDashboard();
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 400)) throw err;
    }
  }, [refreshDashboard]);

  const simulatePlatformConnection = useCallback(async (name: Platform) => {
    const type: IncomeSource['type'] =
      name === 'Other' ? 'UPI' : name === 'Freelancing' ? 'Bank Statement' : 'Gig Platform';
    await api.post('/income/sources/connect', { name, type });
    await refreshDashboard();
  }, [refreshDashboard]);

  const importIncomeTransactions = useCallback(async (txs: IncomeTransaction[]) => {
    if (txs.length === 0) return;
    const csv = ['Date,Amount,Platform,Description'].concat(
      txs.map((t) => `${t.date},${t.amount},${t.source},${(t.description ?? 'Imported statement record').replace(/,/g, ' ')}`)
    ).join('\n');
    await api.post('/income/transactions/import-csv', { csv });
    await refreshDashboard();
  }, [refreshDashboard]);

  const updateSavingsSettings = useCallback(async (settings: Partial<SavingsSettings>) => {
    await api.patch('/autosave', settings);
    await refreshDashboard();
  }, [refreshDashboard]);

  const togglePauseAutoSave = useCallback(async () => {
    const paused = dashboard?.settings.pausedToday ?? false;
    await api.post('/autosave/action', { action: paused ? 'resume' : 'pause' });
    await refreshDashboard();
  }, [dashboard?.settings.pausedToday, refreshDashboard]);

  const skipTodayAutoSave = useCallback(async () => {
    await api.post('/autosave/action', { action: 'skip' });
    await refreshDashboard();
  }, [refreshDashboard]);

  const undoAutoSave = useCallback(async (logId: string) => {
    await api.post('/payouts/undo', { logId });
    await refreshDashboard();
  }, [refreshDashboard]);

  const addGoal = useCallback(async (goal: Omit<SavingsGoal, 'id'>) => {
    await api.post('/goals', goal);
    await refreshDashboard();
  }, [refreshDashboard]);

  const approveInvestmentPlan = useCallback(async (amount: number) => {
    if (amount <= 0) return;
    await api.post('/invest/approve', { amount });
    await refreshDashboard();
  }, [refreshDashboard]);

  const updateTaxReserve = useCallback(async (additional: number) => {
    await api.post('/tax/reserve', { additional });
    await refreshDashboard();
  }, [refreshDashboard]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    await api.post('/expenses', { amount: expense.amount, category: expense.category, note: expense.note });
    await refreshDashboard();
  }, [refreshDashboard]);

  const sendAssistantMessage = useCallback(async (text: string) => {
    const optimistic: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text, timestamp: 'Just now' };
    setDashboard((prev) => prev ? { ...prev, chatMessages: [...prev.chatMessages, optimistic] } : prev);
    const res = await api.post<{ userMessage: { id: string }; reply: ChatMessage }>('/assistant', { text });
    setDashboard((prev) => prev ? { ...prev, chatMessages: [...prev.chatMessages, res.reply] } : prev);
  }, []);

  const simulateNewPayout = useCallback(async (source: Platform, amount: number): Promise<DecisionResult> => {
    setIsSimulatingPayout(true);
    try {
      const res = await api.post<{ ok: boolean; runId: string; decision: DecisionResult }>('/payouts/process', { source, amount });
      await refreshDashboard();
      return res.decision;
    } finally {
      setIsSimulatingPayout(false);
    }
  }, [refreshDashboard]);

  const value = useMemo<EarnWiseContextType>(() => {
    const d = dashboard ?? EMPTY;
    return {
      userName: d.user.name,
      occupation: d.user.occupation,
      isDemoMode,
      setDemoMode,
      resetToDemoBenchmark,
      monthIncome: d.month.income,
      monthSaved: d.month.saved,
      monthInvested: d.month.invested,
      monthTaxReserved: d.month.taxReserved,
      monthSpendable: d.month.spendable,
      currentBalance: d.currentBalance,
      financialHealth: d.financialHealth,
      todayAction: d.todayAction,
      incomeSources: d.incomeSources,
      transactions: d.transactions,
      forecast: d.forecast,
      addIncomeSource,
      simulatePlatformConnection,
      importIncomeTransactions,
      savingsSettings: d.settings,
      updateSavingsSettings,
      togglePauseAutoSave,
      skipTodayAutoSave,
      undoAutoSave,
      goals: d.goals,
      addGoal,
      investmentProfile: d.investmentProfile,
      pendingInvestPool: 0,
      approveInvestmentPlan,
      taxProfile: d.taxProfile,
      updateTaxReserve,
      expenses: d.expenses,
      addExpense,
      safeSpending: d.safeSpending,
      activityLogs: d.logs,
      chatMessages: d.chatMessages,
      sendAssistantMessage,
      isSimulatingPayout,
      simulateNewPayout,
      ready: dashboard !== null,
      refresh: refreshDashboard
    };
  }, [
    dashboard, isDemoMode, setDemoMode, resetToDemoBenchmark, addIncomeSource,
    simulatePlatformConnection, importIncomeTransactions, updateSavingsSettings,
    togglePauseAutoSave, skipTodayAutoSave, undoAutoSave, addGoal, approveInvestmentPlan,
    updateTaxReserve, addExpense, sendAssistantMessage, isSimulatingPayout, simulateNewPayout,
    refreshDashboard
  ]);

  return <EarnWiseContext.Provider value={value}>{children}</EarnWiseContext.Provider>;
};

export const useEarnWise = () => {
  const context = useContext(EarnWiseContext);
  if (!context) {
    throw new Error('useEarnWise must be used within an EarnWiseProvider');
  }
  return context;
};