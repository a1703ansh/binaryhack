import type { FinancialHealthScore } from './types.js';

export const INITIAL_FINANCIAL_HEALTH: FinancialHealthScore = {
  overall: 78,
  incomeStability: 72,
  savingsConsistency: 84,
  emergencyFund: 42,
  taxReadiness: 68,
  investmentDiscipline: 76,
  summary: "Strong financial foundation with high savings consistency. Further growth possible by accelerating your emergency reserve."
};

export function calculateFinancialHealth(
  emergencyFundProgress: number,
  taxReadiness: number,
  savingsConsistency: number = 84,
  incomeStability: number = 72,
  investmentDiscipline: number = 76
): FinancialHealthScore {
  const weighted = Math.round(
    (incomeStability * 0.20) +
    (savingsConsistency * 0.25) +
    (emergencyFundProgress * 0.25) +
    (taxReadiness * 0.15) +
    (investmentDiscipline * 0.15)
  );

  const overall = Math.min(100, Math.max(20, weighted));

  let summary = "Balanced financial posture.";
  if (overall >= 75) {
    summary = "Healthy financial discipline! Automatic savings and tax provisioning are keeping you resilient against gig income dips.";
  } else if (overall >= 50) {
    summary = "Moderate financial health. Focus on building your 3-month emergency fund buffer.";
  } else {
    summary = "Vulnerable to earning shocks. EarnWise is actively guarding minimum balances.";
  }

  return {
    overall,
    incomeStability,
    savingsConsistency,
    emergencyFund: Math.round(emergencyFundProgress),
    taxReadiness: Math.round(taxReadiness),
    investmentDiscipline,
    summary
  };
}