import React from 'react';

import { useEarnWise } from '../context/EarnWiseContext';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, MaterialIcon } from './ui';

interface TopNavbarProps {
  onOpenPayoutModal: () => void;
  onOpenMobileMenu: () => void;
  activeView: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenPayoutModal, onOpenMobileMenu }) => {
  const { userName, financialHealth, resetToDemoBenchmark } = useEarnWise();
  const { logout } = useAuth();

  // Time-aware greeting instead of a hardcoded "Good morning"
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 bg-ocean-light font-questrial">
      {/* Statutory Prototype Disclaimer Banner */}
      <div className="bg-ocean-bevel px-4 py-1.5 font-ui text-[11px] text-white/90 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 mx-auto">
          <MaterialIcon name="info" className="text-base text-primary shrink-0" filled />
          <span>
            <strong className="text-white">Hackathon Prototype:</strong> Uses simulated financial data &amp; integrations. Does not execute real UPI, banking, or tax filings.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu + Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface cursor-pointer"
            aria-label="Open navigation menu"
          >
            <MaterialIcon name="menu" className="text-2xl" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-medium text-ink tracking-tight">
                {greeting}, {userName}
              </h1>
              <Badge variant="gray">Delivery Partner</Badge>
            </div>
            <p className="text-xs text-ink-muted hidden sm:block">
              Zero-effort adaptive savings & tax planning active
            </p>
          </div>
        </div>

        {/* Right Side: Health Score + Demo Mode + Payout Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prototype Data Chip */}
          <Badge variant="green" className="hidden md:inline-flex">
            Hackathon Prototype · simulated data
          </Badge>

          {/* Financial Health Pill */}
          <div
            title="Composite Financial Health: Not a credit score"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface font-ui text-xs font-semibold text-ink shadow-[0_3px_0_0_#d8c3ad]"
          >
            <MaterialIcon name="shield" className="text-base text-secondary" filled />
            <span className="hidden xs:inline text-ink-muted font-normal">Health:</span>
            <span className="text-secondary font-currency tabular-nums">{financialHealth.overall}</span>
            <span className="text-ink-faint text-[10px]">/ 100</span>
          </div>

          {/* Reset Demo Benchmark Button */}
          <button
            onClick={resetToDemoBenchmark}
            title="Reset to Benchmark State for Judges"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface border border-bevel-neutral transition-colors cursor-pointer"
          >
            <MaterialIcon name="refresh" className="text-base" />
            <span>Reset Demo</span>
          </button>

          {/* Simulate New Payout Primary Action with 3D Bevel */}
          <Button variant="danger" size="md" onClick={onOpenPayoutModal}>
            <MaterialIcon name="add" className="text-lg" filled />
            <span className="hidden xs:inline">+ New Payout</span>
            <span className="xs:hidden">+ Payout</span>
          </Button>

          {/* User Chip + Logout */}
          <div className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full bg-surface shadow-[0_3px_0_0_#d8c3ad]">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-on font-bold text-xs font-ui">
              {(userName || 'R')[0]}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-ink pr-1">{userName}</span>
            <button
              onClick={logout}
              title="Sign out & Switch Account"
              className="flex items-center justify-center w-7 h-7 rounded-full text-ink-muted hover:text-danger hover:bg-danger-light transition-colors cursor-pointer"
            >
              <MaterialIcon name="logout" className="text-base" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};