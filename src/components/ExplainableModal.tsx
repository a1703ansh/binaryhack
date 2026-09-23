import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  PiggyBank, 
  ReceiptIndianRupee,
  Scale
} from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Algorithmic Decision Breakdown</h2>
              <p className="text-xs text-slate-400">100% Explainable Zero-Effort Automation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-300">
          {/* Main Plain-English Rationale */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="font-bold text-emerald-300 text-sm mb-1">
              Why did EarnWise save ₹{saveAmount}?
            </div>
            <p className="text-slate-200 leading-relaxed">
              "{reason}"
            </p>
          </div>

          {/* Allocation Breakdown */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Payout Mathematics (Total: ₹{payoutAmount.toLocaleString('en-IN')})
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Emergency Auto-Save:</span>
                <span className="font-bold font-mono text-emerald-400">₹{saveAmount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Advance Tax (10%):</span>
                <span className="font-bold font-mono text-amber-400">₹{taxAmount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Micro-Investment:</span>
                <span className="font-bold font-mono text-blue-400">₹{investAmount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Available to Spend:</span>
                <span className="font-bold font-mono text-white">₹{spendableAmount}</span>
              </div>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Guardrail & Intelligence Audits
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Income Signal:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {details?.incomeComparison || `Analyzed against 30-day moving average.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Minimum Balance Guard:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {details?.guardrailStatus || "Guaranteed minimum ₹5,000 balance remains completely intact."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <ReceiptIndianRupee className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Tax Provisioning:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {details?.taxStatus || "10% proportional reserve earmarked for quarterly advance tax schedule."}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
