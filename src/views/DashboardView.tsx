import React, { useState } from 'react';
import { 
  TrendingUp, 
  PiggyBank, 
  LineChart, 
  ReceiptIndianRupee, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Info, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Calendar,
  Layers
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { ExplainableModal } from '../components/ExplainableModal';

interface DashboardViewProps {
  onOpenPayoutModal: () => void;
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPayoutModal,
  setActiveView
}) => {
  const {
    userName,
    monthIncome,
    monthSaved,
    monthInvested,
    monthTaxReserved,
    monthSpendable,
    financialHealth,
    todayAction,
    forecast,
    safeSpending,
    savingsSettings
  } = useEarnWise();

  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  // Take the last 14 days of historical data for the dashboard income trend
  const trendSlice = forecast.historicalChartData.filter(d => !d.isForecast).slice(-14);
  const maxIncome = Math.max(...trendSlice.map(d => d.amount), 1500);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome & Value Proposition */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Zero-Effort Gig Finance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your income changes every day. Your financial plan does too.
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            EarnWise analyzes daily gig payouts, protects your ₹{savingsSettings.minimumBalance.toLocaleString('en-IN')} minimum balance, and automatically splits savings, taxes, and micro-investments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPayoutModal}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Simulate New Payout</span>
          </button>
        </div>
      </div>

      {/* Financial Health Section (Step 4 & Step 21) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Financial Health</h2>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {financialHealth.overall >= 75 ? 'Strong' : 'Moderate'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Composite resilience metric designed specifically for irregular income (Not a credit score).
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 self-start sm:self-center">
            <span className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {financialHealth.overall}
            </span>
            <span className="text-slate-500 text-sm font-semibold">/ 100</span>
          </div>
        </div>

        {/* 5 Health Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Income Stability</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{financialHealth.incomeStability}%</span>
              <span className="text-[10px] text-emerald-400">Moderate</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${financialHealth.incomeStability}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Savings Consistency</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{financialHealth.savingsConsistency}%</span>
              <span className="text-[10px] text-emerald-400">High</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${financialHealth.savingsConsistency}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Emergency Fund</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{financialHealth.emergencyFund}%</span>
              <span className="text-[10px] text-amber-400">Building</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${financialHealth.emergencyFund}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Tax Readiness</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{financialHealth.taxReadiness}%</span>
              <span className="text-[10px] text-blue-400">On Track</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: `${financialHealth.taxReadiness}%` }} />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Invest Discipline</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{financialHealth.investmentDiscipline}%</span>
              <span className="text-[10px] text-purple-400">Regular</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: `${financialHealth.investmentDiscipline}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* THIS MONTH Financial Metric Cards (Step 4) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">This Month Overview</h2>
          </div>
          <span className="text-xs text-slate-400">September 2026</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Income */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Income</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              ₹{monthIncome.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
              <span>3 gig platforms</span>
            </div>
          </div>

          {/* Saved */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Saved</span>
              <PiggyBank className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ₹{monthSaved.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Auto-Save: active
            </div>
          </div>

          {/* Invested */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Invested</span>
              <LineChart className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              ₹{monthInvested.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Balanced portfolio
            </div>
          </div>

          {/* Tax Reserved */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Tax Reserved</span>
              <ReceiptIndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              ₹{monthTaxReserved.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Q4 Advance tax buffer
            </div>
          </div>

          {/* Spendable */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Spendable</span>
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              ₹{monthSpendable.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 font-medium">
              ₹5,000 floor guarded
            </div>
          </div>
        </div>
      </div>

      {/* Split Section: Today's Financial Action & Safe Discretionary Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Financial Action (Step 4 & Step 12) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Today's Financial Action</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ₹{todayAction.payoutAmount.toLocaleString('en-IN')} payout received
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              EarnWise Algorithmic Recommendations:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Save</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  ₹{todayAction.recommendedSave}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Invest</span>
                <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">
                  ₹{todayAction.recommendedInvest}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Reserve Tax</span>
                <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                  ₹{todayAction.recommendedTax}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Available</span>
                <div className="text-lg font-bold font-mono text-white mt-0.5">
                  ₹{todayAction.availableSpendable}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                "{todayAction.reason}"
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsExplainModalOpen(true)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
              >
                <span>View analysis breakdown</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenPayoutModal}
                className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-xl transition-colors"
              >
                Simulate another payout
              </button>
            </div>
          </div>
        </div>

        {/* Safe Spending & Weekly Digest (Step 24 & Step 25) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Safe Spending Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span>Safe To Spend (This Week)</span>
              <span className="text-emerald-400">Guarded</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              ₹{safeSpending.safeWeeklySpending.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {safeSpending.explanation}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Safe daily allowance:</span>
              <strong className="text-slate-200 font-mono">₹{safeSpending.safeDailyDiscretionary}/day</strong>
            </div>
          </div>

          {/* Weekly Digest Insight (Step 25) */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200">Your Week at a Glance</span>
              <span className="text-emerald-400 font-bold font-mono">+{forecast.trendPercentage}% trend</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400">Income</span>
                <div className="font-mono font-bold text-white">₹7,850</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400">Saved</span>
                <div className="font-mono font-bold text-emerald-400">₹620</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400">Invested</span>
                <div className="font-mono font-bold text-blue-400">₹300</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400">Tax Res</span>
                <div className="font-mono font-bold text-amber-400">₹410</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 italic">
              "You had a stronger earning week, so EarnWise increased your savings without violating your minimum balance."
            </p>
          </div>
        </div>
      </div>

      {/* 30-Day Income Trend Chart (Step 4 & Step 5) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Income Trend & Stability</h3>
            </div>
            <p className="text-xs text-slate-400">
              Past 14 days daily settlement fluctuations & 30-day average comparison
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">Daily Payout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 border border-dashed border-amber-400" />
              <span className="text-slate-400">Avg (₹{forecast.averageDailyIncome})</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 w-full flex items-end gap-2 sm:gap-4 pt-6 px-1">
          {trendSlice.map((item, idx) => {
            const heightPercent = Math.min(100, Math.max(15, (item.amount / maxIncome) * 100));
            const isAboveAvg = item.amount >= forecast.averageDailyIncome;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-950 border border-slate-700 text-white font-mono text-[10px] py-0.5 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-10">
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>

                {/* Bar */}
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                    isAboveAvg 
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/20' 
                      : 'bg-gradient-to-t from-slate-750 to-slate-600'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Label */}
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Average Daily Run-Rate: <strong className="text-slate-200 font-mono">₹{forecast.averageDailyIncome}</strong></span>
          <button 
            onClick={() => setActiveView('income')}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Explore Income Intelligence</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explainable Modal */}
      <ExplainableModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        payoutAmount={todayAction.payoutAmount}
        saveAmount={todayAction.recommendedSave}
        taxAmount={todayAction.recommendedTax}
        investAmount={todayAction.recommendedInvest}
        spendableAmount={todayAction.availableSpendable}
        reason={todayAction.reason}
        details={todayAction.details}
      />
    </div>
  );
};
