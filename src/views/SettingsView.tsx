import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';

export const SettingsView: React.FC = () => {
  const { 
    userName, 
    occupation, 
    savingsSettings, 
    updateSavingsSettings, 
    resetToDemoBenchmark 
  } = useEarnWise();

  const [minBalance, setMinBalance] = useState(savingsSettings.minimumBalance);
  const [maxCap, setMaxCap] = useState(savingsSettings.maxMonthlyCap);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSavingsSettings({
      minimumBalance: Number(minBalance),
      maxMonthlyCap: Number(maxCap)
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>Configuration & Demo Control</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-400">
          Manage minimum balance guardrails, notification thresholds, and reset judge demo states
        </p>
      </div>

      {/* Profile Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {userName[0]}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{userName}</h3>
            <p className="text-xs text-slate-400">{occupation} • Active Partner</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Demo Profile Active
        </span>
      </div>

      {/* Engine Guardrails */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Engine Guardrail Thresholds</h3>
          </div>
          {isSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Minimum Protected Balance (₹)
            </label>
            <input
              type="number"
              value={minBalance}
              onChange={e => setMinBalance(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Auto-Save algorithm will abort or downscale if balance breaches this floor.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Maximum Monthly Savings Cap (₹)
            </label>
            <input
              type="number"
              value={maxCap}
              onChange={e => setMaxCap(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Ceiling to prevent over-saving during seasonal surge periods.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            Update Guardrails
          </button>
        </div>
      </div>

      {/* Judge Presentation Controls (Step 27) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Judge Demo Reset</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Instantly restores Rahul's initial hackathon benchmark numbers: Swiggy (₹12.4k), Uber (₹8.3k), Savings (₹5,240), Invested (₹2,100), and Emergency Fund (₹10,500/₹25,000).
          </p>
        </div>

        <button
          onClick={resetToDemoBenchmark}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo State</span>
        </button>
      </div>

      {/* Mandatory Fintech Disclaimer (Step 36) */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          <span>Official Hackathon MVP Notice:</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          "This prototype uses simulated financial data and transactions for demonstration purposes. It does not execute real investments, payments, tax filings or banking transactions."
        </p>
      </div>
    </div>
  );
};
