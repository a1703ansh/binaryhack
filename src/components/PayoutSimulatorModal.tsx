import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
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
import { type Platform, type DecisionResult } from '@earnwise/shared';
import { MascotMonster } from './MascotMonster';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-questrial">
      <div className="relative w-full max-w-lg bg-slate-900 border-4 border-[#ad3300] rounded-3xl shadow-[0_10px_0_0_#872600] p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Smart Payout Simulator</h2>
              <p className="text-xs text-slate-400">Autonomous decision engine with playful mascot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isProcessing && !decision && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Income Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Swiggy', 'Uber', 'Zomato', 'Rapido', 'Freelancing'] as Platform[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSource(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      source === p
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_2px_0_0_#ad3300]'
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
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Payout Amount (₹)
                </label>
                <div className="flex gap-1.5">
                  {[650, 950, 1250, 2100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono border ${
                        amount === val
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_2px_0_0_#ad3300]'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">₹</span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border-2 text-white font-mono text-base font-semibold focus:outline-none focus:border-amber-500 ${
                    amount > 0 ? 'border-slate-700' : 'border-rose-500/60'
                  }`}
                  placeholder="Enter payout amount"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Info className="w-4 h-4" />
                <span>Autonomous Decision Flow:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                EarnWise compares this payout against your 30-day baseline (₹{forecast.averageDailyIncome.toLocaleString('en-IN')}), locks your ₹{savingsSettings.minimumBalance.toLocaleString('en-IN')} minimum cash floor, provisions 10% taxes, and routes safe surplus into savings and investments.
              </p>
            </div>

            <button
              onClick={handleStartSimulation}
              className="w-full py-3.5 rounded-full font-bold text-sm bg-[#e84e12] hover:bg-[#ff5714] text-white shadow-[0_5px_0_0_#872600] active:translate-y-1 active:shadow-[0_2px_0_0_#872600] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Process Payout & Run Decision Engine</span>
            </button>
          </div>
        )}

        {/* Processing Animation with Reactive Mascot */}
        {isProcessing && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <MascotMonster
              mood={stepIndex > 4 ? 'happy' : 'surprised'}
              isBouncing={true}
              size="sm"
            />

            <div className="text-center space-y-2 max-w-sm">
              <h3 className="text-sm font-bold text-white transition-all">
                {sequenceSteps[stepIndex]}
              </h3>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div 
                  className="bg-amber-400 h-2 transition-all duration-300 rounded-full"
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">
                  Decision Engine Execution Complete
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                Payout: ₹{decision.payoutAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Results Grid with 3D Bevels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 shadow-[0_3px_0_0_#065f46] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 mb-1 font-bold">
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>Auto-Saved</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-300">
                  ₹{decision.saveAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Emergency fund</div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/40 border-2 border-blue-500/50 shadow-[0_3px_0_0_#1e40af] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-blue-400 mb-1 font-bold">
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Invest</span>
                </div>
                <div className="text-lg font-bold font-mono text-blue-300">
                  ₹{decision.investRecommendAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Liquid / Index</div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 shadow-[0_3px_0_0_#92400e] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 mb-1 font-bold">
                  <ReceiptIndianRupee className="w-3.5 h-3.5" />
                  <span>Tax Reserve</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-300">
                  ₹{decision.taxReserveAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Advance tax</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-700 shadow-[0_3px_0_0_#334155] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 mb-1 font-bold">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Spendable</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  ₹{decision.spendableAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Available now</div>
              </div>
            </div>

            {/* Explainable Rationale */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Explainable Decision Rationale:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                "{decision.reason}"
              </p>
              
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>• <strong className="text-slate-300">Guardrail:</strong> {decision.explanationDetails.guardrailStatus}</div>
                <div>• <strong className="text-slate-300">Tax Provision:</strong> {decision.explanationDetails.taxStatus}</div>
              </div>
            </div>

            {/* Tactile Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Amount</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onViewActivity) onViewActivity();
                }}
                className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#e84e12] hover:bg-[#ff5714] text-white shadow-[0_4px_0_0_#872600] active:translate-y-0.5 active:shadow-[0_2px_0_0_#872600] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
