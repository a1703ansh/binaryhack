import React from 'react';
import { Currency } from '../lib/currency';
import { MaterialIcon } from './ui';

interface ExplainableModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutAmount: number;
  saveAmount: number;
  taxAmount: number;
  investAmount: number;
  spendableAmount: number;
  reason: string;
  details?: {
    incomeComparison?: string;
    guardrailStatus?: string;
    taxStatus?: string;
    investmentRationale?: string;
  };
}

/* =========================================================
   Explainable breakdown — "Flat Mascot Playful" restyle.
   Amounts are echoed as-is; nothing is recalculated here.
   ========================================================= */

const AUDITS = [
  { key: 'incomeComparison', icon: 'trending_up', title: 'Income signal', tone: 'text-ocean' },
  { key: 'guardrailStatus', icon: 'shield', title: 'Minimum balance guard', tone: 'text-secondary-deep' },
  { key: 'taxStatus', icon: 'account_balance', title: 'Tax provisioning', tone: 'text-berry' },
] as const;

export const ExplainableModal: React.FC<ExplainableModalProps> = ({
  isOpen,
  onClose,
  payoutAmount,
  saveAmount,
  taxAmount,
  investAmount,
  spendableAmount,
  reason,
  details
}) => {
  if (!isOpen) return null;

  const fallbacks: Record<(typeof AUDITS)[number]['key'], string> = {
    incomeComparison: 'Analyzed against your 30-day moving average.',
    guardrailStatus: 'Guaranteed minimum ₹5,000 balance remains completely intact.',
    taxStatus: '10% proportional reserve earmarked for the quarterly advance tax schedule.'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Algorithmic Decision Breakdown"
    >
      <div className="relative w-full max-w-lg bg-surface rounded-card shadow-[0_8px_0_0_#d8c3ad] p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-bevel-neutral">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-on shadow-[0_3px_0_0_#ad3300]">
              <MaterialIcon name="auto_awesome" className="text-xl" filled />
            </div>
            <div>
              <h2 className="font-questrial text-lg text-ink leading-tight">Algorithmic Decision Breakdown</h2>
              <p className="font-ui text-[11px] text-ink-subtle">100% explainable zero-effort automation</p>
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

        <div className="mt-4 space-y-4">
          {/* Plain-English rationale */}
          <div className="p-4 rounded-card bg-primary-fixed">
            <div className="font-questrial text-base text-primary-on mb-1">
              Why did EarnWise save <Currency value={saveAmount} />?
            </div>
            <p className="font-questrial text-sm text-primary-deep leading-relaxed">&ldquo;{reason}&rdquo;</p>
          </div>

          {/* Allocation breakdown */}
          <div>
            <div className="font-ui text-[11px] font-semibold text-ink-subtle uppercase tracking-wider mb-2">
              Payout mathematics (total <Currency value={payoutAmount} />)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-btn bg-surface-low flex items-center justify-between gap-2 shadow-[0_2px_0_0_#d8c3ad]">
                <span className="font-ui text-[11px] text-ink-muted">Emergency auto-save</span>
                <span className="font-currency tabular-nums text-sm font-bold text-secondary-deep">
                  <Currency value={saveAmount} />
                </span>
              </div>
              <div className="p-2.5 rounded-btn bg-surface-low flex items-center justify-between gap-2 shadow-[0_2px_0_0_#d8c3ad]">
                <span className="font-ui text-[11px] text-ink-muted">Advance tax (10%)</span>
                <span className="font-currency tabular-nums text-sm font-bold text-berry">
                  <Currency value={taxAmount} />
                </span>
              </div>
              <div className="p-2.5 rounded-btn bg-surface-low flex items-center justify-between gap-2 shadow-[0_2px_0_0_#d8c3ad]">
                <span className="font-ui text-[11px] text-ink-muted">Micro-investment</span>
                <span className="font-currency tabular-nums text-sm font-bold text-ocean">
                  <Currency value={investAmount} />
                </span>
              </div>
              <div className="p-2.5 rounded-btn bg-surface-low flex items-center justify-between gap-2 shadow-[0_2px_0_0_#d8c3ad]">
                <span className="font-ui text-[11px] text-ink-muted">Available to spend</span>
                <span className="font-currency tabular-nums text-sm font-bold text-ink">
                  <Currency value={spendableAmount} />
                </span>
              </div>
            </div>
          </div>

          {/* Guardrail & intelligence audits */}
          <div className="space-y-2 pt-3 border-t border-bevel-neutral">
            <div className="font-ui text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
              Guardrail &amp; intelligence audits
            </div>

            {AUDITS.map(({ key, icon, title, tone }) => (
              <div key={key} className="flex items-start gap-2.5 p-2.5 rounded-btn bg-surface-container">
                <MaterialIcon name={icon} className={`text-lg shrink-0 mt-0.5 ${tone}`} />
                <div>
                  <strong className="font-ui text-xs text-ink">{title}:</strong>
                  <p className="font-questrial text-[12px] text-ink-muted mt-0.5 leading-snug">
                    {details?.[key] || fallbacks[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full font-ui font-semibold text-sm bg-surface-container text-ink-muted border-2 border-bevel-neutral shadow-[0_4px_0_0_#d8c3ad] hover:bg-surface-high active:translate-y-1 active:shadow-[0_1px_0_0_#d8c3ad] transition-all cursor-pointer"
          >
            Close breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
