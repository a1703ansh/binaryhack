export interface SimulationResult {
  monthlyContribution: number;
  durationYears: number;
  annualRate: number;
  totalInvested: number;
  estimatedGains: number;
  futureCorpus: number;
  disclaimer: string;
  breakdown: { year: number; invested: number; corpus: number }[];
}

/**
 * Compound Growth & Micro-Investment SIP Simulator
 */
export function simulateGrowth(
  monthlyContribution: number,
  durationYears: number,
  annualRate: number = 0.10
): SimulationResult {
  const months = durationYears * 12;
  const monthlyRate = annualRate / 12;

  let futureCorpus = 0;
  if (monthlyRate > 0) {
    futureCorpus = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  } else {
    futureCorpus = monthlyContribution * months;
  }

  const totalInvested = monthlyContribution * months;
  const estimatedGains = Math.max(0, futureCorpus - totalInvested);

  const breakdown: { year: number; invested: number; corpus: number }[] = [];
  for (let yr = 1; yr <= durationYears; yr++) {
    const yrMonths = yr * 12;
    const yrCorpus = monthlyContribution * ((Math.pow(1 + monthlyRate, yrMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    breakdown.push({
      year: yr,
      invested: monthlyContribution * yrMonths,
      corpus: Math.round(yrCorpus)
    });
  }

  return {
    monthlyContribution,
    durationYears,
    annualRate,
    totalInvested: Math.round(totalInvested),
    estimatedGains: Math.round(estimatedGains),
    futureCorpus: Math.round(futureCorpus),
    disclaimer: "Illustrative projection only. Actual returns are not guaranteed and depend on market conditions and chosen asset classes.",
    breakdown
  };
}