import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ChatMessage
} from '../types';
import { INITIAL_INCOME_SOURCES, generateInitial30DayTransactions } from '../services/incomeService';
import { calculatePayoutDecision, DecisionResult } from '../services/decisionEngine';
import { calculateIncomeForecast, ForecastMetrics } from '../services/forecastService';
import { computeTaxStatus } from '../services/taxService';
import { computeBehavioralRiskProfile } from '../services/investmentService';
import { INITIAL_SAVINGS_GOALS, allocateSavedAmountToGoals } from '../services/goalService';
import { INITIAL_FINANCIAL_HEALTH, calculateFinancialHealth } from '../services/financialHealthService';
import { computeSafeSpending, SafeSpendingResult } from '../services/safeSpendingService';
import { generateAssistantReply } from '../services/assistantService';

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
}

const EarnWiseContext = createContext<EarnWiseContextType | undefined>(undefined);

export const EarnWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Benchmark Data
  const [userName] = useState('Rahul');
  const [occupation] = useState('Delivery Partner');
  const [isDemoMode, setDemoMode] = useState(true);

  // Month Aggregates matching Prompt Specification
  const [monthIncome, setMonthIncome] = useState(28450);
  const [monthSaved, setMonthSaved] = useState(5240);
  const [monthInvested, setMonthInvested] = useState(2100);
  const [monthTaxReserved, setMonthTaxReserved] = useState(3400);
  const [monthSpendable, setMonthSpendable] = useState(17710);
  const [currentBalance, setCurrentBalance] = useState(17710);

  // AutoSave Settings
  const [savingsSettings, setSavingsSettings] = useState<SavingsSettings>({
    minimumBalance: 5000,
    monthlySavingsTarget: 5000,
    emergencyFundTarget: 25000,
    autoSaveActive: true,
    pausedToday: false,
    skipToday: false,
    maxMonthlyCap: 8000
  });

  // Income Sources
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(INITIAL_INCOME_SOURCES);
  const [transactions, setTransactions] = useState<IncomeTransaction[]>(generateInitial30DayTransactions());

  // Goals
  const [goals, setGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);

  // Financial Health
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthScore>(INITIAL_FINANCIAL_HEALTH);

  // Tax Profile
  const [taxProfile, setTaxProfile] = useState<TaxProfile>({
    estimatedAnnualIncome: 342000,
    taxAlreadyReserved: 3400,
    mockTaxRate: 0.10,
    quarterlyDueDate: 'March 15, 2027',
    quarterlyDaysRemaining: 24,
    readinessPercentage: 68
  });

  // Investment Profile
  const [investmentProfile, setInvestmentProfile] = useState<InvestmentProfile>(
    computeBehavioralRiskProfile(84, 42, 'Moderate')
  );

  // Expenses with gig categories
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'exp-1', date: 'Today, 09:30 AM', amount: 450, category: 'Fuel', note: 'HP Petrol Pump refuel (Tank fill)', receiptStatus: 'verified' },
    { id: 'exp-2', date: 'Yesterday', amount: 220, category: 'Food', note: 'Mid-shift lunch & hydration', receiptStatus: 'manual' },
    { id: 'exp-3', date: '3 days ago', amount: 650, category: 'Vehicle Maintenance', note: 'Engine oil top-up & brake tightening', receiptStatus: 'verified' },
    { id: 'exp-4', date: '5 days ago', amount: 399, category: 'Phone/Data', note: 'Jio 5G 3-Month high-speed gig data pack', receiptStatus: 'verified' }
  ]);

  // Activity Automation Logs
  const [activityLogs, setActivityLogs] = useState<AutomationLog[]>([
    {
      id: 'log-1',
      timestamp: 'Today, 11:15 AM',
      type: 'auto-save',
      title: 'Auto-Saved to Emergency Fund',
      amount: 150,
      reason: "Income above daily average (₹1,250 vs ₹950 avg). Minimum balance guardrail protected.",
      canUndo: true,
      undone: false,
      payoutAmount: 1250,
      spendableRemaining: 875
    },
    {
      id: 'log-2',
      timestamp: 'Today, 11:15 AM',
      type: 'tax-reserve',
      title: 'Tax Reserve Provision Earmarked',
      amount: 125,
      reason: "Quarterly advance tax buffer provision (10% of payout).",
      canUndo: false,
      undone: false,
      payoutAmount: 1250
    },
    {
      id: 'log-3',
      timestamp: 'Today, 11:15 AM',
      type: 'investment-recommendation',
      title: 'Investment Recommendation Prepared',
      amount: 100,
      reason: "Savings balance crossed minimum liquidity threshold. Recommended Liquid/Index SIP.",
      canUndo: false,
      undone: false
    }
  ]);

  // Today's Action Card
  const [todayAction, setTodayAction] = useState({
    payoutAmount: 1250,
    recommendedSave: 150,
    recommendedInvest: 100,
    recommendedTax: 125,
    availableSpendable: 875,
    reason: "Today's income of ₹1,250 is above your normal daily average of ₹950. Because this is a stronger earning day, EarnWise increased your saving amount while keeping your minimum balance protected.",
    details: {
      incomeComparison: "Received ₹1,250 vs. 30-day daily average of ₹948 (132% performance).",
      guardrailStatus: "Minimum balance guardrail satisfied (account remains safely above ₹5,000).",
      taxStatus: "Estimated 10% advance provision (₹125) earmarked for upcoming quarterly tax dues.",
      investmentRationale: "₹100 recommended for Liquid & Index Funds because today's cash flow comfortably covers routine overhead."
    }
  });

  // Assistant Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Hello Rahul! I am your EarnWise financial copilot. Ask me anything about your safe spending, today's auto-save decision, or tax reserves.",
      timestamp: 'Just now',
      chips: [
        "How much can I safely spend this week?",
        "Why did you save ₹150 today?",
        "How much tax have I reserved?",
        "What is my emergency fund status?"
      ]
    }
  ]);

  const [isSimulatingPayout, setIsSimulatingPayout] = useState(false);

  // Recalculate Safe Spending dynamically
  const safeSpending = computeSafeSpending(
    currentBalance,
    savingsSettings.minimumBalance,
    monthTaxReserved,
    savingsSettings.monthlySavingsTarget
  );

  // Recalculate Forecast metrics dynamically
  const forecast = calculateIncomeForecast(transactions);

  // Update Settings
  const updateSavingsSettings = (newSettings: Partial<SavingsSettings>) => {
    setSavingsSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Pause Auto-Save Today
  const togglePauseAutoSave = () => {
    const nextPaused = !savingsSettings.pausedToday;
    setSavingsSettings(prev => ({ ...prev, pausedToday: nextPaused }));
    
    // Add log
    const newLog: AutomationLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      type: 'system-alert',
      title: nextPaused ? 'Auto-Save Paused for Today' : 'Auto-Save Resumed',
      amount: 0,
      reason: nextPaused 
        ? "User manually paused auto-save for today. System will automatically resume tomorrow."
        : "Auto-Save reactivated. Safe saving rules will apply to future payouts.",
      canUndo: false,
      undone: false
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Skip Today AutoSave
  const skipTodayAutoSave = () => {
    setSavingsSettings(prev => ({ ...prev, skipToday: true }));
  };

  // Undo Last AutoSave
  const undoAutoSave = (logId: string) => {
    setActivityLogs(prev => prev.map(log => {
      if (log.id === logId && log.canUndo && !log.undone) {
        // Rollback save amount
        setMonthSaved(s => Math.max(0, s - log.amount));
        setCurrentBalance(b => b + log.amount);
        setMonthSpendable(sp => sp + log.amount);
        return { ...log, undone: true, reason: log.reason + " (Reversed by user)" };
      }
      return log;
    }));
  };

  // Add Income Source
  const addIncomeSource = (name: Platform, type: IncomeSource['type']) => {
    const colors: Record<string, string> = {
      Swiggy: '#FC8019',
      Uber: '#000000',
      Zomato: '#E23744',
      Rapido: '#FFCC00',
      Freelancing: '#3B82F6',
      'Urban Company': '#6C5CE7',
      Other: '#64748B'
    };

    const newSource: IncomeSource = {
      id: `src-${Date.now()}`,
      name,
      connected: true,
      type,
      monthlyTotal: 0,
      lastPayoutDate: 'Just now',
      payoutFrequency: 'Daily / Weekly',
      color: colors[name] || '#64748B'
    };
    setIncomeSources(prev => [...prev, newSource]);
  };

  // Simulate platform connection wizard
  const simulatePlatformConnection = async (name: Platform) => {
    // Add mock connected transactions
    const mockAmounts = [920, 1150, 740, 1280, 1050];
    const newTxs: IncomeTransaction[] = mockAmounts.map((amt, idx) => ({
      id: `tx-conn-${Date.now()}-${idx}`,
      source: name,
      amount: amt,
      date: new Date(Date.now() - (idx * 86400000)).toISOString().split('T')[0],
      description: `${name} settlement sync`,
      status: 'Received',
      autoSavedAmount: Math.round(amt * 0.10),
      taxReservedAmount: Math.round(amt * 0.10),
      spendableAmount: Math.round(amt * 0.80)
    }));

    setTransactions(prev => [...newTxs, ...prev]);
    const addedTotal = mockAmounts.reduce((a, b) => a + b, 0);

    setIncomeSources(prev => prev.map(s => {
      if (s.name === name) {
        return { ...s, connected: true, monthlyTotal: s.monthlyTotal + addedTotal };
      }
      return s;
    }));

    setMonthIncome(prev => prev + addedTotal);
  };

  // Add Goal
  const addGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`
    };
    setGoals(prev => [...prev, goal]);
  };

  // Approve Investment Plan
  const approveInvestmentPlan = (amount: number) => {
    setMonthInvested(prev => prev + amount);
    setMonthSpendable(prev => Math.max(0, prev - amount));
    setCurrentBalance(prev => Math.max(0, prev - amount));

    const newLog: AutomationLog = {
      id: `log-inv-${Date.now()}`,
      timestamp: 'Just now',
      type: 'investment-recommendation',
      title: 'Investment Allocation Approved (Simulated)',
      amount,
      reason: `Allocated ₹${amount} across Liquid Fund (40%), Index Fund (30%), Flexi RD (20%), and Digital Gold (10%).`,
      canUndo: false,
      undone: false
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Update Tax Reserve
  const updateTaxReserve = (additional: number) => {
    setMonthTaxReserved(prev => prev + additional);
    setTaxProfile(prev => ({
      ...prev,
      taxAlreadyReserved: prev.taxAlreadyReserved + additional
    }));
  };

  // Add Expense
  const addExpense = (newExp: Omit<Expense, 'id'>) => {
    const exp: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [exp, ...prev]);
    setCurrentBalance(prev => Math.max(0, prev - exp.amount));
    setMonthSpendable(prev => Math.max(0, prev - exp.amount));
  };

  // Assistant Query
  const sendAssistantMessage = (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);

    const replyText = generateAssistantReply(userText, {
      userName,
      currentBalance,
      minimumBalance: savingsSettings.minimumBalance,
      savedThisMonth: monthSaved,
      savingsTarget: savingsSettings.monthlySavingsTarget,
      todayIncome: todayAction.payoutAmount,
      todaySaved: todayAction.recommendedSave,
      taxReserved: monthTaxReserved,
      investedTotal: monthInvested,
      emergencyFundCurrent: goals.find(g => g.category === 'Emergency')?.currentAmount || 10500,
      emergencyFundTarget: savingsSettings.emergencyFundTarget,
      safeWeeklySpending: safeSpending.safeWeeklySpending,
      averageDailyIncome: forecast.averageDailyIncome,
      lastSaveReason: todayAction.reason,
      isAutoSavePaused: savingsSettings.pausedToday
    });

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Just now',
        chips: [
          "How much can I safely spend this week?",
          "Why did you save ₹150 today?",
          "How much tax have I reserved?",
          "What is my emergency fund status?"
        ]
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    }, 350);
  };

  // Core Demo Action: New Payout Simulator
  const simulateNewPayout = async (source: Platform, amount: number): Promise<DecisionResult> => {
    setIsSimulatingPayout(true);

    const decision = calculatePayoutDecision({
      dailyIncome: amount,
      averageDailyIncome: forecast.averageDailyIncome,
      currentBalance,
      minimumBalance: savingsSettings.minimumBalance,
      monthlySavingsTarget: savingsSettings.monthlySavingsTarget,
      monthlySaved: monthSaved,
      emergencyFundProgress: (goals.find(g => g.category === 'Emergency')?.currentAmount || 10500) / savingsSettings.emergencyFundTarget * 100,
      isPausedToday: savingsSettings.pausedToday,
      isSkippedToday: savingsSettings.skipToday,
      maxMonthlyCap: savingsSettings.maxMonthlyCap
    });

    // Update state reactively across the whole platform!
    setMonthIncome(prev => prev + amount);
    setMonthSaved(prev => prev + decision.saveAmount);
    setMonthTaxReserved(prev => prev + decision.taxReserveAmount);
    setMonthSpendable(prev => prev + decision.spendableAmount);
    setCurrentBalance(prev => prev + decision.spendableAmount);

    // Update Today's Action
    setTodayAction({
      payoutAmount: amount,
      recommendedSave: decision.saveAmount,
      recommendedInvest: decision.investRecommendAmount,
      recommendedTax: decision.taxReserveAmount,
      availableSpendable: decision.spendableAmount,
      reason: decision.reason,
      details: decision.explanationDetails
    });

    // Update Income Sources
    setIncomeSources(prev => prev.map(s => {
      if (s.name === source) {
        return {
          ...s,
          monthlyTotal: s.monthlyTotal + amount,
          lastPayoutDate: 'Just now'
        };
      }
      return s;
    }));

    // Add Income Transaction
    const newTx: IncomeTransaction = {
      id: `tx-payout-${Date.now()}`,
      source,
      amount,
      date: new Date().toISOString().split('T')[0],
      description: `${source} Instant Gig Settlement`,
      status: 'Received',
      autoSavedAmount: decision.saveAmount,
      taxReservedAmount: decision.taxReserveAmount,
      investRecommendedAmount: decision.investRecommendAmount,
      spendableAmount: decision.spendableAmount
    };
    setTransactions(prev => [newTx, ...prev]);

    // Top up goals with saved amount
    setGoals(prev => allocateSavedAmountToGoals(prev, decision.saveAmount));

    // Update Tax Profile
    setTaxProfile(prev => ({
      ...prev,
      taxAlreadyReserved: prev.taxAlreadyReserved + decision.taxReserveAmount,
      readinessPercentage: Math.min(100, prev.readinessPercentage + 2)
    }));

    // Recompute Financial Health
    setFinancialHealth(prev => calculateFinancialHealth(
      ((goals.find(g => g.category === 'Emergency')?.currentAmount || 10500) + decision.saveAmount) / savingsSettings.emergencyFundTarget * 100,
      taxProfile.readinessPercentage,
      prev.savingsConsistency,
      prev.incomeStability,
      prev.investmentDiscipline
    ));

    // Log Activity entries with clear explainability
    const newLogs: AutomationLog[] = [
      {
        id: `log-save-${Date.now()}`,
        timestamp: 'Just now',
        type: 'auto-save',
        title: `Auto-Saved from ${source} Payout`,
        amount: decision.saveAmount,
        reason: decision.reason,
        canUndo: decision.saveAmount > 0,
        undone: false,
        payoutAmount: amount,
        spendableRemaining: decision.spendableAmount
      },
      {
        id: `log-tax-${Date.now() + 1}`,
        timestamp: 'Just now',
        type: 'tax-reserve',
        title: 'Quarterly Advance Tax Reserved',
        amount: decision.taxReserveAmount,
        reason: decision.explanationDetails.taxStatus,
        canUndo: false,
        undone: false,
        payoutAmount: amount
      }
    ];

    if (decision.investRecommendAmount > 0) {
      newLogs.push({
        id: `log-inv-${Date.now() + 2}`,
        timestamp: 'Just now',
        type: 'investment-recommendation',
        title: 'Micro-Investment Recommendation Created',
        amount: decision.investRecommendAmount,
        reason: decision.explanationDetails.investmentRationale,
        canUndo: false,
        undone: false
      });
    }

    setActivityLogs(prev => [...newLogs, ...prev]);
    setIsSimulatingPayout(false);

    return decision;
  };

  // Reset to Demo Benchmark (Step 27)
  const resetToDemoBenchmark = () => {
    setMonthIncome(28450);
    setMonthSaved(5240);
    setMonthInvested(2100);
    setMonthTaxReserved(3400);
    setMonthSpendable(17710);
    setCurrentBalance(17710);
    setIncomeSources(INITIAL_INCOME_SOURCES);
    setGoals(INITIAL_SAVINGS_GOALS);
    setFinancialHealth(INITIAL_FINANCIAL_HEALTH);
    setSavingsSettings({
      minimumBalance: 5000,
      monthlySavingsTarget: 5000,
      emergencyFundTarget: 25000,
      autoSaveActive: true,
      pausedToday: false,
      skipToday: false,
      maxMonthlyCap: 8000
    });
    setTodayAction({
      payoutAmount: 1250,
      recommendedSave: 150,
      recommendedInvest: 100,
      recommendedTax: 125,
      availableSpendable: 875,
      reason: "Today's income of ₹1,250 is above your normal daily average of ₹950. Because this is a stronger earning day, EarnWise increased your saving amount while keeping your minimum balance protected.",
      details: {
        incomeComparison: "Received ₹1,250 vs. 30-day daily average of ₹948 (132% performance).",
        guardrailStatus: "Minimum balance guardrail satisfied (account remains safely above ₹5,000).",
        taxStatus: "Estimated 10% advance provision (₹125) earmarked for upcoming quarterly tax dues.",
        investmentRationale: "₹100 recommended for Liquid & Index Funds because today's cash flow comfortably covers routine overhead."
      }
    });
  };

  return (
    <EarnWiseContext.Provider
      value={{
        userName,
        occupation,
        isDemoMode,
        setDemoMode,
        resetToDemoBenchmark,
        monthIncome,
        monthSaved,
        monthInvested,
        monthTaxReserved,
        monthSpendable,
        currentBalance,
        financialHealth,
        todayAction,
        incomeSources,
        transactions,
        forecast,
        addIncomeSource,
        simulatePlatformConnection,
        savingsSettings,
        updateSavingsSettings,
        togglePauseAutoSave,
        skipTodayAutoSave,
        undoAutoSave,
        goals,
        addGoal,
        investmentProfile,
        approveInvestmentPlan,
        taxProfile,
        updateTaxReserve,
        expenses,
        addExpense,
        safeSpending,
        activityLogs,
        chatMessages,
        sendAssistantMessage,
        isSimulatingPayout,
        simulateNewPayout
      }}
    >
      {children}
    </EarnWiseContext.Provider>
  );
};

export const useEarnWise = () => {
  const context = useContext(EarnWiseContext);
  if (!context) {
    throw new Error('useEarnWise must be used within an EarnWiseProvider');
  }
  return context;
};
