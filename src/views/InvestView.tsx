import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useEarnWise } from '../context/EarnWiseContext';
import { INITIAL_INVESTMENT_CATEGORIES, generateAllocation, simulateGrowth } from '@earnwise/shared';
import { Currency, MaterialIcon } from '../components/ui';
import { MascotMonster } from '../components/MascotMonster';

const CATEGORY_META: Record<
  string,
  {
    icon: string;
    chip: string;
    stat: string;
    statValue: (cat: (typeof INITIAL_INVESTMENT_CATEGORIES)[number]) => string;
  }
> = {
  'liquid-fund': { icon: 'water_drop', chip: 'bg-ocean-faint text-ocean-bevel', stat: 'historical', statValue: cat => cat.expectedReturnRange },
  'index-fund': { icon: 'show_chart', chip: 'bg-ocean text-white', stat: 'historical', statValue: cat => cat.expectedReturnRange },
  'recurring-deposit': { icon: 'account_balance', chip: 'bg-primary text-primary-on', stat: 'guaranteed', statValue: cat => cat.expectedReturnRange },
  'digital-gold': { icon: 'diamond', chip: 'bg-primary-dim text-primary-on', stat: 'risk profile', statValue: cat => cat.risk },
};

const CATEGORY_LABEL: Record<string, string> = {
  'liquid-fund': 'liquid mutual fund',
  'index-fund': 'nifty 50 index',
  'recurring-deposit': 'flexi liquid deposit',
  'digital-gold': '24k digital gold',
};

const DAILY_DAYS_PER_MONTH = 30.416;

export const InvestView: React.FC = () => {
  const {
    investmentProfile,
    approveInvestmentPlan,
    monthInvested,
    monthSpendable,
    currentBalance,
    financialHealth,
    todayAction,
  } = useEarnWise();

  // What-If Simulator inputs — projection logic stays on simulateGrowth().
  const [dailySip, setDailySip] = useState<number>(100);
  const [annualRate, setAnnualRate] = useState<number>(0.10);
  const [isPlanApproved, setIsPlanApproved] = useState(false);

  // Deployable surplus: capped by actual spendable balance so approvals stay consistent
  const maxDeployable = Math.max(0, monthSpendable - 5000); // keep ₹5,000 floor protected
  const deployAmount = Math.min(1000, Math.max(0, maxDeployable));
  const quickAmounts = [100, 250, 500, 1000].filter(a => a <= Math.max(1000, maxDeployable));
  const [customDeploy, setCustomDeploy] = useState<number | null>(null);
  const effectiveDeploy = customDeploy ?? deployAmount;

  // Live 40/30/20/10 split computed from the deployable amount
  const allocation = generateAllocation(effectiveDeploy);

  // What-if projections across the three design horizons (1/3/5 years)
  const monthlyContribution = Math.round(dailySip * DAILY_DAYS_PER_MONTH);
  const sim1 = simulateGrowth(monthlyContribution, 1, annualRate);
  const sim3 = simulateGrowth(monthlyContribution, 3, annualRate);
  const sim5 = simulateGrowth(monthlyContribution, 5, annualRate);

  const handleApprovePlan = () => {
    approveInvestmentPlan(effectiveDeploy);
    setCustomDeploy(null);
    setIsPlanApproved(true);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setIsPlanApproved(false), 4000);
  };

  const riskChip =
    investmentProfile.riskLevel === 'Conservative'
      ? 'conservative & protected'
      : investmentProfile.riskLevel === 'Growth'
        ? 'growth oriented'
        : 'balanced & safe';

  const healthScore = financialHealth.investmentDiscipline;
  const cushionActive = currentBalance >= 5000;
  const dailyPace = Math.round(monthInvested / 30);

  const horizonCards = [
    { label: '1 year horizon', icon: 'calendar_today', result: sim1, totalTone: 'text-ink' },
    { label: '3 years horizon', icon: 'timeline', result: sim3, totalTone: 'text-ink' },
    { label: '5 years horizon', icon: 'rocket_launch', result: sim5, totalTone: 'text-berry' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-8">
      {/* Top visual intro & big typographic headline */}
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-ocean-faint text-ocean-bevel">
          <MaterialIcon name="insights" className="text-base" filled />
          <span className="text-xs font-semibold lowercase tracking-wider">automated portfolio · zero lock-in</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extralight tracking-tight leading-none text-surface lowercase select-none">
          invest advisor,
        </h1>
        <p className="text-lg sm:text-2xl text-surface opacity-95 font-light lowercase max-w-2xl">
          grow your gig savings into safe, long-term wealth
        </p>
      </div>

      {/* Upper row: investor profile & portfolio health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface rounded-card p-6 shadow-[0_5px_0_0_#d8c3ad] flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-ink lowercase">investor profile</span>
            </div>
            <span className="px-4 py-1 rounded-full bg-ocean-faint text-ocean-bevel text-sm font-semibold lowercase">
              {riskChip}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-low rounded-btn p-4">
              <span className="text-xs text-ink-muted lowercase block">invested this month</span>
              <span className="text-4xl text-ink font-currency tabular-nums tracking-tight mt-1 block">
                <Currency value={monthInvested} />
              </span>
              <span className="text-sm text-ink-muted mt-1 block">
                ~<Currency value={dailyPace} />/day micro-sip pace
              </span>
            </div>
            <div className="bg-surface-low rounded-btn p-4">
              <span className="text-xs text-ink-muted lowercase block">scheduled today</span>
              <span className="text-4xl text-berry font-currency tabular-nums tracking-tight mt-1 block">
                <Currency value={deployAmount} />
              </span>
              <span className="text-sm text-ink-muted mt-1 block">
                from today&rsquo;s <Currency value={Math.max(0, monthSpendable)} /> spendable surplus
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-muted">
            <div className="flex items-center justify-between rounded-btn bg-surface-low px-3 py-2">
              <span>saving consistency</span>
              <strong className="font-currency text-ink">{investmentProfile.factors.savingConsistency}%</strong>
            </div>
            <div className="flex items-center justify-between rounded-btn bg-surface-low px-3 py-2">
              <span>income volatility</span>
              <strong className="font-currency text-ink">{investmentProfile.factors.incomeVolatility}</strong>
            </div>
            <div className="flex items-center justify-between rounded-btn bg-surface-low px-3 py-2">
              <span>withdrawal risk</span>
              <strong className="font-currency text-ink">{investmentProfile.factors.withdrawalFrequency}</strong>
            </div>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            &ldquo;{investmentProfile.explanation}&rdquo;
          </p>
        </div>

        <div className="bg-primary-fixed rounded-card p-6 shadow-[0_5px_0_0_#f9a61f] flex flex-col justify-between gap-4 text-primary-on">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold lowercase opacity-90">portfolio health</span>
            <MaterialIcon name="verified_user" className="text-2xl" filled />
          </div>
          <div>
            <span className="text-6xl font-extralight tracking-tight leading-none block font-currency tabular-nums">{healthScore}%</span>
            <p className="text-sm mt-2 text-primary-deeper">
              {cushionActive
                ? 'liquid cushion active • protected against instant emergency pullouts'
                : 'liquid cushion low • top up the ₹5,000 reserve floor first'}
            </p>
          </div>
        </div>
      </div>

      {/* Core mascot allocation canvas */}
      <div className="relative w-full flex flex-col items-center">
        {/* Mascot peeking over the top edge */}
        <div className="relative flex justify-center items-end -mb-4 z-10 pointer-events-none select-none" aria-hidden="true">
          <MascotMonster mood="happy" size="md" />
        </div>

        {/* Mascot card frame */}
        <div className="relative w-full bg-surface rounded-card p-6 sm:p-8 shadow-[0_8px_0_0_#d8c3ad] z-20">
          <div className="flex flex-col gap-6 pt-2">
            {/* Allocation header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-primary uppercase tracking-wider block font-semibold">smart auto-split</span>
                <h2 className="text-3xl text-ink font-light lowercase">tailored allocation</h2>
              </div>
              <div className="text-right">
                <span className="text-sm text-ink-muted block lowercase">total transaction</span>
                <span className="text-4xl text-ink font-currency tabular-nums tracking-tight">
                  <Currency value={effectiveDeploy} />
                </span>
              </div>
            </div>

            {/* Chunky 4-segment allocation multi-bar */}
            <div className="w-full flex flex-col gap-2">
              <div className="w-full h-8 rounded-full overflow-hidden flex bg-surface-container p-1 gap-1">
                <div className="h-full rounded-full bg-ocean-dim transition-all duration-300" style={{ width: '40%' }} title="40% Liquid Mutual Fund" />
                <div className="h-full rounded-full bg-ocean transition-all duration-300" style={{ width: '30%' }} title="30% Nifty Index Fund" />
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: '20%' }} title="20% Flexi Recurring Deposit" />
                <div className="h-full rounded-full bg-primary-dim transition-all duration-300" style={{ width: '10%' }} title="10% Digital Gold" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-ocean-dim shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-ink lowercase truncate">40% liquid cash</span>
                    <span className="text-sm text-ink-muted"><Currency value={allocation.liquidFund} /></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-ocean shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-ink lowercase truncate">30% nifty index</span>
                    <span className="text-sm text-ink-muted"><Currency value={allocation.indexFund} /></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-ink lowercase truncate">20% flexi rd</span>
                    <span className="text-sm text-ink-muted"><Currency value={allocation.recurringDeposit} /></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary-dim shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-ink lowercase truncate">10% 24k gold</span>
                    <span className="text-sm text-ink-muted"><Currency value={allocation.digitalGold} /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action row: preset chips & physical CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-muted mr-1 lowercase">test sum:</span>
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCustomDeploy(val)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold lowercase transition-all cursor-pointer active:translate-y-1 ${
                      effectiveDeploy === val
                        ? 'bg-primary text-primary-on shadow-[0_3px_0_0_#ad3300]'
                        : 'bg-surface-container text-ink shadow-[0_3px_0_0_#d8c3ad]'
                    }`}
                  >
                    <Currency value={val} className="text-sm" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleApprovePlan}
                disabled={effectiveDeploy <= 0}
                className={`w-full sm:w-auto px-6 py-3 rounded-full text-base font-semibold lowercase flex items-center justify-center gap-2 shadow-[0_5px_0_0_#872600] active:translate-y-1 active:shadow-[0_2px_0_0_#872600] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                  isPlanApproved ? 'bg-ocean text-white' : 'bg-berry text-white'
                }`}
              >
                <MaterialIcon name={isPlanApproved ? 'check_circle' : 'task_alt'} className="text-xl" />
                <span>{isPlanApproved ? 'plan activated!' : 'approve plan'}</span>
              </button>
            </div>

            {/* Prototype note */}
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <MaterialIcon name="info" className="text-base flex-shrink-0" />
              <span>
                Prototype note: Derived from behavioral liquidity patterns. Not a SEBI suitability certificate. Simulated execution — recorded in Activity Log.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 flat asset-class cards */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl text-surface font-light lowercase">where every rupee travels</h3>
          <span className="text-sm text-surface opacity-80 lowercase">direct sebi registered routes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_INVESTMENT_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat.id] ?? CATEGORY_META['liquid-fund'];
            return (
              <div key={cat.id} className="bg-surface rounded-card p-4 shadow-[0_4px_0_0_#d8c3ad] flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.chip}`}>
                    <MaterialIcon name={meta.icon} className="text-2xl" />
                  </div>
                  <span className="text-sm font-semibold text-ink lowercase pt-1">{CATEGORY_LABEL[cat.id] ?? cat.title.toLowerCase()}</span>
                  <p className="text-sm text-ink-muted leading-relaxed">{cat.whyItFits}</p>
                </div>
                <div className="pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink-muted lowercase">{meta.stat}</span>
                  <span className="text-sm font-semibold text-ink">{meta.statValue(cat)}</span>
                </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-ink-muted lowercase">min order</span>
                    <span className="text-sm font-semibold text-ink">
                      <Currency value={cat.minContribution} className="text-sm" />
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-ink-muted lowercase">risk</span>
                    <span className="text-sm font-semibold text-ink">{cat.risk}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What-if projection simulator */}
      <div className="bg-surface rounded-card p-6 sm:p-8 shadow-[0_5px_0_0_#d8c3ad] flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs text-primary uppercase tracking-wider block font-semibold">wealth simulator</span>
            <h3 className="text-3xl text-ink font-light lowercase">what if you saved daily?</h3>
          </div>
          <div className="bg-surface-low px-4 py-1 rounded-full flex items-center gap-2">
            <span className="text-sm text-ink-muted lowercase">model assumption:</span>
            <span className="text-sm font-semibold text-ink">~{(annualRate * 100).toFixed(1)}% blended return</span>
          </div>
        </div>

        {/* Simulator slider controls */}
        <div className="flex flex-col gap-4 bg-surface-low rounded-btn p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink lowercase" htmlFor="daily-sip-slider">
              daily micro-contribution
            </label>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl text-ink font-currency tabular-nums tracking-tight">
                <Currency value={dailySip} />
              </span>
              <span className="text-sm text-ink-muted lowercase">/ day</span>
            </div>
          </div>
          <input
            id="daily-sip-slider"
            type="range"
            min={50}
            max={500}
            step={25}
            value={dailySip}
            onChange={e => setDailySip(Number(e.target.value))}
            className="slider-flat w-full"
          />
          <div className="flex justify-between text-sm text-ink-muted">
            <span>₹50/day</span>
            <span>₹250/day</span>
            <span>₹500/day</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-sm font-semibold text-ink lowercase" htmlFor="invest-rate-slider">
              annual return rate
            </label>
            <span className="text-sm font-semibold text-ink font-currency">{(annualRate * 100).toFixed(1)}% p.a.</span>
          </div>
          <input
            id="invest-rate-slider"
            type="range"
            min={0.06}
            max={0.14}
            step={0.01}
            value={annualRate}
            onChange={e => setAnnualRate(parseFloat(e.target.value))}
            className="slider-flat w-full"
          />
        </div>

        {/* Projection horizon comparison cards & stacked bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {horizonCards.map(h => {
            const pctGain = (h.result.estimatedGains / (h.result.futureCorpus || 1)) * 100;
            return (
              <div key={h.label} className="bg-surface-container rounded-btn p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-muted lowercase">{h.label}</span>
                  <MaterialIcon name={h.icon} className="text-lg text-ink-muted" />
                </div>
                <div>
                  <span className={`text-4xl font-currency tabular-nums tracking-tight block ${h.totalTone ?? 'text-ink'}`}>
                    <Currency value={h.result.futureCorpus} />
                  </span>
                  <span className="text-sm text-ink-muted lowercase mt-1 block">
                    <Currency value={h.result.totalInvested} /> invested
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-highest flex overflow-hidden">
                  <div className="h-full bg-ocean-dim" style={{ width: `${100 - pctGain}%` }} />
                  <div className="h-full bg-primary" style={{ width: `${pctGain}%` }} />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted lowercase">gains</span>
                  <span className="text-berry font-semibold font-currency">
                    <Currency value={h.result.estimatedGains} sign="plus" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick safety disclaimers */}
        <div className="flex items-center gap-2 pt-1">
          <MaterialIcon name="shield_with_heart" className="text-base text-ink-muted" />
          <span className="text-sm text-ink-muted lowercase">
            zero lock-in for liquid and index segments. instant automated pause anytime if gig income dips.
          </span>
        </div>
        <div className="rounded-btn bg-surface-low px-4 py-3 text-xs text-ink-muted lowercase">
          {sim1.disclaimer}
        </div>
      </div>
    </div>
  );
};