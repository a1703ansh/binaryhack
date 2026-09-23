import { IncomeSource, IncomeTransaction, Platform } from '../types/index.ts';

export const INITIAL_INCOME_SOURCES: IncomeSource[] = [
  {
    id: 'src-1',
    name: 'Swiggy',
    connected: true,
    type: 'Gig Platform',
    monthlyTotal: 12400,
    lastPayoutDate: 'Today',
    payoutFrequency: 'Daily Payout',
    color: '#FC8019'
  },
  {
    id: 'src-2',
    name: 'Uber',
    connected: true,
    type: 'Gig Platform',
    monthlyTotal: 8300,
    lastPayoutDate: 'Yesterday',
    payoutFrequency: 'Daily Payout',
    color: '#000000'
  },
  {
    id: 'src-3',
    name: 'Freelancing',
    connected: true,
    type: 'Bank Statement',
    monthlyTotal: 4200,
    lastPayoutDate: '3 days ago',
    payoutFrequency: 'Milestone / Weekly',
    color: '#3B82F6'
  }
];

// 30 days of historical data leading up to today
export function generateInitial30DayTransactions(): IncomeTransaction[] {
  const transactions: IncomeTransaction[] = [];
  const baseAmounts = [
    920, 1150, 740, 1280, 1050, 890, 1120, 680, 1340, 960,
    810, 1040, 1220, 710, 940, 1180, 1090, 850, 990, 1260,
    910, 780, 1310, 1020, 870, 930, 1190, 840, 1080, 1250
  ];
  
  const sources: Platform[] = ['Swiggy', 'Uber', 'Swiggy', 'Uber', 'Freelancing'];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const amount = baseAmounts[29 - i] || 950;
    const src = sources[i % sources.length];

    transactions.push({
      id: `tx-hist-${30 - i}`,
      source: src,
      amount,
      date: dateStr,
      description: `${src} Daily Earnings Settlement`,
      status: 'Received',
      autoSavedAmount: Math.round(amount * 0.10),
      taxReservedAmount: Math.round(amount * 0.10),
      investRecommendedAmount: Math.round(amount * 0.05),
      spendableAmount: Math.round(amount * 0.75)
    });
  }

  return transactions;
}

export function parseCSVTransactions(csvText: string): Partial<IncomeTransaction>[] {
  const lines = csvText.trim().split('\n');
  const results: Partial<IncomeTransaction>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    if (cols.length >= 2) {
      const amount = parseFloat(cols[1]) || 0;
      if (amount > 0) {
        results.push({
          source: (cols[2] as Platform) || 'Other',
          amount,
          date: cols[0] || new Date().toISOString().split('T')[0],
          description: cols[3] || 'Imported statement record',
          status: 'Received'
        });
      }
    }
  }
  return results;
}
