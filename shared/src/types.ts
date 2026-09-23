export type Platform = 'Swiggy' | 'Uber' | 'Zomato' | 'Rapido' | 'Freelancing' | 'Urban Company' | 'Other';

export const PLATFORMS: readonly Platform[] = ['Swiggy', 'Uber', 'Zomato', 'Rapido', 'Freelancing', 'Urban Company', 'Other'];

export const ALL_PLATFORMS: readonly Platform[] = PLATFORMS;

export interface IncomeSource {
  id: string;
  name: Platform;
  connected: boolean;
  type: 'Gig Platform' | 'UPI' | 'Bank Statement' | 'CSV Upload';
  monthlyTotal: number;
  lastPayoutDate: string;
  payoutFrequency: string;
  color: string;
}

export interface IncomeTransaction {
  id: string;
  source: Platform;
  amount: number;
  date: string;
  description: string;
  status: 'Received' | 'Processing';
  autoSavedAmount?: number;
  taxReservedAmount?: number;
  investRecommendedAmount?: number;
  spendableAmount?: number;
}

export type ExpenseCategory =
  | 'Fuel'
  | 'Vehicle Maintenance'
  | 'Food'
  | 'Phone/Data'
  | 'Rent'
  | 'EMI/Repayment'
  | 'Other';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  receiptStatus?: 'verified' | 'pending_review' | 'manual';
  receiptImage?: string;
  platformImpact?: string;
}

export interface SavingsSettings {
  minimumBalance: number;
  monthlySavingsTarget: number;
  emergencyFundTarget: number;
  autoSaveActive: boolean;
  pausedToday: boolean;
  skipToday: boolean;
  maxMonthlyCap: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Emergency' | 'Vehicle' | 'Festival' | 'Family' | 'General';
  icon: string;
}

export type RiskProfileLevel = 'Conservative' | 'Balanced' | 'Growth';

export interface InvestmentProfile {
  riskLevel: RiskProfileLevel;
  score: number;
  factors: {
    savingConsistency: number;
    incomeVolatility: 'Low' | 'Moderate' | 'High';
    emergencyFundProgress: number;
    withdrawalFrequency: 'Low' | 'Medium' | 'High';
    goalHorizonMonths: number;
  };
  explanation: string;
}

export interface InvestmentCategoryOption {
  id: string;
  title: string;
  risk: 'Low' | 'Medium' | 'Moderate';
  liquidity: 'Instant (T+0)' | 'High' | 'Medium' | 'Low';
  minContribution: number;
  expectedReturnRange: string;
  whyItFits: string;
  suggestedPercent: number;
  color: string;
}

export interface TaxProfile {
  estimatedAnnualIncome: number;
  taxAlreadyReserved: number;
  mockTaxRate: number;
  quarterlyDueDate: string;
  quarterlyDaysRemaining: number;
  readinessPercentage: number;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: 'auto-save' | 'tax-reserve' | 'investment-recommendation' | 'system-alert';
  title: string;
  amount: number;
  reason: string;
  canUndo: boolean;
  undone: boolean;
  payoutAmount?: number;
  spendableRemaining?: number;
}

export interface FinancialHealthScore {
  overall: number;
  incomeStability: number;
  savingsConsistency: number;
  emergencyFund: number;
  taxReadiness: number;
  investmentDiscipline: number;
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chips?: string[];
  meta?: any;
}