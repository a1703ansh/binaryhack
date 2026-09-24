import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { Button, Input, MaterialIcon } from '../components/ui';

/* =========================================================
   Settings — "Flat Mascot Playful" restyle.
   The two guardrail values still save through
   updateSavingsSettings, and demo reset is untouched.
   ========================================================= */

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
        <div className="flex items-center gap-2 font-ui text-[11px] font-semibold text-ocean uppercase tracking-wider mb-1">
          <MaterialIcon name="settings" className="text-base" />
          <span>Configuration &amp; demo control</span>
        </div>
        <h1 className="font-questrial text-3xl text-surface lowercase tracking-tight">platform settings</h1>
        <p className="font-questrial text-sm text-surface/95">
          manage minimum balance guardrails, notification thresholds, and reset judge demo states
        </p>
      </div>

      {/* Profile */}
      <div className="bg-surface rounded-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_6px_0_0_#006686]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-on flex items-center justify-center font-questrial text-xl shadow-[0_3px_0_0_#ad3300]">
            {userName?.[0] ?? '?'}
          </div>
          <div>
            <h3 className="font-questrial text-lg text-ink">{userName}</h3>
            <p className="font-ui text-[11px] text-ink-subtle">{occupation} • Active partner</p>
          </div>
        </div>

        <span className="font-ui text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary/15 text-secondary-deep self-start sm:self-auto">
          Demo profile active
        </span>
      </div>

      {/* Engine guardrails */}
      <div className="bg-surface rounded-card p-5 sm:p-6 space-y-4 shadow-[0_6px_0_0_#845400]">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-bevel-neutral">
          <div className="flex items-center gap-2">
            <MaterialIcon name="tune" className="text-xl text-primary-deep" />
            <h3 className="font-questrial text-lg text-ink">Engine guardrail thresholds</h3>
          </div>
          {isSaved && (
            <span className="font-ui text-[11px] text-secondary-deep font-semibold flex items-center gap-1">
              <MaterialIcon name="check_circle" className="text-base" filled />
              <span>Saved successfully</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              id="settings-min-balance"
              label="Minimum protected balance (₹)"
              type="number"
              min={0}
              className="font-currency tabular-nums"
              value={minBalance}
              onChange={e => setMinBalance(Number(e.target.value))}
            />
            <span className="font-ui text-[10px] text-ink-subtle mt-1 block">
              Auto-Save will abort or downscale if the balance breaches this floor.
            </span>
          </div>

          <div>
            <Input
              id="settings-max-cap"
              label="Maximum monthly savings cap (₹)"
              type="number"
              min={0}
              className="font-currency tabular-nums"
              value={maxCap}
              onChange={e => setMaxCap(Number(e.target.value))}
            />
            <span className="font-ui text-[10px] text-ink-subtle mt-1 block">
              Ceiling to prevent over-saving during seasonal surge periods.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="secondary" size="md" onClick={handleSave} className="rounded-full">
            <MaterialIcon name="save" className="text-base" />
            <span className="font-ui">Update guardrails</span>
          </Button>
        </div>
      </div>

      {/* Judge demo reset */}
      <div className="bg-surface rounded-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_6px_0_0_#d8c3ad]">
        <div>
          <h3 className="font-questrial text-lg text-ink flex items-center gap-2">
            <MaterialIcon name="restart_alt" className="text-xl text-berry" />
            <span>Judge demo reset</span>
          </h3>
          <p className="font-questrial text-sm text-ink-muted mt-1 max-w-lg">
            Instantly restores Rahul&apos;s benchmark numbers: Swiggy (₹12.4k), Uber (₹8.3k), savings (₹5,240),
            invested (₹2,100) and the emergency fund (₹10,500 / ₹25,000).
          </p>
        </div>

        <Button variant="primary" size="md" onClick={resetToDemoBenchmark} className="rounded-full shrink-0">
          <MaterialIcon name="restart_alt" className="text-base" />
          <span className="font-ui">Reset demo state</span>
        </Button>
      </div>

      {/* Prototype disclaimer */}
      <div className="p-5 rounded-card bg-surface-container space-y-1.5">
        <div className="flex items-center gap-2 font-questrial text-base text-ink">
          <MaterialIcon name="info" className="text-lg text-primary-deep" filled />
          <span>Official hackathon MVP notice</span>
        </div>
        <p className="font-questrial text-[13px] leading-relaxed text-ink-muted">
          &ldquo;This prototype uses simulated financial data and transactions for demonstration purposes. It does not
          execute real investments, payments, tax filings or banking transactions.&rdquo;
        </p>
      </div>
    </div>
  );
};
