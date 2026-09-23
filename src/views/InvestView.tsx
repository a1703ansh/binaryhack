import React, { useState } from 'react';
import { 
  LineChart as LineChartIcon, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  ArrowRight,
  PieChart as PieChartIcon,
  HelpCircle,
  TrendingUp,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEarnWise } from '../context/EarnWiseContext';
import { INITIAL_INVESTMENT_CATEGORIES } from '../services/investmentService';
import { simulateGrowth } from '../services/simulatorService';

export const InvestView: React.FC = () => {
  const { 
    investmentProfile, 
    approveInvestmentPlan,
    monthInvested 
  } = useEarnWise();

  // What-If Simulator Inputs (Step 16)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [durationYears, setDurationYears] = useState<number>(5);
  const [annualRate, setAnnualRate] = useState<number>(0.10);
  const [isPlanApproved, setIsPlanApproved] = useState(false);

  // Compute what-if projection
  const simulation = simulateGrowth(monthlyContribution, durationYears, annualRate);

  const handleApprovePlan = () => {
    approveInvestmentPlan(1000);
    setIsPlanApproved(true);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setIsPlanApproved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <LineChartIcon className="w-4 h-4" />
            <span>Investment Advisor</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Micro-Investment & Growth</h1>
          <p className="text-xs text-slate-400">
            Tailored micro-allocations based on gig cash flow predictability & behavioral risk profile
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Total Invested:</span>
          <strong className="text-blue-400 font-mono text-base font-bold">
            ₹{monthInvested.toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      {/* Behavioral Risk Profile Card (Step 14 & Step 26) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your Current Behavioral Profile:</span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {investmentProfile.riskLevel}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
              "{investmentProfile.explanation}"
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1 self-start sm:self-center">
            <div className="text-slate-400 flex items-center justify-between gap-4">
              <span>Savings Consistency:</span>
              <strong className="text-emerald-400 font-mono">84%</strong>
            </div>
            <div className="text-slate-400 flex items-center justify-between gap-4">
              <span>Income Volatility:</span>
              <strong className="text-amber-400 font-mono">Moderate</strong>
            </div>
            <div className="text-slate-400 flex items-center justify-between gap-4">
              <span>Withdrawal Risk:</span>
              <strong className="text-slate-200 font-mono">Low</strong>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            Prototype note: Derived from behavioral liquidity patterns. Not a SEBI suitability certificate.
          </span>
        </div>
      </div>

      {/* Mock Investment Allocation (Step 15 Specification) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <span>Recommended Micro-Allocation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Balanced allocation of monthly available surplus across 4 liquid & wealth-building asset classes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Available to Deploy:</span>
            <span className="text-lg font-mono font-bold text-emerald-400">₹1,000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Visual Donut / Bar representation */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            {/* Visual Multi-segment bar */}
            <div className="w-full h-8 rounded-xl overflow-hidden flex shadow-inner">
              <div style={{ width: '40%' }} className="bg-emerald-500 h-full flex items-center justify-center text-[11px] font-bold text-slate-950" title="Liquid Fund 40%">
                40%
              </div>
              <div style={{ width: '30%' }} className="bg-blue-500 h-full flex items-center justify-center text-[11px] font-bold text-white" title="Index Fund 30%">
                30%
              </div>
              <div style={{ width: '20%' }} className="bg-purple-500 h-full flex items-center justify-center text-[11px] font-bold text-white" title="Recurring Deposit 20%">
                20%
              </div>
              <div style={{ width: '10%' }} className="bg-amber-500 h-full flex items-center justify-center text-[11px] font-bold text-slate-950" title="Digital Gold 10%">
                10%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-4 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Liquid Fund
                </span>
                <strong className="text-emerald-400">₹400</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Index Fund
                </span>
                <strong className="text-blue-400">₹300</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Flexi RD
                </span>
                <strong className="text-purple-400">₹200</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Digital Gold
                </span>
                <strong className="text-amber-400">₹100</strong>
              </div>
            </div>
          </div>

          {/* Action & Explanation */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Why this allocation fits Rahul:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Because gig income swings month-to-month, <strong>40% is kept in Instant-access Liquid Funds</strong> (withdrawable anytime in 30 mins). <strong>30% goes to Nifty 50 Index Funds</strong> to build long-term wealth, <strong>20% to guaranteed Flexi RD</strong>, and <strong>10% to 24K Digital Gold</strong> as a hedge.
              </p>
            </div>

            {isPlanApproved ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Investment plan approved (Simulated)! Recorded in Activity Log.</span>
              </div>
            ) : (
              <button
                onClick={handleApprovePlan}
                className="w-full py-3 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Approve Plan (Simulated Execution)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Class Cards (Step 14) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {INITIAL_INVESTMENT_CATEGORIES.map(cat => (
          <div key={cat.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm font-bold text-white">{cat.title}</strong>
                <span 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 mt-2">
                <div className="flex justify-between">
                  <span>Risk:</span>
                  <strong className="text-slate-200">{cat.risk}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Liquidity:</span>
                  <strong className="text-slate-200">{cat.liquidity}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Min Contribution:</span>
                  <strong className="text-emerald-400 font-mono">₹{cat.minContribution}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Expected Returns:</span>
                  <strong className="text-blue-400 font-mono">{cat.expectedReturnRange}</strong>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                "{cat.whyItFits}"
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What-If Simulator (Step 16 Specification) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Savings & Investment What-If Simulator</h3>
            <p className="text-xs text-slate-400">
              Project potential micro-SIP compound growth from small daily spare change
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Monthly Contribution
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlyContribution(val)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      monthlyContribution === val
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Horizon / Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10].map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setDurationYears(yr)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      durationYears === yr
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {yr} {yr === 1 ? 'Year' : 'Years'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Illustrative Return Rate:</span>
                <strong className="text-emerald-400 font-mono">{(annualRate * 100).toFixed(0)}% p.a.</strong>
              </div>
              <input
                type="range"
                min="0.06"
                max="0.14"
                step="0.01"
                value={annualRate}
                onChange={e => setAnnualRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Invested</span>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  ₹{simulation.totalInvested.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Est. Growth</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  +₹{simulation.estimatedGains.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Potential Corpus</span>
                <div className="text-xl font-black font-mono text-blue-400 mt-1">
                  ₹{simulation.futureCorpus.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Growth Curve Progress */}
            <div className="mt-5 space-y-1.5">
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Corpus Multiplier:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {(simulation.futureCorpus / (simulation.totalInvested || 1)).toFixed(2)}x of total capital
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  className="bg-slate-500 h-full" 
                  style={{ width: `${(simulation.totalInvested / simulation.futureCorpus) * 100}%` }}
                  title="Capital"
                />
                <div 
                  className="bg-emerald-400 h-full" 
                  style={{ width: `${(simulation.estimatedGains / simulation.futureCorpus) * 100}%` }}
                  title="Wealth Gain"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>■ Your Capital (₹{simulation.totalInvested.toLocaleString('en-IN')})</span>
                <span className="text-emerald-400">■ Compound Gains (₹{simulation.estimatedGains.toLocaleString('en-IN')})</span>
              </div>
            </div>

            {/* Mandatory Disclaimer (Step 16) */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
              {simulation.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
