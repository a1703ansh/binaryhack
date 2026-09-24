import React from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { Currency, MaterialIcon } from './ui';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  statusDot?: boolean;
  isNew?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { savingsSettings } = useEarnWise();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { id: 'income', label: 'Income', icon: 'trending_up', badge: 'Live' },
    { id: 'autosave', label: 'Auto-Save', icon: 'savings', statusDot: savingsSettings.autoSaveActive && !savingsSettings.pausedToday },
    { id: 'invest', label: 'Invest', icon: 'show_chart' },
    { id: 'tax', label: 'Tax', icon: 'receipt_long' },
    { id: 'goals', label: 'Goals', icon: 'flag' },
    { id: 'activity', label: 'Activity', icon: 'history' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt' },
    { id: 'assistant', label: 'Assistant', icon: 'smart_toy', isNew: true },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 bg-ocean-light border-r border-bevel-neutral flex-shrink-0 h-screen sticky top-0 items-center py-4 gap-4">
      {/* Brand Logo */}
      <button
        type="button"
        onClick={() => setActiveView('dashboard')}
        title="EarnWise"
        className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_4px_0_0_#ad3300] cursor-pointer transition-transform hover:-translate-y-0.5"
      >
        <MaterialIcon name="bolt" className="text-2xl text-primary-on" filled />
      </button>

      {/* Navigation Rail */}
      <nav className="flex-1 flex flex-col items-center gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              title={`${item.label}${item.badge ? ` · ${item.badge}` : ''}`}
              className={[
                'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-on shadow-[0_3px_0_0_#ad3300]'
                  : 'bg-surface/60 text-ink-muted hover:bg-surface hover:text-primary-deep',
              ].join(' ')}
            >
              <MaterialIcon name={item.icon} className="text-[22px]" />
              {item.statusDot && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse border-2 border-surface" />
              )}
              {item.isNew && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-berry text-white text-[9px] font-bold font-ui flex items-center justify-center shadow">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Guardrail Status Footer */}
      <div className="flex flex-col items-center gap-1" title="Balance guardrail — auto-save never violates floor">
        <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center text-ocean shadow-[0_3px_0_0_#d8c3ad]">
          <MaterialIcon name="shield" className="text-xl" filled />
        </div>
        <span className="text-ink-muted">
          <Currency value={savingsSettings.minimumBalance} className="text-[10px]" />
        </span>
      </div>
    </aside>
  );
};