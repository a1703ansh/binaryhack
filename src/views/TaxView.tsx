import React, { useState } from 'react';
import { 
  ReceiptIndianRupee, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Plus
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { computeTaxStatus } from '@earnwise/shared';

export const TaxView: React.FC = () => {
  const { 
    updateTaxReserve, 
    monthTaxReserved,
    monthIncome 
  } = useEarnWise();

  const [topUpSuccess, setTopUpSuccess] = useState(false);

  const status = computeTaxStatus(monthTaxReserved, monthIncome || 28500);
  const monthlyRunRate = Math.round(status.estimatedAnnualIncome / 12);

  const handleTopUp = () => {
    updateTaxReserve(250);
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <ReceiptIndianRupee className="w-4 h-4" />
            <span>Tax Provisioning Copilot</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Presumptive & Advance Tax Planning</h1>
          <p className="text-xs text-slate-400">
            Proportional auto-withholding for Section 44ADA/44AD gig earners to prevent year-end shocks
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Tax Readiness:</span>
          <strong className="text-amber-400 font-mono text-base font-bold">
            {status.readinessPercentage}%
          </strong>
        </div>
      </div>

      {/* KPI Cards (Step 17 Specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Estimated Annual Income</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            ₹{status.estimatedAnnualIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Based on ₹{monthlyRunRate.toLocaleString('en-IN')}/mo live run-rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Tax Reserved To Date</span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            ₹{monthTaxReserved.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400">Earmarked in liquid reserve</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Recommended Additional Reserve</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            ₹{status.recommendedAdditionalReserve.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">For full Q4 readiness</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Tax Readiness Score</span>
          <div className="text-2xl font-black font-mono text-blue-400 mt-1">
            {status.readinessPercentage}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${status.readinessPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Advance Tax Deadline Reminder */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Upcoming Advance Tax Reminder: March 15, 2027</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold font-mono">
                Q4 Schedule
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Indian income tax regulations require taxpayers with annual net liability &gt; ₹10,000 to pay advance tax installments. EarnWise cushions this gradually with every gig settlement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {topUpSuccess ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>₹250 Reserved!</span>
            </span>
          ) : (
            <button
              onClick={handleTopUp}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve +₹250 Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Tax Reserve Engine Explanation (Step 18) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>How the Proportional Tax Reserve Engine Works</span>
          </h3>
          <p className="text-xs text-slate-400">
            Automating tax provisioning without surprise lump-sum burdens at financial year-end
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <strong className="text-white block mb-1">1. Proportional Earmarking</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every incoming payout (e.g. ₹1,250 from Swiggy) automatically diverts 10% (₹125) into your virtual tax reserve pot, so you never feel the pinch.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <strong className="text-white block mb-1">2. Presumptive Taxation Awareness</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Section 44ADA/44AD for gig and freelance workers presumes 50% / 6% profits, drastically reducing taxable income and maintaining simple compliance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <strong className="text-white block mb-1">3. Fully Controlled Liquidity</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The tax reserve stays in your own bank account. EarnWise simply protects it from being spent by including it in your minimum balance formula.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer (Step 17 & Step 36) */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300 block mb-0.5">Fintech Prototype Disclaimer:</strong>
          {status.disclaimer}
        </div>
      </div>
    </div>
  );
};
