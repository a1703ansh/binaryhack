import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useEarnWise } from '../context/EarnWiseContext';
import { type Platform, type DecisionResult } from '@earnwise/shared';
import { MascotMonster } from './MascotMonster';
import { Currency } from '../lib/currency';
import { MaterialIcon } from './ui';

interface PayoutSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewActivity?: () => void;
}

/* =========================================================
   Payout Simulator — "Flat Mascot Playful" restyle.
   All calculation logic is untouched and lives in the engine:
   this markup only *echoes* decision.saveAmount /
   investRecommendAmount / taxReserveAmount / spendableAmount.
   No arithmetic is performed here.
   ========================================================= */

/** Amount presets shown as labelled chips (same values the app already offered). */
const AMOUNT_PRESETS: { value: number; label: string }[] = [
  { value: 650, label: 'Lean Day' },
  { value: 950, label: 'Baseline' },
  { value: 1250, label: 'Strong Day' },
  { value: 2100, label: 'Peak Surges' },
];

const SOURCES: Platform[] = ['Swiggy', 'Uber', 'Zomato', 'Rapido', 'Freelancing'];

export const PayoutSimulatorModal: React.FC<PayoutSimulatorModalProps> = ({
  isOpen,
  onClose,
  onViewActivity
}) => {
  const { simulateNewPayout, forecast, savingsSettings } = useEarnWise();
  const [source, setSource] = useState<Platform>('Swiggy');
  const [amount, setAmount] = useState<number>(1250);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [decision, setDecision] = useState<DecisionResult | null>(null);

  if (!isOpen) return null;

  const sequenceSteps = [
    'Income received from platform...',
    'Analyzing income against 30-day baseline...',
    'Evaluating income tier & volatility...',
    'Calculating safe auto-save buffer...',
    'Calculating 10% advance tax reserve...',
    'Preparing micro-investment recommendations...',
    'Guarding ₹5,000 minimum balance floor...',
    'Simulated ledger updated!'
  ];

  const handleStartSimulation = async () => {
    if (!amount || amount <= 0) return;
    setIsProcessing(true);
    setStepIndex(0);
    setDecision(null);

    // Step through the animated analysis sequence
    for (let i = 0; i < sequenceSteps.length; i++) {
      setStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 380));
    }

    const res = await simulateNewPayout(source, amount);
    setDecision(res);
    setIsProcessing(false);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const handleReset = () => {
    setDecision(null);
    setIsProcessing(false);
    setStepIndex(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Smart Payout Simulator"
    >
      <div className="relative w-full max-w-xl bg-surface rounded-card border-t-8 border-b-8 border-primary shadow-[0_10px_0_0_#ad3300] p-5 sm:p-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-bevel-neutral">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-on shadow-[0_3px_0_0_#ad3300]">
              <MaterialIcon name="bolt" className="text-xl" filled />
            </div>
            <div>
              <h2 className="font-questrial text-lg text-ink leading-tight">Smart Payout Simulator</h2>
              <p className="font-ui text-[11px] text-ink-subtle">
                watch how earnwise protects your cash flow before deducting a single rupee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-ink-subtle hover:bg-surface-high hover:text-ink transition-colors cursor-pointer"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        {/* ── Input state ────────────────────────────────────── */}
        {!isProcessing && !decision && (
          <div className="mt-5 space-y-5">
            <div>
              <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-primary-deep">
                Step 1 — Input payout amount
              </span>
              <h3 className="font-questrial text-xl text-ink">Simulate today&apos;s earnings</h3>
            </div>

            {/* Income source */}
            <div>
              <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Income source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SOURCES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSource(p)}
                    aria-pressed={source === p}
                    className={`px-3 py-2 rounded-btn font-ui text-xs font-semibold border-2 transition-all cursor-pointer ${
                      source === p
                        ? 'bg-primary-fixed border-primary text-primary-deep shadow-[0_2px_0_0_#f9a61f]'
                        : 'bg-surface-low border-bevel-neutral text-ink-muted hover:bg-surface-high'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount presets + custom */}
            <div>
              <label className="block font-ui text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Payout amount (₹)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {AMOUNT_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setAmount(preset.value)}
                    aria-pressed={amount === preset.value}
                    className={`flex flex-col items-center px-3 py-1.5 rounded-full font-currency tabular-nums border-2 transition-all cursor-pointer ${
                      amount === preset.value
                        ? 'bg-primary text-primary-on border-primary shadow-[0_3px_0_0_#ad3300]'
                        : 'bg-surface-low text-ink-muted border-bevel-neutral hover:bg-surface-high'
                    }`}
                  >
                    <span className="text-xs font-semibold">
                      <Currency value={preset.value} />
                    </span>
                    <span className="text-[10px] opacity-75">{preset.label}</span>
                  </button>
                ))}

                <div className="relative flex items-center bg-surface rounded-full pl-3 pr-3 py-1.5 shadow-[0_3px_0_0_#d8c3ad] border-2 border-bevel-neutral">
                  <span className="font-currency text-sm text-ink-subtle font-bold mr-1">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                    aria-label="Custom payout amount"
                    placeholder="Other"
                    className="w-20 bg-transparent font-currency tabular-nums text-sm text-ink focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mascot explainability bubble */}
            <div className="bg-surface-container rounded-card p-4 flex items-start gap-3">
              <div className="w-11 h-11 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-on shadow-[0_3px_0_0_#ad3300]">
                <MaterialIcon name="smart_toy" className="text-xl" filled />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-ui text-xs font-bold text-ink">Mascot Explainability Guard</span>
                  <span className="px-2 py-0.5 rounded-full bg-ocean-faint text-ocean-ondeep font-ui text-[10px] font-semibold">
                    Safe-to-spend active
                  </span>
                </div>
                <p className="font-questrial text-sm text-ink-muted leading-relaxed">
                  EarnWise compares this payout against your 30-day baseline (
                  <Currency value={forecast.averageDailyIncome} className="font-currency" />
                  ), locks your <Currency value={savingsSettings.minimumBalance} className="font-currency" /> minimum
                  cash floor, provisions 10% taxes, and routes safe surplus into savings and investments.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartSimulation}
              className="w-full py-3.5 rounded-full font-ui font-bold text-sm bg-berry text-white shadow-[0_5px_0_0_#842500] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_0_#842500] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MaterialIcon name="bolt" className="text-lg" filled />
              <span>Process payout &amp; run decision engine</span>
            </button>
          </div>
        )}

        {/* ── Processing state: 8-step transparent machine logic ── */}
        {isProcessing && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col items-center text-center gap-2">
              <MascotMonster mood={stepIndex > 4 ? 'happy' : 'surprised'} isBouncing size="sm" />
              <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-primary-deep">
                Step 2 — Transparent machine logic
              </span>
              <p className="font-questrial text-sm text-ink min-h-[1.5rem]">{sequenceSteps[stepIndex]}</p>
              <p className="font-currency tabular-nums text-[11px] text-ink-subtle">
                Step {stepIndex + 1} of {sequenceSteps.length}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sequenceSteps.map((step, i) => {
                const isDone = i < stepIndex;
                const isActive = i === stepIndex;
                return (
                  <div
                    key={step}
                    className={`p-2.5 rounded-btn flex items-center gap-2.5 shadow-[0_2px_0_0_#d8c3ad] ${
                      isActive ? 'bg-primary-fixed' : 'bg-surface-low'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${
                        isDone
                          ? 'bg-primary text-primary-on'
                          : isActive
                            ? 'bg-berry text-white'
                            : 'bg-surface-high text-ink-faint'
                      }`}
                    >
                      <MaterialIcon name={isDone ? 'check' : isActive ? 'autorenew' : 'schedule'} className="text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-ui text-[11px] text-ink truncate">
                        <span className="font-currency tabular-nums">{i + 1}.</span> {step.replace(/\.\.\.$/, '')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Result state: output allocation tray ─────────────── */}
        {decision && !isProcessing && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-btn bg-secondary/15 border-2 border-secondary">
              <div className="flex items-center gap-2">
                <MaterialIcon name="check_circle" className="text-xl text-secondary-deep" filled />
                <span className="font-ui text-xs font-bold text-secondary-deep">
                  Decision engine execution complete
                </span>
              </div>
              <span className="font-currency tabular-nums text-xs font-bold text-ink">
                Payout: <Currency value={decision.payoutAmount} />
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-primary-deep">
                Step 3 — Output allocation tray
              </span>
              <span className="flex items-center gap-1 font-ui text-[11px] text-secondary-deep">
                <MaterialIcon name="verified_user" className="text-sm" />
                Zero-loss split
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto-Save */}
              <div className="bg-primary text-primary-on rounded-card p-4 flex flex-col justify-between shadow-[0_6px_0_0_#ad3300]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-currency text-[11px] uppercase tracking-wider opacity-80">Auto-Save</span>
                    <MaterialIcon name="savings" className="text-xl" />
                  </div>
                  <div className="font-currency tabular-nums text-2xl leading-tight">
                    <Currency value={decision.saveAmount} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-primary-on/20">
                  <p className="font-ui text-[11px] font-semibold">Locked into savings pot</p>
                  <p className="font-ui text-[11px] opacity-80">Feeds the goal waterfall</p>
                </div>
              </div>

              {/* Micro-Invest */}
              <div className="bg-ocean text-white rounded-card p-4 flex flex-col justify-between shadow-[0_6px_0_0_#006686]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-currency text-[11px] uppercase tracking-wider opacity-80">Micro-Invest</span>
                    <MaterialIcon name="trending_up" className="text-xl" />
                  </div>
                  <div className="font-currency tabular-nums text-2xl leading-tight">
                    <Currency value={decision.investRecommendAmount} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/20">
                  <p className="font-ui text-[11px] font-semibold">Index + gold fraction</p>
                  <p className="font-ui text-[11px] opacity-80">Automated daily slice</p>
                </div>
              </div>

              {/* Tax Reserve */}
              <div className="bg-berry text-white rounded-card p-4 flex flex-col justify-between shadow-[0_6px_0_0_#842500]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-currency text-[11px] uppercase tracking-wider opacity-80">Tax Reserve</span>
                    <MaterialIcon name="account_balance" className="text-xl" />
                  </div>
                  <div className="font-currency tabular-nums text-2xl leading-tight">
                    <Currency value={decision.taxReserveAmount} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/20">
                  <p className="font-ui text-[11px] font-semibold">Advance tax compliance</p>
                  <p className="font-ui text-[11px] opacity-80">Held aside, not spendable</p>
                </div>
              </div>

              {/* Spendable Now */}
              <div className="bg-surface-container text-ink rounded-card p-4 flex flex-col justify-between shadow-[0_6px_0_0_#d8c3ad]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-currency text-[11px] uppercase tracking-wider text-ink-subtle">
                      Spendable Now
                    </span>
                    <MaterialIcon name="account_balance_wallet" className="text-xl text-primary-deep" />
                  </div>
                  <div className="font-currency tabular-nums text-2xl leading-tight">
                    <Currency value={decision.spendableAmount} />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-bevel-neutral">
                  <p className="font-ui text-[11px] font-semibold text-primary-deep">Guilt-free instantly</p>
                  <p className="font-ui text-[11px] text-ink-muted">Stays above your floor</p>
                </div>
              </div>
            </div>

            {/* Zero-loss equation — echoes engine outputs, computes nothing */}
            <div className="px-4 py-3 rounded-btn bg-surface-low flex flex-wrap items-center gap-x-2 gap-y-1 font-currency tabular-nums text-[11px] text-ink-muted shadow-[0_3px_0_0_#d8c3ad]">
              <MaterialIcon name="calculate" className="text-base text-primary-deep" />
              <span className="font-ui">Zero-loss equation:</span>
              <span className="text-ink font-semibold">
                <Currency value={decision.saveAmount} /> + <Currency value={decision.investRecommendAmount} /> +{' '}
                <Currency value={decision.taxReserveAmount} /> + <Currency value={decision.spendableAmount} /> ={' '}
                <Currency value={decision.payoutAmount} />
              </span>
            </div>

            {/* Explainable rationale */}
            <div className="p-4 rounded-card bg-surface-container space-y-2">
              <div className="flex items-center gap-1.5 font-ui text-xs font-bold text-primary-deep">
                <MaterialIcon name="auto_awesome" className="text-base" />
                <span>Explainable decision rationale</span>
              </div>
              <p className="font-questrial text-sm text-ink leading-relaxed">&ldquo;{decision.reason}&rdquo;</p>

              <div className="pt-2 border-t border-bevel-neutral font-ui text-[11px] text-ink-muted space-y-1">
                <div>
                  • <strong className="text-ink">Guardrail:</strong> {decision.explanationDetails.guardrailStatus}
                </div>
                <div>
                  • <strong className="text-ink">Tax provision:</strong> {decision.explanationDetails.taxStatus}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 rounded-full font-ui text-xs font-bold bg-surface-container text-ink-muted border-2 border-bevel-neutral shadow-[0_4px_0_0_#d8c3ad] hover:bg-surface-high active:translate-y-1 active:shadow-[0_1px_0_0_#d8c3ad] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MaterialIcon name="refresh" className="text-base" />
                <span>Try another amount</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onViewActivity) onViewActivity();
                }}
                className="flex-1 py-3 rounded-full font-ui text-xs font-bold bg-berry text-white shadow-[0_4px_0_0_#842500] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_0_#842500] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Done &amp; view activity</span>
                <MaterialIcon name="arrow_forward" className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
