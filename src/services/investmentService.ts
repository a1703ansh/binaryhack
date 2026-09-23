import { InvestmentCategoryOption, InvestmentProfile, RiskProfileLevel } from '../types/index.ts';

export const INITIAL_INVESTMENT_CATEGORIES: InvestmentCategoryOption[] = [
  {
    id: 'liquid-fund',
    title: 'Liquid Mutual Fund',
    risk: 'Low',
    liquidity: 'Instant (T+0)',
    minContribution: 100,
    expectedReturnRange: '6.5% – 7.2%',
    whyItFits: 'Instant redemption within 30 minutes up to ₹50k. Perfect parking spot for gig emergency buffers.',
    suggestedPercent: 40, // ₹400 of ₹1000
    color: '#10B981'
  },
  {
    id: 'index-fund',
    title: 'Nifty 50 Index Fund',
    risk: 'Moderate',
    liquidity: 'High',
    minContribution: 100,
    expectedReturnRange: '11% – 13%',
    whyItFits: 'Low-cost exposure to India’s top 50 bluechip companies for beating long-term inflation.',
    suggestedPercent: 30, // ₹300 of ₹1000
    color: '#3B82F6'
  },
  {
    id: 'recurring-deposit',
    title: 'Recurring Deposit (Flexi RD)',
    risk: 'Low',
    liquidity: 'Medium',
    minContribution: 100,
    expectedReturnRange: '7.0% – 7.5%',
    whyItFits: 'Suitable for users looking for guaranteed returns and predictable contributions toward medium-term goals.',
    suggestedPercent: 20, // ₹200 of ₹1000
    color: '#8B5CF6'
  },
  {
    id: 'digital-gold',
    title: '24K Digital Gold',
    risk: 'Moderate',
    liquidity: 'High',
    minContribution: 10,
    expectedReturnRange: '9% – 11%',
    whyItFits: 'Micro-accumulation hedge in pure 999.9 gold starting from just ₹10 whenever payout permits.',
    suggestedPercent: 10, // ₹100 of ₹1000
    color: '#F59E0B'
  }
];

export function computeBehavioralRiskProfile(
  savingsConsistency: number = 84,
  emergencyFundProgress: number = 42,
  incomeVolatility: 'Low' | 'Moderate' | 'High' = 'Moderate'
): InvestmentProfile {
  let riskLevel: RiskProfileLevel = 'Balanced';
  let score = 65;

  if (emergencyFundProgress < 30) {
    riskLevel = 'Conservative';
    score = 45;
  } else if (emergencyFundProgress > 70 && incomeVolatility === 'Low') {
    riskLevel = 'Growth';
    score = 82;
  } else {
    riskLevel = 'Balanced';
    score = 68;
  }

  const explanation = "Balanced — your savings consistency (84%) is robust, but your income exhibits moderate volatility. EarnWise prioritizes liquidity first, then conservative growth.";

  return {
    riskLevel,
    score,
    factors: {
      savingConsistency: savingsConsistency,
      incomeVolatility: incomeVolatility,
      emergencyFundProgress: emergencyFundProgress,
      withdrawalFrequency: 'Low',
      goalHorizonMonths: 18
    },
    explanation
  };
}

export function generateAllocation(totalAmount: number = 1000) {
  return {
    liquidFund: Math.round(totalAmount * 0.40),
    indexFund: Math.round(totalAmount * 0.30),
    recurringDeposit: Math.round(totalAmount * 0.20),
    digitalGold: Math.round(totalAmount * 0.10),
  };
}
