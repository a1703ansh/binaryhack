import { IncomeTransaction } from '../types/index.ts';

export interface ForecastMetrics {
  todayIncome: number;
  sevenDayIncome: number;
  thirtyDayIncome: number;
  averageDailyIncome: number;
  sevenDayAverage: number;
  trendPercentage: number;
  volatility: 'Low' | 'Moderate' | 'High';
  forecastNext7DaysMin: number;
  forecastNext7DaysMax: number;
  historicalChartData: { day: string; amount: number; isForecast?: boolean }[];
}

/**
 * Modular Rule-Based Income Intelligence & Forecasting Engine
 * Can be replaced by an ML inference endpoint in future phases without breaking callers.
 */
export function calculateIncomeForecast(transactions: IncomeTransaction[]): ForecastMetrics {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const last30 = sorted.slice(-30);
  const last7 = sorted.slice(-7);
  
  const todayTx = sorted[sorted.length - 1];
  const todayIncome = todayTx ? todayTx.amount : 1250;
  
  const sevenDayIncome = last7.reduce((acc, t) => acc + t.amount, 0) || 7850;
  const thirtyDayIncome = last30.reduce((acc, t) => acc + t.amount, 0) || 28450;
  
  const averageDailyIncome = Math.round(thirtyDayIncome / (last30.length || 30)) || 948;
  const sevenDayAverage = Math.round(sevenDayIncome / (last7.length || 7)) || 1121;

  // Trend comparison: compare recent 7 days to prior 7 days
  const prior7 = sorted.slice(-14, -7);
  const prior7Income = prior7.reduce((acc, t) => acc + t.amount, 0) || 7000;
  const trendPercentage = prior7Income > 0 
    ? Math.round(((sevenDayIncome - prior7Income) / prior7Income) * 100) 
    : 12;

  // Volatility metric: standard deviation spread
  const variance = last30.reduce((acc, t) => acc + Math.pow(t.amount - averageDailyIncome, 2), 0) / (last30.length || 1);
  const stdDev = Math.sqrt(variance);
  const cv = averageDailyIncome > 0 ? stdDev / averageDailyIncome : 0.25;

  let volatility: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (cv < 0.15) volatility = 'Low';
  else if (cv > 0.35) volatility = 'High';

  // Rule-based 7-day forecast
  // Base forecast = 7 * sevenDayAverage adjusted by slight trend damping
  const baseExpected = sevenDayAverage * 7;
  const forecastNext7DaysMin = Math.round(baseExpected * 0.90 / 100) * 100; // e.g. ~6,800
  const forecastNext7DaysMax = Math.round(baseExpected * 1.08 / 100) * 100; // e.g. ~8,200

  // Chart data: 30 days history + 7 projected days
  const historicalChartData = last30.map((tx, idx) => {
    const d = new Date(tx.date);
    const dayName = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return {
      day: dayName,
      amount: tx.amount,
      isForecast: false
    };
  });

  // Append 7 forecast days
  const lastDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : new Date();
  for (let i = 1; i <= 7; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + i);
    const dayLabel = nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    // Slight weekday variance simulation
    const dayMultiplier = [1.02, 0.95, 0.98, 1.05, 1.15, 1.20, 1.05][(nextDate.getDay() + 6) % 7];
    const projectedAmount = Math.round(sevenDayAverage * dayMultiplier);

    historicalChartData.push({
      day: `${dayLabel} (Est)`,
      amount: projectedAmount,
      isForecast: true
    });
  }

  return {
    todayIncome,
    sevenDayIncome,
    thirtyDayIncome,
    averageDailyIncome,
    sevenDayAverage,
    trendPercentage,
    volatility,
    forecastNext7DaysMin,
    forecastNext7DaysMax,
    historicalChartData
  };
}
