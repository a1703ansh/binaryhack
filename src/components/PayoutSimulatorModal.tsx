import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Info, 
  PiggyBank, 
  ReceiptIndianRupee, 
  LineChart, 
  Wallet,
  Zap,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEarnWise } from '../context/EarnWiseContext';
import { Platform } from '../types';
import { DecisionResult } from '../services/decisionEngine';

interface PayoutSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewActivity?: () => void;
}

export const PayoutSimulatorModal: React.FC<PayoutSimulatorModalProps> = ({
  isOpen,
  onClose,
  onViewActivity
}) => {
  const { simulateNewPayout } = useEarnWise();
  const [source, setSource] = useState<Platform>('Swiggy');
  const [amount, setAmount] = useState<number>(1250);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [decision, setDecision] = useState<DecisionResult | null>(null);

  if (!isOpen) return null;

  const sequenceSteps = [
    'Income received...',
    'Analyzing income...',
    'Comparing with earning pattern...',
    'Calculating safe savings...',
    'Calculating tax reserve...',
    'Preparing investment recommendation...',
    'Updating financial health...',
    'Done.'
  ];

  const handleStartSimulation = async () => {
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
        particleCount: 50,
        spread: 60,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Simulate New Payout</h2>
              <p className="text-xs text-slate-400">Zero-effort adaptive decision engine demo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isProcessing && !decision && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Income Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Swiggy', 'Uber', 'Zomato', 'Rapido', 'Freelancing'] as Platform[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSource(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      source === p
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Payout Amount (₹)
                </label>
                <div className="flex gap-1.5">
                  {[650, 950, 1250, 2100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                        amount === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-base font-semibold focus:outline-none focus:border-emerald-500"
                  placeholder="Enter payout amount"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Info className="w-3.5 h-3.5" />
                <span>What happens when you process:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                EarnWise immediately compares this payout to your 30-day average (₹948), guards your ₹5,000 minimum balance, reserves 10% for taxes, and channels safe surplus into emergency savings and micro-investments.
              </p>
            </div>

            <button
              onClick={handleStartSimulation}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Process Payout & Run Decision Engine</span>
            </button>
          </div>
        )}

        {/* Processing Animation */}
        {isProcessing && (
          <div className="py-10 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-slate-800 border-b-cyan-400 animate-spin animate-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-2 max-w-xs">
              <h3 className="text-base font-bold text-white transition-all">
                {sequenceSteps[stepIndex]}
              </h3>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-1.5 transition-all duration-300 rounded-full"
                  style={{ width: `${((stepIndex + 1) / sequenceSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Step {stepIndex + 1} of {sequenceSteps.length}
              </p>
            </div>
          </div>
        )}

        {/* Simulation Output Result */}
        {decision && !isProcessing && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">
                  Decision Engine Analysis Complete
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                Payout: ₹{decision.payoutAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Results Grid Matching Prompt Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 mb-1">
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>Auto-Saved</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  ₹{decision.saveAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Emergency fund</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-blue-400 mb-1">
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Invest</span>
                </div>
                <div className="text-lg font-bold font-mono text-blue-400">
                  ₹{decision.investRecommendAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Liquid / Index</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 mb-1">
                  <ReceiptIndianRupee className="w-3.5 h-3.5" />
                  <span>Tax Reserve</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  ₹{decision.taxReserveAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Advance tax</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Spendable</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  ₹{decision.spendableAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Available now</div>
              </div>
            </div>

            {/* Explainable Automation: Human-Readable Rationale */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Why did EarnWise save ₹{decision.saveAmount}?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{decision.reason}"
              </p>
              
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div>• <strong className="text-slate-300">Guardrail:</strong> {decision.explanationDetails.guardrailStatus}</div>
                <div>• <strong className="text-slate-300">Tax Provision:</strong> {decision.explanationDetails.taxStatus}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Amount</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onViewActivity) onViewActivity();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>Done & View Activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
