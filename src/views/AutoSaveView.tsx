import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { Currency } from '../lib/currency';
import { MaterialIcon, Input, Toggle } from '../components/ui';
import { MascotMonster, MonsterMood } from '../components/MascotMonster';

export const AutoSaveView: React.FC = () => {
  const {
    savingsSettings,
    updateSavingsSettings,
    togglePauseAutoSave,
    skipTodayAutoSave,
    undoAutoSave,
    monthSaved,
    activityLogs,
    todayAction,
    currentBalance,
    forecast,
    transactions,
  } = useEarnWise();

  const [minBalanceInput, setMinBalanceInput] = useState(savingsSettings.minimumBalance);
  const [targetInput, setTargetInput] = useState(savingsSettings.monthlySavingsTarget);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Live progress: monthSaved flows from the decision engine on every simulated payout
  const target = Math.max(1, savingsSettings.monthlySavingsTarget);
  const progressPercent = Math.min(100, (monthSaved / target) * 100).toFixed(1);

  // Count micro-deductions this month from the auto-save audit trail
  const microDeductionCount = activityLogs.filter(l => l.type === 'auto-save' && !l.undone).length;

  const lastSaveLog = activityLogs.find(l => l.type === 'auto-save' && l.canUndo && !l.undone);

  const handleSaveGuardrails = () => {
    updateSavingsSettings({
      minimumBalance: minBalanceInput,
      monthlySavingsTarget: targetInput
    });
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  // ---- Derived tier calibration (mirrors the reference thresholds, from live data) ----
  const avg = forecast?.averageDailyIncome ?? 0;
  const payout = todayAction.payoutAmount;
  const ratio = payout > 0 && avg > 0 ? payout / avg : 1;
  let tier = 3;
  if (payout > 0 && ratio < 0.6) tier = 1;
  else if (payout > 0 && ratio < 1.0) tier = 2;
  else if (payout > 0 && ratio > 1.5) tier = 4;

  const tierName = tier === 1 ? 'slump' : tier === 2 ? 'lean' : tier === 3 ? 'strong' : 'peak';
  const tierPct = tier === 1 ? '0%' : tier === 2 ? '5%' : tier === 3 ? '10% – 12%' : '15%';
  const tierPctShort = tier === 1 ? '0%' : tier === 2 ? '5%' : tier === 3 ? '12%' : '15%';

  const savePct = payout > 0 ? Math.round((todayAction.recommendedSave / payout) * 100) : 0;
  const source = (transactions[0]?.source ?? 'latest payout').toLowerCase();
  const reserveBuffer = currentBalance - savingsSettings.minimumBalance;

  // Calendar days left in the current cycle
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cycleDaysLeft = Math.max(0, daysInMonth - now.getDate());

  // ---- Guardrail-verified status (replaces the reference's static "liquidity active") ----
  const cap = Math.max(1, savingsSettings.maxMonthlyCap);
  const capPct = Math.min(100, Math.round((monthSaved / cap) * 100));
  const checksCleared = [
    savingsSettings.autoSaveActive,
    currentBalance >= savingsSettings.minimumBalance,
    monthSaved <= savingsSettings.maxMonthlyCap,
  ].filter(Boolean).length;

  // ---- Mascot mood derived from engine state ----
  const isFloorBreached = currentBalance < savingsSettings.minimumBalance;
  const mascotMood: MonsterMood = isFloorBreached
    ? 'angry'
    : savingsSettings.pausedToday
      ? 'calm'
      : 'happy';

  const recentLogs = activityLogs.filter(l => l.type === 'auto-save').slice(0, 5);

  return (
    <div className="relative w-full pb-12 flex flex-col gap-6">
      {/* ===== Top Hero Header Area ===== */}
      <div className="flex flex-col gap-1 pt-2">
        <div className="inline-flex items-center gap-1 self-start px-4 py-1 rounded-full bg-surface text-ocean-ondeep shadow-[0_4px_0_0_#005773]">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs lowercase tracking-wide font-semibold">
            engine {savingsSettings.pausedToday ? 'paused' : 'active'} · tier {tier} calibrated
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-surface lowercase leading-none">
          auto-save engine,
        </h1>
        <p className="text-lg sm:text-2xl font-light text-surface opacity-95 lowercase max-w-2xl">
          real-time adaptive saving tuned for your daily gig earnings.
        </p>
      </div>

      {/* ===== 4 Flat Hero KPI Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Today's Recommended */}
        <div className="bg-surface rounded-card p-5 shadow-[0_5px_0_0_#f9a61f] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-ink-muted lowercase">today&rsquo;s recommended</span>
            <MaterialIcon name="bolt" className="text-2xl text-primary" filled />
          </div>
          <div className="my-1">
            <div className="font-currency text-4xl text-primary-deep lowercase tracking-tight tabular-nums">
              <Currency value={todayAction.recommendedSave} />
            </div>
          </div>
          <div className="pt-1 flex items-center gap-1.5 text-ink-muted text-sm lowercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>from <Currency value={payout} /> {source} payout</span>
          </div>
        </div>

        {/* KPI 2: Saved This Month */}
        <div className="bg-surface rounded-card p-5 shadow-[0_5px_0_0_#d8c3ad] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-ink-muted lowercase">saved this month</span>
            <MaterialIcon name="savings" className="text-2xl text-ocean" />
          </div>
          <div className="my-1">
            <div className="font-currency text-4xl text-ink lowercase tracking-tight tabular-nums">
              <Currency value={monthSaved} />
            </div>
          </div>
          <div className="pt-1 text-ink-muted text-sm lowercase">
            {progressPercent}% of monthly target reached
          </div>
        </div>

        {/* KPI 3: Monthly Target */}
        <div className="bg-surface rounded-card p-5 shadow-[0_5px_0_0_#d8c3ad] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-ink-muted lowercase">monthly target</span>
            <MaterialIcon name="flag" className="text-2xl text-ink-subtle" />
          </div>
          <div className="my-1">
            <div className="font-currency text-4xl text-ink lowercase tracking-tight tabular-nums">
              <Currency value={savingsSettings.monthlySavingsTarget} />
            </div>
          </div>
          <div className="pt-1 text-ink-muted text-sm lowercase">
            {cycleDaysLeft} days remaining in cycle
          </div>
        </div>

        {/* KPI 4: Progress Velocity */}
        <div className="bg-surface rounded-card p-5 shadow-[0_5px_0_0_#d8c3ad] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-ink-muted lowercase">progress velocity</span>
            <MaterialIcon name="speed" className="text-2xl text-ocean" />
          </div>
          <div className="my-1">
            <div className="font-currency text-4xl text-ink lowercase tracking-tight tabular-nums">{progressPercent}%</div>
          </div>
          <div className="w-full bg-surface-high h-3 rounded-full overflow-hidden p-0.5">
            <div className="bg-primary h-full rounded-full shadow-[0_2px_0_0_#ad3300] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ===== Main Content Bento: Rationale + Mascot + Controls ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Mascot Holding Central Algorithmic Card */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex justify-center -mb-4 z-10 pointer-events-none select-none">
            <div className="flex justify-center items-end" aria-hidden="true">
              <MascotMonster mood={mascotMood} size="md" />
            </div>
          </div>

          {/* The White Rationale Card */}
          <div className="bg-surface rounded-card p-6 sm:p-8 shadow-[0_6px_0_0_#f9a61f] flex-1 flex flex-col justify-between z-20">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-ocean" />
                  <span className="text-2xl text-ink font-light lowercase">algorithmic rationale</span>
                </div>
                <span className="px-4 py-1 rounded-full bg-ocean-faint text-ocean-bevel text-sm font-semibold shadow-[0_3px_0_0_#004d66]">
                  tier {tier} · {tierPct}
                </span>
              </div>

              <div className="bg-surface-low rounded-btn p-4 mb-4 text-ink-muted text-lg lg:text-xl leading-relaxed lowercase">
                &ldquo;earnwise allocated <span className="text-primary-deep font-bold font-currency"><Currency value={todayAction.recommendedSave} /></span> ({savePct}%) today. daily income of <span className="text-ink font-bold font-currency"><Currency value={payout} /></span> falls in{' '}
                <span className="text-ink font-bold">tier {tier}</span> ({tierName} day, {tier === 3 ? '100–150% of your ₹' : tier === 2 ? '60–100% of your ₹' : tier === 1 ? 'below 60% of your ₹' : 'above 150% of your ₹'}{Math.round(avg)} baseline). account balance <span className="text-ink font-bold font-currency"><Currency value={currentBalance} /></span> is comfortably above your <span className="text-ink font-bold font-currency"><Currency value={savingsSettings.minimumBalance} /></span> reserve floor with {checksCleared} guardrail checks cleared.&rdquo;
              </div>
            </div>

            {/* Live Breakdown Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-surface-container rounded-btn p-3 flex flex-col">
                <span className="text-xs text-ink-muted lowercase">income detected</span>
                <span className="font-currency text-2xl text-ink lowercase tabular-nums"><Currency value={payout} /></span>
                <span className="text-sm text-ink-muted lowercase">{source} payout</span>
              </div>
              <div className="bg-surface-container rounded-btn p-3 flex flex-col">
                <span className="text-xs text-ink-muted lowercase">reserve buffer</span>
                <span className={`font-currency text-2xl lowercase tabular-nums ${reserveBuffer >= 0 ? 'text-ocean' : 'text-berry'}`}>
                  {reserveBuffer >= 0 ? '+' : '−'}<Currency value={Math.abs(reserveBuffer)} />
                </span>
                <span className="text-sm text-ink-muted lowercase">over safe baseline</span>
              </div>
              <div className="bg-surface-container rounded-btn p-3 flex flex-col">
                <span className="text-xs text-ink-muted lowercase">suggested bucket</span>
                <span className="font-currency text-2xl text-berry lowercase tabular-nums">emergency</span>
                <span className="text-sm text-ink-muted lowercase">high priority pool</span>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Controls & Overrides */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-surface rounded-card p-6 shadow-[0_5px_0_0_#d8c3ad] flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MaterialIcon name="tune" className="text-2xl text-ocean" />
                <h2 className="text-2xl text-ink font-light lowercase">worker overrides</h2>
              </div>
              <p className="text-sm text-ink-muted lowercase mb-5">
                full control over daily deductions with instant reversal.
              </p>

              <div className="flex flex-col gap-4">
                {/* Pause Today Toggle Box */}
                <div className="bg-surface-low rounded-btn px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-base text-ink lowercase">pause today</span>
                    <span className="text-sm text-ink-muted lowercase">auto-deduction resumes in 24 hrs</span>
                  </div>
                  <Toggle checked={savingsSettings.pausedToday} onChange={togglePauseAutoSave} title="Pause or resume auto-save for today" />
                </div>

                {/* Skip Today Action Button */}
                <div className="bg-surface-low rounded-btn px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-base text-ink lowercase">skip today</span>
                    <span className="text-sm text-ink-muted lowercase">keep 100% payout spendable</span>
                  </div>
                  <button
                    type="button"
                    onClick={skipTodayAutoSave}
                    disabled={savingsSettings.skipToday}
                    className="px-4 py-2.5 rounded-full bg-berry text-white text-sm lowercase shadow-[0_5px_0_0_#872600] active:translate-y-1 active:shadow-[0_2px_0_0_#872600] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {savingsSettings.skipToday ? 'skipped' : 'skip'}
                  </button>
                </div>

                {/* Undo Last Auto-Save */}
                <div className="bg-surface-low rounded-btn px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-base text-ink lowercase">undo last auto-save</span>
                    <span className="text-sm text-ink-muted lowercase">
                      {lastSaveLog
                        ? `refund ${lastSaveLog.amount ? '₹' + lastSaveLog.amount.toLocaleString('en-IN') : ''} back to spendable`
                        : 'no recent auto-save available for rollback'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (lastSaveLog) undoAutoSave(lastSaveLog.id); }}
                    disabled={!lastSaveLog}
                    className="px-4 py-2.5 rounded-full bg-surface text-ink text-sm lowercase shadow-[0_4px_0_0_#d8c3ad] active:translate-y-1 active:shadow-[0_2px_0_0_#d8c3ad] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    refund
                  </button>
                </div>
              </div>
            </div>

            {/* Status toast (derived from live engine state) */}
            <div className="mt-4 p-3 rounded-btn bg-primary-fixed text-primary-on text-sm lowercase flex items-center gap-1 transition-opacity">
              <MaterialIcon name={savingsSettings.pausedToday ? 'pause_circle' : 'verified_user'} className="text-lg" filled />
              <span>
                {savingsSettings.pausedToday
                  ? 'engine paused for 24h · resuming automatically tomorrow'
                  : `engine active · tier ${tier} calibrated & ready`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Dynamic Allocation Matrix (4 Tiers) ===== */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <h2 className="text-2xl text-surface font-light lowercase">dynamic allocation matrix</h2>
            <p className="text-sm text-surface opacity-90 lowercase">rules automatically adapt percentages based on your daily payout tier</p>
          </div>
          <span className="text-xs text-surface lowercase self-start sm:self-auto px-3 py-0.5 rounded-full bg-ocean shadow-[0_2px_0_0_#004d66] font-semibold">
            daily baseline: <Currency value={Math.round(avg)} />
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tier 1: Slump */}
          <div className={`bg-surface rounded-card p-5 shadow-[0_4px_0_0_#d8c3ad] flex flex-col justify-between ${tier === 1 ? 'shadow-[0_6px_0_0_#ad3300] -translate-y-1 border-2 border-berry' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-base lowercase ${tier === 1 ? 'text-primary-deep font-bold' : 'text-ink'}`}>tier 1: slump</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${tier === 1 ? 'bg-primary text-primary-ondeep shadow-[0_2px_0_0_#ad3300]' : 'bg-surface-highest text-ink-muted'}`}>0%</span>
            </div>
            <div className={`my-1 font-currency text-2xl lowercase tracking-tight tabular-nums ${tier === 1 ? 'text-primary-deep' : 'text-ink'}`}>
              &lt; ₹{Math.round(avg * 0.6)}
            </div>
            <p className="text-sm text-ink-muted lowercase pt-1">
              zero saving trigger. keeps every rupee for essential daily survival.
            </p>
          </div>

          {/* Tier 2: Lean */}
          <div className={`bg-surface rounded-card p-5 shadow-[0_4px_0_0_#d8c3ad] flex flex-col justify-between ${tier === 2 ? 'shadow-[0_6px_0_0_#ad3300] -translate-y-1 border-2 border-berry' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-base lowercase ${tier === 2 ? 'text-primary-deep font-bold' : 'text-ink'}`}>tier 2: lean</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${tier === 2 ? 'bg-primary text-primary-ondeep shadow-[0_2px_0_0_#ad3300]' : 'bg-surface-highest text-ink-muted'}`}>5%</span>
            </div>
            <div className={`my-1 font-currency text-2xl lowercase tracking-tight tabular-nums ${tier === 2 ? 'text-primary-deep' : 'text-ink'}`}>
              ₹{Math.round(avg * 0.6)} – ₹{Math.round(avg * 1.0)}
            </div>
            <p className="text-sm text-ink-muted lowercase pt-1">
              gentle micropenny saving without restricting meal or fuel costs.
            </p>
          </div>

          {/* Tier 3: Strong (ACTIVE TODAY) */}
          <div className={`bg-surface rounded-card p-5 shadow-[0_4px_0_0_#d8c3ad] flex flex-col justify-between relative ${tier === 3 ? 'shadow-[0_6px_0_0_#ad3300] -translate-y-1 border-2 border-berry' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className={`text-base lowercase font-bold ${tier === 3 ? 'text-primary-deep' : 'text-ink'}`}>tier 3: strong</span>
              </div>
              {tier === 3 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-ondeep text-xs shadow-[0_2px_0_0_#ad3300]">active today</span>
              )}
            </div>
            <div className={`my-1 font-currency text-2xl lowercase tracking-tight tabular-nums ${tier === 3 ? 'text-primary-deep' : 'text-ink'}`}>
              ₹{Math.round(avg * 1.0)} – ₹{Math.round(avg * 1.5)}
            </div>
            <div className="pt-1 flex items-center justify-between text-ink-muted text-sm lowercase">
              <span>allocates 10%–12%</span>
              {tier === 3 ? (
                <span className="text-sm text-primary-deep font-bold font-currency">
                  <Currency value={todayAction.recommendedSave} /> queued
                </span>
              ) : (
                <span className="text-sm text-ink-subtle">{tierPctShort}</span>
              )}
            </div>
          </div>

          {/* Tier 4: Peak */}
          <div className={`bg-surface rounded-card p-5 shadow-[0_4px_0_0_#d8c3ad] flex flex-col justify-between ${tier === 4 ? 'shadow-[0_6px_0_0_#ad3300] -translate-y-1 border-2 border-berry' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-base lowercase ${tier === 4 ? 'text-primary-deep font-bold' : 'text-ink'}`}>tier 4: peak</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${tier === 4 ? 'bg-primary text-primary-ondeep shadow-[0_2px_0_0_#ad3300]' : 'bg-surface-highest text-ink-muted'}`}>15%</span>
            </div>
            <div className={`my-1 font-currency text-2xl lowercase tracking-tight tabular-nums ${tier === 4 ? 'text-primary-deep' : 'text-ink'}`}>
              &gt; ₹{Math.round(avg * 1.5)}
            </div>
            <p className="text-sm text-ink-muted lowercase pt-1">
              accelerated savings on marathon weekend festivals and surge hours.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Safety Guardrails & Floor Limits ===== */}
      <div className="bg-surface rounded-card p-6 shadow-[0_5px_0_0_#d8c3ad] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ocean-faint flex items-center justify-center text-ocean-bevel">
              <MaterialIcon name="shield" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl text-ink font-light lowercase">safety guardrails &amp; floor limits</h2>
              <p className="text-sm text-ink-muted lowercase">preventing overdrafts and preserving operational liquidity</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary-fixed text-primary-on self-start sm:self-auto shadow-[0_3px_0_0_#ffb959]">
            <MaterialIcon name="lock_reset" className="text-lg" />
            <span className="text-xs lowercase font-semibold">zero-fee protection guarantee</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Guardrail 1: Minimum Reserve Floor */}
          <div className="bg-surface-low rounded-btn p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ink-muted lowercase">minimum reserve floor</span>
              <span className="text-base text-primary-deep lowercase font-bold font-currency"><Currency value={minBalanceInput} /></span>
            </div>
            <div className="py-2">
              <Input
                type="number"
                value={minBalanceInput}
                onChange={e => setMinBalanceInput(Number(e.target.value))}
                aria-label="Minimum protected balance"
              />
            </div>
            <p className="text-sm text-ink-muted lowercase">
              if balance drops below this floor, all automatic transfers halt instantly.
            </p>
          </div>

          {/* Guardrail 2: Monthly Saving Cap */}
          <div className="bg-surface-low rounded-btn p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ink-muted lowercase">monthly saving cap</span>
              <span className="text-base text-ink lowercase font-bold font-currency">
                <Currency value={savingsSettings.maxMonthlyCap} />
              </span>
            </div>
            <div className="py-2 flex items-center gap-2">
              <div className="flex-1 bg-surface-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-ocean h-full rounded-full transition-all duration-500" style={{ width: `${capPct}%` }} />
              </div>
              <span className="text-xs text-ink-muted font-semibold font-currency">{capPct}%</span>
            </div>
            <p className="text-sm text-ink-muted lowercase">
              <Currency value={monthSaved} /> saved of <Currency value={savingsSettings.maxMonthlyCap} /> ceiling. won&rsquo;t over-lock cash flow.
            </p>
          </div>

          {/* Guardrail 3: Smart Liquidity Protection */}
          <div className="bg-surface-low rounded-btn p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ink-muted lowercase">liquidity protection</span>
              <span className="px-2 py-0.5 rounded-full bg-ocean text-white text-xs font-semibold">
                {isFloorBreached ? 'breached' : 'active'}
              </span>
            </div>
            <div className="flex items-center gap-2 py-2">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary shadow-[0_2px_0_0_#d8c3ad]">
                <MaterialIcon name="verified" className="text-lg" filled />
              </div>
              <span className="text-base text-ink lowercase">all {checksCleared}/3 checks cleared</span>
            </div>
            <p className="text-sm text-ink-muted lowercase">
              {isFloorBreached
                ? 'balance fell below your floor — automatic transfers are halted.'
                : 'auto-save halts instantly if balance drops below your reserve floor.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          <div className="bg-surface-low rounded-btn p-5 flex flex-col justify-between">
            <label className="block text-sm text-ink-muted lowercase mb-1">monthly saving target</label>
            <Input
              type="number"
              value={targetInput}
              onChange={e => setTargetInput(Number(e.target.value))}
              aria-label="Monthly savings target"
            />
            <p className="text-sm text-ink-muted lowercase mt-1">baseline goal for emergency cushion top-ups.</p>
          </div>

          <div className="bg-surface-low rounded-btn p-5 flex flex-col justify-between">
            <label className="block text-sm text-ink-muted lowercase mb-1">emergency fund milestone</label>
            <Input
              type="number"
              readOnly
              value={savingsSettings.emergencyFundTarget}
              aria-label="Emergency fund milestone"
              className="cursor-not-allowed"
            />
            <p className="text-sm text-ink-muted lowercase mt-1">3 months essential living expenses cushion.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-sm text-ink-subtle lowercase">saved across {microDeductionCount} micro-deductions this month</div>
          <div className="flex items-center gap-3">
            {savedSuccessMsg && (
              <span className="text-sm font-semibold text-secondary flex items-center gap-1 lowercase">
                <MaterialIcon name="check_circle" className="text-base" filled />
                <span>guardrails updated</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveGuardrails}
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-secondary text-white shadow-[0_5px_0_0_#065f46] active:translate-y-1 active:shadow-[0_2px_0_0_#065f46] transition-all cursor-pointer"
            >
              save guardrail preferences
            </button>
          </div>
        </div>
      </div>

      {/* ===== Recent Auto-Save Activity (read-only audit trail) ===== */}
      {recentLogs.length > 0 && (
        <div className="bg-surface rounded-card p-6 shadow-[0_5px_0_0_#d8c3ad]">
          <div className="flex items-center gap-2 mb-1">
            <MaterialIcon name="receipt_long" className="text-xl text-ocean" />
            <h2 className="text-2xl text-ink font-light lowercase">recent auto-save activity</h2>
          </div>
          <p className="text-sm text-ink-muted lowercase mb-4">read-only audit trail of this month&rsquo;s micro-deductions.</p>
          <ul className="flex flex-col gap-3">
            {recentLogs.map(log => (
              <li key={log.id} className="flex items-center justify-between gap-3 bg-surface-low rounded-btn px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm text-ink lowercase">{log.title}</span>
                  <span className="text-xs text-ink-muted lowercase">
                    {log.undone ? 'reversed' : 'captured'} · {new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`font-currency text-base font-bold tabular-nums ${log.undone ? 'text-ink-subtle line-through' : 'text-primary-deep'}`}>
                  {log.undone ? '−' : '+'}<Currency value={log.amount} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};