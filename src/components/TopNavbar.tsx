import React from 'react';
import { 
  PlusCircle, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  Menu,
  LogOut,
  Smile
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { useAuth } from '../context/AuthContext';

interface TopNavbarProps {
  onOpenPayoutModal: () => void;
  onOpenMobileMenu: () => void;
  activeView: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenPayoutModal,
  onOpenMobileMenu
}) => {
  const { 
    userName, 
    financialHealth, 
    resetToDemoBenchmark 
  } = useEarnWise();
  const { logout } = useAuth();

  // Time-aware greeting instead of a hardcoded "Good morning"
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 font-questrial">
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
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {greeting}, {userName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Delivery Partner
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-effort adaptive savings & tax planning active
            </p>
          </div>
        </div>

        {/* Right Side: Health Score + Demo Mode + Mascot Avatar + Payout Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Financial Health Pill */}
          <div 
            title="Composite Financial Health: Not a credit score"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline text-slate-400 font-normal">Health:</span>
            <span className="text-emerald-400 font-bold font-mono">{financialHealth.overall}</span>
            <span className="text-slate-500 text-[10px]">/ 100</span>
          </div>

          {/* Reset Demo Benchmark Button */}
          <button
            onClick={resetToDemoBenchmark}
            title="Reset to Benchmark State for Judges"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Simulate New Payout Primary Action with 3D Bevel */}
          <button
            onClick={onOpenPayoutModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#e84e12] hover:bg-[#ff5714] text-white shadow-[0_4px_0_0_#872600] active:translate-y-0.5 active:shadow-[0_2px_0_0_#872600] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">+ New Payout</span>
            <span className="xs:hidden">+ Payout</span>
          </button>

          {/* Mascot Profile & Logout Button */}
          <button
            onClick={logout}
            title="Sign out & Switch Account"
            className="flex items-center justify-center p-2 rounded-full bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

