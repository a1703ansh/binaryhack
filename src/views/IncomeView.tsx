import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { IncomeConnectionModal } from '../components/IncomeConnectionModal';
import { Currency } from '../lib/currency';
import { Button, MaterialIcon } from '../components/ui';

interface IncomeViewProps {
  onOpenPayoutModal: () => void;
}

/* =========================================================
   Income intelligence — "Flat Mascot Playful" restyle.
   All aggregation, chart scaling and forecast reads are
   unchanged; only the presentation moved to design tokens.
   ========================================================= */

const KPI_TILES = [
  { key: 'todayIncome', label: 'Today’s income', sub: 'Settled payout', tile: 'bg-primary-fixed border-primary', value: 'text-primary-on', sub2: 'text-primary-deeper' },
  { key: 'sevenDayIncome', label: '7-day income', sub: 'vs prior week', tile: 'bg-ocean-faint border-ocean', value: 'text-ink', sub2: 'text-ocean-ondeep' },
  { key: 'thirtyDayIncome', label: '30-day income', sub: 'Monthly run-rate', tile: 'bg-surface-low border-bevel-neutral', value: 'text-ink', sub2: 'text-ink-subtle' },
  { key: 'averageDailyIncome', label: 'Avg daily income', sub: 'Engine baseline', tile: 'bg-berry-fixed border-berry', value: 'text-berry-ondeep', sub2: 'text-berry-ondeep' },
] as const;

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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-ui text-[11px] font-semibold text-ocean uppercase tracking-wider mb-1">
            <MaterialIcon name="trending_up" className="text-base" />
            <span>Income intelligence</span>
          </div>
          <h1 className="font-questrial text-3xl text-surface lowercase tracking-tight">multi-source earnings</h1>
          <p className="font-questrial text-sm text-surface/95 max-w-xl">
            real-time multi-platform aggregation, volatility profiling &amp; 7-day rule-based forecasting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="md" onClick={() => setIsConnectModalOpen(true)} className="rounded-full">
            <MaterialIcon name="link" className="text-base" />
            <span className="font-ui">Connect income</span>
          </Button>

          <Button variant="primary" size="md" onClick={onOpenPayoutModal} className="rounded-full">
            <MaterialIcon name="add_circle" className="text-lg" filled />
            <span className="font-ui">New payout</span>
          </Button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {KPI_TILES.map(t => (
          <div key={t.key} className={`p-4 rounded-card border-2 shadow-[0_4px_0_0_#d8c3ad] ${t.tile}`}>
            <span className="font-ui text-[11px] text-ink-muted">{t.label}</span>
            <div className={`font-currency tabular-nums text-xl mt-1 ${t.value}`}>
              <Currency value={forecast[t.key]} />
            </div>
            <span className={`font-ui text-[10px] ${t.sub2}`}>
              {t.key === 'sevenDayIncome' ? `+${forecast.trendPercentage}% vs prior wk` : t.sub}
            </span>
          </div>
        ))}

        <div className="col-span-2 sm:col-span-1 p-4 rounded-card border-2 border-bevel-neutral bg-surface-low shadow-[0_4px_0_0_#d8c3ad]">
          <span className="font-ui text-[11px] text-ink-muted">Income volatility</span>
          <div className="font-currency text-xl mt-1 text-berry">{forecast.volatility}</div>
          <span className="font-ui text-[10px] text-ink-subtle">Adaptive buffering on</span>
        </div>
      </div>

      {/* Earnings chart */}
      <div className="bg-surface rounded-card p-5 sm:p-6 shadow-[0_6px_0_0_#006686]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-questrial text-lg text-ink flex flex-wrap items-center gap-2">
              <span>Historical earnings &amp; 7-day forecast</span>
              <span className="px-2 py-0.5 rounded-full font-ui text-[10px] font-semibold bg-secondary/15 text-secondary-deep">
                Rule-based projection
              </span>
            </h3>
            <p className="font-questrial text-sm text-ink-muted mt-0.5">
              Past 14 days against the estimated projection window
            </p>
          </div>

          <div className="p-3 rounded-btn bg-surface-low flex items-center gap-3 shadow-[0_3px_0_0_#d8c3ad]">
            <span className="font-ui text-[11px] text-ink-subtle">Next 7 days forecast:</span>
            <strong className="font-currency tabular-nums text-xs font-bold text-secondary-deep">
              <Currency value={forecast.forecastNext7DaysMin} /> – <Currency value={forecast.forecastNext7DaysMax} />
            </strong>
          </div>
        </div>

        {/* Bars */}
        <div className="h-52 w-full flex items-stretch gap-1.5 sm:gap-2 pt-6 px-1 border-b border-bevel-neutral pb-2">
          {chartItems.map((point, idx) => {
            const heightPercent = Math.min(100, Math.max(12, (point.amount / maxVal) * 100));

            return (
              <div key={idx} className="flex-1 h-full flex flex-col items-center gap-2 group relative min-w-0">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-ink text-surface font-currency tabular-nums text-[10px] py-0.5 px-2 rounded-btn shadow-lg pointer-events-none whitespace-nowrap z-10">
                  {point.isForecast ? 'Forecast: ' : ''}<Currency value={point.amount} />
                </div>

                {/* Bar track — a resolved height, so the bar's own % height works */}
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      point.isForecast
                        ? 'bg-gradient-to-t from-ocean-bevel to-ocean-light border-t-2 border-dashed border-ocean'
                        : 'bg-gradient-to-t from-secondary-darkest to-secondary'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="font-currency text-[9px] text-ink-subtle rotate-45 sm:rotate-0">
                  {point.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-ui text-[11px] text-ink-muted">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-secondary" />
              <span>Historical settled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-ocean-light border border-dashed border-ocean" />
              <span>Next 7 days forecast band</span>
            </div>
          </div>
          <span className="italic text-ink-subtle">*Rule-based moving average with weekday volume multiplier</span>
        </div>
      </div>

      {/* Income sources */}
      <div className="bg-surface rounded-card p-5 sm:p-6 shadow-[0_6px_0_0_#845400]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-bevel-neutral mb-4">
          <div>
            <h3 className="font-questrial text-lg text-ink">Income sources</h3>
            <p className="font-ui text-[11px] text-ink-subtle">Active gig partnerships &amp; direct statement links</p>
          </div>
          <div className="text-right">
            <span className="font-ui text-[11px] text-ink-subtle">Total monthly:</span>
            <div className="font-currency tabular-nums text-lg font-bold text-secondary-deep">
              <Currency value={totalSourceIncome} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incomeSources.map(source => (
            <div key={source.id} className="p-4 rounded-card bg-surface-low flex flex-col justify-between shadow-[0_3px_0_0_#d8c3ad]">
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                    <strong className="font-questrial text-base text-ink truncate">{source.name}</strong>
                  </div>
                  <span className="font-ui text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary-deep font-semibold shrink-0">
                    Connected
                  </span>
                </div>
                <div className="font-currency tabular-nums text-2xl text-ink mt-2">
                  <Currency value={source.monthlyTotal} />
                </div>
                <div className="font-ui text-[11px] text-ink-muted mt-1">
                  Type: {source.type} • {source.payoutFrequency}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-bevel-neutral flex items-center justify-between font-ui text-[11px] text-ink-subtle">
                <span>Last payout: {source.lastPayoutDate}</span>
                <span className="text-secondary-deep font-semibold">Syncing</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent settlements */}
      <div className="bg-surface rounded-card p-5 sm:p-6 shadow-[0_6px_0_0_#d8c3ad]">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-bevel-neutral mb-4">
          <h3 className="font-questrial text-lg text-ink">Recent settlements (past 30 days)</h3>
          <span className="font-currency tabular-nums text-xs text-ink-subtle">
            {transactions.length} records
          </span>
        </div>

        <div className="divide-y divide-bevel-neutral max-h-80 overflow-y-auto pr-1">
          {transactions.slice(0, 10).map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-currency text-xs text-ink-muted shrink-0">
                  {tx.source.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-ui text-xs font-semibold text-ink truncate">{tx.description}</div>
                  <div className="font-ui text-[11px] text-ink-subtle">{tx.date} • {tx.source}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-currency tabular-nums font-bold text-secondary-deep text-sm">
                  <Currency value={tx.amount} sign="plus" />
                </div>
                <div className="font-currency tabular-nums text-[10px] text-ink-subtle">
                  Auto-saved: <Currency value={tx.autoSavedAmount || Math.round(tx.amount * 0.10)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection modal */}
      <IncomeConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};
