import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { ExplainableModal } from '../components/ExplainableModal';
import { Currency } from '../lib/currency';
import { Badge, Card, MaterialIcon } from '../components/ui';
import { MascotMonster, MonsterMood } from '../components/MascotMonster';

interface DashboardViewProps {
  onOpenPayoutModal: () => void;
  setActiveView: (view: string) => void;
}

function HealthRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f0eded" strokeWidth="4" />
        <circle
          cx="18" cy="18" r="15.9155" fill="none" stroke="#f9a61f" strokeWidth="4"
          strokeLinecap="round" strokeDasharray={`${pct}, 100`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl text-ink font-currency tabular-nums leading-none">{pct}</span>
        <span className="text-[10px] text-ink-subtle lowercase">/100</span>
      </div>
    </div>
  );
}

function HealthBarRow({ label, value, bar }: { label: string; value: number; bar: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted lowercase">{label}</span>
      <div className="flex items-center gap-2 w-1/2">
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
          <div className={`h-full ${bar} rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-ink-subtle text-xs font-semibold w-8 text-right font-currency">{value}%</span>
      </div>
    </div>
  );
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPayoutModal,
  setActiveView
}) => {
  const {
    monthIncome,
    monthSaved,
    monthInvested,
    monthTaxReserved,
    monthSpendable,
    financialHealth,
    todayAction,
    forecast,
    safeSpending,
    savingsSettings,
    transactions,
  } = useEarnWise();

  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  // Live Week-at-a-Glance aggregates from the actual settlement stream (last 7 days)
  const weekTx = transactions.slice(0, 7);
  const weekIncome = weekTx.reduce((acc, t) => acc + t.amount, 0);
  const weekSaved = weekTx.reduce((acc, t) => acc + (t.autoSavedAmount || 0), 0);
  const weekInvested = weekTx.reduce((acc, t) => acc + (t.investRecommendedAmount || 0), 0);
  const weekTax = weekTx.reduce((acc, t) => acc + (t.taxReservedAmount || 0), 0);

  const payout = todayAction.payoutAmount;
  const savePct = payout > 0 ? Math.round((todayAction.recommendedSave / payout) * 100) : 0;
  const taxPct = payout > 0 ? Math.round((todayAction.recommendedTax / payout) * 100) : 0;
  const todaySource = transactions[0]?.source;

  // Pacing vs own 30-day average (derived purely from existing data)
  const avg = forecast.averageDailyIncome;
  const pacePct = avg > 0 ? Math.round(((weekIncome - avg * 7) / (avg * 7)) * 100) : 0;

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

  // Health-derived mascot mood (data-backed rule): happy ≥75, calm ≥45, angry below
  const overall = financialHealth.overall;
  const healthMood: MonsterMood = overall >= 75 ? 'happy' : overall >= 45 ? 'calm' : 'angry';
  const standingChip = overall >= 75 ? 'good standing' : overall >= 45 ? 'needs attention' : 'critical risk';
  const allBuffersGreen = [financialHealth.incomeStability, financialHealth.savingsConsistency, financialHealth.emergencyFund, financialHealth.taxReadiness, financialHealth.investmentDiscipline].every(v => v >= 60);

  // This Month progress (bar only where a real target exists)
  const savedBudgetPct = Math.min(100, Math.round((monthSaved / Math.max(1, savingsSettings.monthlySavingsTarget)) * 100));

  const healthIndicators = [
    { label: 'income stability', value: financialHealth.incomeStability, bar: 'bg-ocean' },
    { label: 'savings consistency', value: financialHealth.savingsConsistency, bar: 'bg-primary' },
    { label: 'emergency fund', value: financialHealth.emergencyFund, bar: 'bg-berry-light' },
    { label: 'tax readiness', value: financialHealth.taxReadiness, bar: 'bg-ocean-light' },
    { label: 'invest discipline', value: financialHealth.investmentDiscipline, bar: 'bg-primary-deep' },
  ];

  // Take the last 14 days of historical data for the dashboard income trend
  const trendSlice = forecast.historicalChartData.filter(d => !d.isForecast).slice(-14);
  const maxIncome = Math.max(...trendSlice.map(d => d.amount), 1500);

  const todayTiles = [
    { label: 'save', value: todayAction.recommendedSave, pill: `${savePct}% auto-save`, tile: 'bg-primary-fixed border-primary shadow-[0_4px_0_0_#f9a61f]', labelClass: 'text-primary-deeper', valueClass: 'text-primary-on', pillClass: 'bg-surface text-primary-deep' },
    { label: 'invest', value: todayAction.recommendedInvest, pill: 'auto-invest', tile: 'bg-ocean-faint border-ocean shadow-[0_4px_0_0_#006686]', labelClass: 'text-ocean-bevel', valueClass: 'text-ink', pillClass: 'bg-surface text-ocean' },
    { label: 'tax reserve', value: todayAction.recommendedTax, pill: `${taxPct}% buffer`, tile: 'bg-berry-fixed border-berry shadow-[0_4px_0_0_#ad3300]', labelClass: 'text-berry-bevel', valueClass: 'text-ink', pillClass: 'bg-surface text-berry' },
    { label: 'spendable', value: todayAction.availableSpendable, pill: 'safe floor', tile: 'bg-surface-low border-bevel-neutral shadow-[0_4px_0_0_#d8c3ad]', labelClass: 'text-ink-muted', valueClass: 'text-ink', pillClass: 'bg-surface text-ink-subtle' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12 flex flex-col items-center">
      {/* Hero greeting (reference copy) */}
      <section className="w-full flex flex-col items-center pt-2 pb-7 text-center select-none">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight leading-none text-surface lowercase">
          {greeting},
        </h1>
        <p className="text-lg sm:text-2xl font-light text-surface opacity-95 mt-2 lowercase">
          your income changes every day. your financial plan does too.
        </p>
      </section>

      <div className="w-full space-y-8">
        {/* ===== Today's Financial Action (Smart Payout Allocator) ===== */}
        <div className="relative w-full flex flex-col items-center">
          {/* Mascot peeking over the top edge — mood derived from financial health */}
          <div className="relative flex justify-center items-end -mb-4 z-10 pointer-events-none select-none">
            <MascotMonster mood={healthMood} size="md" aria-hidden="true" />
          </div>

          <div className="relative w-full max-w-xl bg-surface rounded-cardlg p-6 sm:p-8 z-20 shadow-[0_8px_0_0_#ad3300] border-4 border-primary-dark">
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-[11px] tracking-wide uppercase px-3 py-1 bg-surface-container text-ink-muted rounded-full mb-2 font-semibold">
                smart payout allocator
              </span>
              <h2 className="text-2xl text-ink font-light lowercase">today&rsquo;s financial action</h2>
              <div className="flex items-center gap-1.5 text-ocean text-sm mt-1 mb-6 lowercase">
                <MaterialIcon name="verified" className="text-lg" filled />
                <Currency value={payout} /> received{todaySource ? ` from ${todaySource.toLowerCase()}` : ''}
              </div>

              {/* 4 numbered split tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-6">
                {todayTiles.map((tile) => (
                  <div key={tile.label} className={`flex flex-col items-center justify-between p-4 rounded-card border-2 ${tile.tile}`}>
                    <span className={`text-xs font-semibold lowercase ${tile.labelClass}`}>{tile.label}</span>
                    <span className={`text-2xl font-currency tabular-nums mt-1 leading-none ${tile.valueClass}`}>
                      <Currency value={tile.value} />
                    </span>
                    <span className={`text-[11px] mt-2 px-2 py-0.5 rounded-full font-semibold lowercase ${tile.pillClass}`}>{tile.pill}</span>
                  </div>
                ))}
              </div>

              {/* Explainable rationale */}
              <div className="w-full bg-surface-low rounded-btn p-4 text-left mb-6">
                <p className="text-sm text-ink-muted leading-relaxed lowercase flex items-start gap-2">
                  <MaterialIcon name="auto_awesome" className="text-lg text-primary-deep shrink-0 mt-0.5" filled />
                  <span>&ldquo;{todayAction.reason}&rdquo;</span>
                </p>
              </div>

              {/* Confirm / simulate split CTA */}
              <div className="relative w-full flex justify-center items-center">
                <button
                  type="button"
                  onClick={onOpenPayoutModal}
                  className="w-full max-w-xs py-3 px-8 bg-berry text-white text-base rounded-full shadow-[0_5px_0_0_#872600] active:translate-y-1 active:shadow-[0_2px_0_0_#872600] transition-all flex items-center justify-center gap-2 lowercase select-none cursor-pointer"
                >
                  <MaterialIcon name="bolt" className="text-lg" filled />
                  <span>simulate new payout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== This Month + Financial Health ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* This Month */}
          <div className="bg-surface rounded-card p-6 shadow-[0_5px_0_0_#d8c3ad] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" aria-hidden="true" />
                  <h3 className="text-2xl text-ink font-light lowercase">this month</h3>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-sm text-ink-subtle lowercase block">total deposited</span>
                  <span className="text-4xl text-ink font-currency tabular-nums leading-tight">
                    <Currency value={monthIncome} />
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-ink-subtle lowercase block">spendable</span>
                  <span className="text-2xl text-ocean font-currency tabular-nums leading-tight">
                    <Currency value={monthSpendable} />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-muted lowercase">auto-saved (goal: <Currency value={savingsSettings.monthlySavingsTarget} />)</span>
                    <span className="text-primary-deep font-bold font-currency"><Currency value={monthSaved} /></span>
                  </div>
                  <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${savedBudgetPct}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted lowercase">invested (index funds)</span>
                  <span className="text-ocean font-bold font-currency"><Currency value={monthInvested} /></span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted lowercase">tax reserved (safe side)</span>
                  <span className="text-berry font-bold font-currency"><Currency value={monthTaxReserved} /></span>
                </div>
              </div>
            </div>

            {/* Pacing footer: derived from the live 7-day stream vs 30-day average */}
            <div className="mt-6 pt-4 bg-surface-low rounded-btn px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-ink lowercase">pacing · this week vs your average</span>
              <span className="text-sm font-semibold text-ocean">
                {pacePct >= 0 ? `+${pacePct}% faster` : `${pacePct}% slower`}
              </span>
            </div>
          </div>

          {/* Financial Health */}
          <div className="bg-surface rounded-card p-6 shadow-[0_5px_0_0_#d8c3ad] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-ocean" aria-hidden="true" />
                  <h3 className="text-2xl text-ink font-light lowercase">financial health</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-ocean-faint text-ocean-bevel text-sm font-bold lowercase">
                  {standingChip}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <HealthRing value={overall} />
                <div className="flex flex-col justify-center text-left">
                  <span className="text-base text-ink lowercase">{allBuffersGreen ? 'all buffers green' : 'some buffers strained'}</span>
                  <p className="text-sm text-ink-muted lowercase mt-1">
                    emergency fund at {financialHealth.emergencyFund}% of your 3-month cushion target.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {healthIndicators.map((ind) => (
                  <HealthBarRow key={ind.label} label={ind.label} value={ind.value} bar={ind.bar} />
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-bevel-neutral flex items-center justify-between">
              <p className="text-[11px] text-ink-subtle">composite resilience for irregular income — not a credit score.</p>
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className="text-sm font-semibold text-ocean hover:underline flex items-center gap-1 cursor-pointer lowercase"
              >
                <span>view complete breakdown</span>
                <MaterialIcon name="arrow_forward" className="text-base" />
              </button>
            </div>
          </div>
        </div>

        {/* ===== Safe Spending + Weekly Digest ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Safe Spending Card */}
          <Card bevel="neutral">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2 lowercase">
              <span>safe to spend (this week)</span>
              <Badge variant="green">guarded</Badge>
            </div>
            <div className="text-3xl text-ink font-currency tabular-nums">
              <Currency value={safeSpending.safeWeeklySpending} />
            </div>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed lowercase">{safeSpending.explanation}</p>
            <div className="mt-3 pt-3 border-t border-bevel-neutral flex items-center justify-between text-[11px] text-ink-muted lowercase">
              <span>safe daily allowance:</span>
              <strong className="text-ink font-currency"><Currency value={safeSpending.safeDailyDiscretionary} />/day</strong>
            </div>
          </Card>

          {/* Weekly Digest Insight */}
          <Card bevel="none" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink lowercase">your week at a glance</span>
              <Badge variant="green">+{forecast.trendPercentage}% trend</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-cardmd bg-surface-low">
                <span className="text-[10px] text-ink-muted lowercase">income</span>
                <div className="font-bold text-ink font-currency"><Currency value={weekIncome} /></div>
              </div>
              <div className="p-2 rounded-cardmd bg-surface-low">
                <span className="text-[10px] text-ink-muted lowercase">saved</span>
                <div className="font-bold text-secondary font-currency"><Currency value={weekSaved} /></div>
              </div>
              <div className="p-2 rounded-cardmd bg-surface-low">
                <span className="text-[10px] text-ink-muted lowercase">invested</span>
                <div className="font-bold text-ocean font-currency"><Currency value={weekInvested} /></div>
              </div>
              <div className="p-2 rounded-cardmd bg-surface-low">
                <span className="text-[10px] text-ink-muted lowercase">tax res</span>
                <div className="font-bold text-primary-deep font-currency"><Currency value={weekTax} /></div>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted mt-2.5 italic lowercase">
              "{forecast.trendPercentage >= 0
                ? `you had a stronger earning week (+${forecast.trendPercentage}%), so earnwise increased your savings without violating your minimum balance.`
                : `earnings dipped ${Math.abs(forecast.trendPercentage)}% this week, so earnwise kept auto-save gentle to protect your cash flow.`}"
            </p>
          </Card>
        </div>

        {/* ===== Income Trend & Stability ===== */}
        <Card bevel="neutral">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="trending_up" className="text-xl text-ocean" />
                <h3 className="text-lg text-ink font-light lowercase">income trend &amp; stability</h3>
              </div>
              <p className="text-xs text-ink-muted lowercase">
                past 14 days daily settlement fluctuations &amp; 30-day average comparison
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-ocean" aria-hidden="true" />
                <span className="text-ink-muted lowercase">daily payout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-primary-dim border border-dashed border-primary-dim" aria-hidden="true" />
                <span className="text-ink-muted lowercase">avg (<Currency value={forecast.averageDailyIncome} />)</span>
              </div>
            </div>
          </div>

          <div className="h-44 w-full flex items-stretch gap-2 sm:gap-4 pt-6 px-1" role="img" aria-label="Income trend bar chart, last 14 days">
            {trendSlice.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(15, (item.amount / maxIncome) * 100));
              const isAboveAvg = item.amount >= forecast.averageDailyIncome;

              return (
                <div key={idx} className="flex-1 h-full flex flex-col items-center gap-2 group relative min-w-0">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-ink text-surface font-currency text-[10px] py-0.5 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-10" aria-hidden="true">
                    <Currency value={item.amount} />
                  </div>
                  {/* Bar track — a resolved height, so the bar's own % height works */}
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${
                        isAboveAvg ? 'bg-gradient-to-t from-ocean to-ocean' : 'bg-gradient-to-t from-surface-highest to-surface-high'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-subtle font-currency">{item.day.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-bevel-neutral flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-ink-muted lowercase">
            <span>average daily run-rate: <strong className="text-ink font-currency"><Currency value={forecast.averageDailyIncome} /></strong></span>
            <button
              type="button"
              onClick={() => setActiveView('income')}
              className="text-ocean hover:text-ocean font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>explore income intelligence</span>
              <MaterialIcon name="chevron_right" className="text-base" />
            </button>
          </div>
        </Card>
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