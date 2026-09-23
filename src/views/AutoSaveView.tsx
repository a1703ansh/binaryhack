import React, { useState } from 'react';
import { 
  PiggyBank, 
  ShieldCheck, 
  PauseCircle, 
  PlayCircle, 
  RotateCcw, 
  FastForward, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Sliders,
  Info
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';

export const AutoSaveView: React.FC = () => {
  const {
    savingsSettings,
    updateSavingsSettings,
    togglePauseAutoSave,
    skipTodayAutoSave,
    undoAutoSave,
    monthSaved,
    activityLogs,
    todayAction
  } = useEarnWise();

  const [minBalanceInput, setMinBalanceInput] = useState(savingsSettings.minimumBalance);
  const [targetInput, setTargetInput] = useState(savingsSettings.monthlySavingsTarget);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Exact Step 8 numbers:
  // Saved this month: ₹3,240, Target: ₹5,000, Progress: 64.8%
  const progressPercent = ((3240 / savingsSettings.monthlySavingsTarget) * 100).toFixed(1);

  const lastSaveLog = activityLogs.find(l => l.type === 'auto-save' && l.canUndo && !l.undone);

  const handleSaveGuardrails = () => {
    updateSavingsSettings({
      minimumBalance: minBalanceInput,
      monthlySavingsTarget: targetInput
    });
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <PiggyBank className="w-4 h-4" />
            <span>Proprietary Differentiator</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Adaptive Auto-Save Engine</h1>
          <p className="text-xs text-slate-400">
            Algorithmic micro-saving calibrated to irregular payouts with strict balance guardrails
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {savingsSettings.pausedToday ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>PAUSED FOR TODAY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AUTO-SAVE ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Summary (Step 8 Specification) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">Today's Recommended Saving</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ₹180
            </div>
            <span className="text-[11px] text-slate-500">Based on recent earning surge</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">Saved This Month</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              ₹3,240
            </div>
            <span className="text-[11px] text-slate-500">Across 22 micro-deductions</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">Monthly Target</span>
            <div className="text-2xl font-black font-mono text-slate-300 mt-1">
              ₹{savingsSettings.monthlySavingsTarget.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">Emergency fund allocation</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">Progress</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {progressPercent}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Explainable Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-200 leading-relaxed">
            <strong className="text-emerald-400 block mb-0.5">Explainable Automation Rationale:</strong>
            "Today's income is higher than your normal daily average, so EarnWise increased your saving amount while protecting your minimum balance."
          </div>
        </div>
      </div>

      {/* User Override Controls (Step 10: Pause Today, Skip Today, Undo) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white">Zero-Effort with 100% Control</h3>
          <p className="text-xs text-slate-400">
            You always retain full control. Pause, skip, or undo auto-savings at any moment without penalty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pause Today */}
          <button
            onClick={togglePauseAutoSave}
            className={`p-4 rounded-2xl border text-left transition-all ${
              savingsSettings.pausedToday
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {savingsSettings.pausedToday ? 'Resume Auto-Save' : 'Pause Today'}
              </span>
              {savingsSettings.pausedToday ? (
                <PlayCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <PauseCircle className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <p className="text-xs text-slate-400">
              {savingsSettings.pausedToday
                ? 'Auto-Save is paused for today. Click to resume normal operation.'
                : 'Paused for today. Resumes automatically tomorrow morning.'}
            </p>
          </button>

          {/* Skip Today */}
          <button
            onClick={skipTodayAutoSave}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-left transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Skip Today</span>
              <FastForward className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400">
              Skip auto-save on the next payout without altering tomorrow’s rules.
            </p>
          </button>

          {/* Undo Last Auto-Save */}
          <button
            onClick={() => {
              if (lastSaveLog) undoAutoSave(lastSaveLog.id);
            }}
            disabled={!lastSaveLog}
            className={`p-4 rounded-2xl border text-left transition-all ${
              lastSaveLog
                ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 text-slate-200 cursor-pointer'
                : 'bg-slate-950/40 border-slate-850 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Undo Last Auto-Save</span>
              <RotateCcw className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">
              {lastSaveLog
                ? `Revert today's ₹${lastSaveLog.amount} auto-save back to spendable balance.`
                : 'No recent auto-save available for rollback.'}
            </p>
          </button>
        </div>
      </div>

      {/* Decision Engine Tier Breakdown (Step 9) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Algorithmic Tiers & Guardrail Rules</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Pure Functional Engine
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            How EarnWise adapts auto-save dynamically to your daily income vs. 30-day average
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-slate-300 mb-1">Tier 1: Slump Day</div>
            <div className="text-amber-400 font-mono font-bold">&lt; 60% of Average</div>
            <div className="text-emerald-400 font-mono font-extrabold text-base my-1">Save 0%</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Auto-save pauses immediately to protect living expenses during low-order shifts.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-slate-300 mb-1">Tier 2: Lean Day</div>
            <div className="text-slate-300 font-mono font-bold">60% – 100% of Avg</div>
            <div className="text-emerald-400 font-mono font-extrabold text-base my-1">Save 5%</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Gentle micro-contribution to maintain consistency without squeezing pocket money.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 border-emerald-500/40 shadow-sm">
            <div className="font-bold text-emerald-400 mb-1">Tier 3: Strong Day (Active)</div>
            <div className="text-emerald-300 font-mono font-bold">100% – 150% of Avg</div>
            <div className="text-emerald-400 font-mono font-extrabold text-base my-1">Save 10% – 12%</div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Healthy day (e.g. ₹1,250 on ₹948 avg). EarnWise captures safe surplus automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-purple-400 mb-1">Tier 4: Peak Shift</div>
            <div className="text-purple-300 font-mono font-bold">&gt; 150% of Average</div>
            <div className="text-emerald-400 font-mono font-extrabold text-base my-1">Save 15%</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Rainy-day bonus! Captures high surge earnings to fast-track emergency targets.
            </p>
          </div>
        </div>
      </div>

      {/* Guardrails Configuration Form (Step 10) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Safety Guardrails & Targets</h3>
              <p className="text-xs text-slate-400">Hard ceilings and safety floors that the engine must never violate</p>
            </div>
          </div>
          {savedSuccessMsg && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardrails Updated</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Minimum Protected Balance (₹)
            </label>
            <input
              type="number"
              value={minBalanceInput}
              onChange={e => setMinBalanceInput(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Auto-Save will abort if balance drops below this amount.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Monthly Savings Target (₹)
            </label>
            <input
              type="number"
              value={targetInput}
              onChange={e => setTargetInput(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Baseline goal for emergency cushion top-ups.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Emergency Fund Milestone (₹)
            </label>
            <input
              type="number"
              readOnly
              value={savingsSettings.emergencyFundTarget}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-slate-400 text-sm cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              3 months essential living expenses cushion.
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveGuardrails}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            Save Guardrail Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
