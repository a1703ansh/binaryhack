import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Link2
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { IncomeConnectionModal } from '../components/IncomeConnectionModal';

interface IncomeViewProps {
  onOpenPayoutModal: () => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({ onOpenPayoutModal }) => {
  const { 
    forecast, 
    incomeSources, 
    transactions 
  } = useEarnWise();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Chart data: 14 days historical + 7 days forecast
  const chartItems = forecast.historicalChartData.slice(-21);
  const maxVal = Math.max(...chartItems.map(c => c.amount), 1800);

  const totalSourceIncome = incomeSources.reduce((acc, s) => acc + s.monthlyTotal, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Income Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Multi-Source Gig Earnings</h1>
          <p className="text-xs text-slate-400">
            Real-time multi-platform aggregation, volatility profiling & 7-day rule-based forecasting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connect Income</span>
          </button>

          <button
            onClick={onOpenPayoutModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Payout</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Step 5 Specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400">Today's Income</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ₹{forecast.todayIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-400">Settled payout</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400">7-Day Income</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ₹{forecast.sevenDayIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-400">+{forecast.trendPercentage}% vs prior wk</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400">30-Day Income</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ₹{forecast.thirtyDayIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Monthly run-rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400">Avg Daily Income</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ₹{forecast.averageDailyIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Engine baseline</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400">Income Volatility</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {forecast.volatility}
          </div>
          <span className="text-[10px] text-slate-400">Adaptive buffering on</span>
        </div>
      </div>

      {/* Interactive Income Chart with 7-Day Forecast (Step 5) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Historical Earnings & 7-Day Forecast</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Rule-Based Projection
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing past 14 days vs. estimated projection window for planning
            </p>
          </div>

          {/* Forecast Metric Badge */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs">
            <span className="text-slate-400">Next 7 Days Forecast:</span>
            <strong className="text-emerald-400 font-mono font-bold">
              ₹{forecast.forecastNext7DaysMin.toLocaleString('en-IN')} – ₹{forecast.forecastNext7DaysMax.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="h-52 w-full flex items-end gap-1.5 sm:gap-2 pt-6 px-1 border-b border-slate-800 pb-2">
          {chartItems.map((point, idx) => {
            const heightPercent = Math.min(100, Math.max(12, (point.amount / maxVal) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-950 border border-slate-700 text-white font-mono text-[10px] py-0.5 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-10">
                  {point.isForecast ? 'Forecast: ' : ''}₹{point.amount}
                </div>

                {/* Bar */}
                <div 
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    point.isForecast
                      ? 'bg-gradient-to-t from-blue-900/60 to-blue-500/60 border-t-2 border-dashed border-blue-400'
                      : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                <span className="text-[9px] text-slate-500 font-mono rotate-45 sm:rotate-0 mt-1">
                  {point.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>Historical Settled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500/60 border border-dashed border-blue-400" />
              <span>Next 7 Days Forecast Band</span>
            </div>
          </div>
          <span className="text-[11px] italic">
            *Rule-based moving average with weekday volume multiplier
          </span>
        </div>
      </div>

      {/* Multi-Source Breakdown (Step 6) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Income Sources</h3>
            <p className="text-xs text-slate-400">Active gig partnerships & direct statement links</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Monthly:</span>
            <div className="text-lg font-bold font-mono text-emerald-400">
              ₹{totalSourceIncome.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incomeSources.map(source => (
            <div 
              key={source.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: source.color }} 
                    />
                    <strong className="text-sm font-bold text-white">{source.name}</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Connected
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  ₹{source.monthlyTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Type: {source.type} • {source.payoutFrequency}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Last Payout: {source.lastPayoutDate}</span>
                <span className="text-emerald-400 font-medium">Syncing</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payout Stream */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white">Recent Settlements (Past 30 Days)</h3>
          <span className="text-xs text-slate-400">{transactions.length} records</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto pr-1">
          {transactions.slice(0, 10).map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                  {tx.source.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{tx.description}</div>
                  <div className="text-[11px] text-slate-400">{tx.date} • {tx.source}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  +₹{tx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">
                  Auto-saved: ₹{tx.autoSavedAmount || Math.round(tx.amount * 0.10)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Modal */}
      <IncomeConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};
