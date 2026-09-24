import React from 'react';
import { MaterialIcon } from './ui';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: 'space_dashboard' },
    { id: 'income', label: 'Income', icon: 'trending_up' },
    { id: 'autosave', label: 'Save', icon: 'savings' },
    { id: 'invest', label: 'Invest', icon: 'show_chart' },
    { id: 'assistant', label: 'Assistant', icon: 'smart_toy' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ocean-light/95 backdrop-blur-lg border-t border-bevel-neutral px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {items.map(item => {
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-primary-deep font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className={`flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-primary shadow-[0_2px_0_0_#ad3300] w-9 h-8' : 'w-9 h-8'}`}>
              <MaterialIcon name={item.icon} className={`text-xl ${isActive ? 'text-primary-on' : ''}`} />
            </span>
            <span className="text-[10px] mt-0.5 font-ui">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};