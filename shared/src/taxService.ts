import type { TaxProfile } from './types.js';

export const INITIAL_TAX_PROFILE: TaxProfile = {
  estimatedAnnualIncome: 342000,
  taxAlreadyReserved: 3400,
  mockTaxRate: 0.10,
  quarterlyDueDate: 'March 15, 2027',
  quarterlyDaysRemaining: 24,
  readinessPercentage: 68
};

export interface TaxCalculationResult {
  estimatedAnnualIncome: number;
  taxAlreadyReserved: number;
  targetQuarterlyProvision: number;
  recommendedAdditionalReserve: number;
  readinessPercentage: number;
  quarterlyDueDate: string;
  disclaimer: string;
}

export function computeTaxStatus(
  currentReserved: number,
  monthlyIncomeRunRate: number = 28500
): TaxCalculationResult {
  const estimatedAnnualIncome = monthlyIncomeRunRate * 12;
  const annualTargetProvision = Math.round(estimatedAnnualIncome * 0.015);
  const quarterlyTarget = Math.round(annualTargetProvision / 4) * 4;

  const readinessPercentage = Math.min(100, Math.round((currentReserved / quarterlyTarget) * 100)) || 68;
  const shortfall = Math.max(0, quarterlyTarget - currentReserved);
  const recommendedAdditionalReserve = Math.min(250, shortfall > 0 ? 250 : 0);

  return {
    estimatedAnnualIncome,
    taxAlreadyReserved: currentReserved,
    targetQuarterlyProvision: quarterlyTarget,
    recommendedAdditionalReserve,
    readinessPercentage,
    quarterlyDueDate: 'March 15, 2027 (Advance Tax Q4)',
    disclaimer: "Tax estimates are for planning demonstration only. Final tax liability depends on applicable laws, deductions, presumptive taxation scheme (Section 44ADA/44AD), and certified tax counsel."
  };
}