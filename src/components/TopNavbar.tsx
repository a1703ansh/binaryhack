import React from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  Menu,
  IndianRupee
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';

interface TopNavbarProps {
  onOpenPayoutModal: () => void;
  onOpenMobileMenu: () => void;
  activeView: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenPayoutModal,
  onOpenMobileMenu,
  activeView
}) => {
  const { 
    userName, 
    financialHealth, 
    isDemoMode, 
    setDemoMode, 
    resetToDemoBenchmark 
  } = useEarnWise();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Statutory Prototype Disclaimer Banner */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 mx-auto">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-300">Hackathon Prototype:</strong> Uses simulated financial data & integrations. Does not execute real UPI, banking, or tax filings.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu + Greeting */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Good morning, {userName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Delivery Partner
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-effort adaptive savings & tax planning active
            </p>
          </div>
        </div>

        {/* Right Side: Health Score + Demo Mode + Payout Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Financial Health Pill */}
          <div 
            title="Composite Financial Health: Not a credit score"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline text-slate-400 font-normal">Health:</span>
            <span className="text-emerald-400 font-bold">{financialHealth.overall}</span>
            <span className="text-slate-500 text-[10px]">/ 100</span>
          </div>

          {/* Reset Demo Benchmark Button */}
          <button
            onClick={resetToDemoBenchmark}
            title="Reset to Benchmark State for Judges"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Simulate New Payout Primary Action */}
          <button
            onClick={onOpenPayoutModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">+ New Payout</span>
            <span className="xs:hidden">+ Payout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
