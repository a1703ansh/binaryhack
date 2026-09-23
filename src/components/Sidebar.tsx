import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PiggyBank, 
  LineChart, 
  ReceiptIndianRupee, 
  Target, 
  History, 
  Receipt, 
  Bot, 
  Settings as SettingsIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { savingsSettings } = useEarnWise();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp, badge: 'Live' },
    { id: 'autosave', label: 'Auto-Save', icon: PiggyBank, statusDot: savingsSettings.autoSaveActive && !savingsSettings.pausedToday },
    { id: 'invest', label: 'Invest', icon: LineChart },
    { id: 'tax', label: 'Tax', icon: ReceiptIndianRupee },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'expenses', label: 'Expenses', icon: Receipt, note: 'Behavioral' },
    { id: 'assistant', label: 'Assistant', icon: Bot, isNew: true },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">EarnWise</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Zero-Effort Gig Finance</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.statusDot && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Auto-Save Active" />
                )}
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-900/20 text-slate-900' : 'bg-slate-800 text-emerald-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.note && (
                  <span className={`text-[10px] px-1 rounded ${
                    isActive ? 'text-slate-900/70' : 'text-slate-500'
                  }`}>
                    {item.note}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Guardrail Status Footer Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Balance Guardrail</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Protected Floor: <strong className="text-slate-200 font-mono">₹{savingsSettings.minimumBalance.toLocaleString('en-IN')}</strong>
          </div>
          <div className="mt-1 text-[10px] text-emerald-400 font-medium">
            ● Auto-save never violates floor
          </div>
        </div>
      </div>
    </aside>
  );
};
