import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { computeTaxStatus } from '@earnwise/shared';
import { useEarnWise } from '../context/EarnWiseContext';
import { Currency, MaterialIcon } from '../components/ui';
import { MascotMonster } from '../components/MascotMonster';

export const TaxView: React.FC = () => {
  const { updateTaxReserve, monthTaxReserved, monthIncome, taxProfile } = useEarnWise();

  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(950);

  const status = computeTaxStatus(monthTaxReserved, monthIncome || 28500);
  const monthlyRunRate = Math.round(status.estimatedAnnualIncome / 12);
  const dailyRunRate = Math.round(monthlyRunRate / 30);
  const deadlineDays = taxProfile.quarterlyDaysRemaining || 18;
  const readiness = status.readinessPercentage;
  const dailyTarget = Math.max(1, Math.round(status.recommendedAdditionalReserve / Math.max(1, deadlineDays)));

  const simAnnual = Math.round(dailyEarnings * 360);
  const sim44ADAProfit = Math.round(simAnnual / 2);
  const simTaxLiability = Math.max(0, sim44ADAProfit - 700000) * 0.05;

  const handleReserve = (amount: number) => {
    updateTaxReserve(amount);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-ocean-bevel uppercase tracking-wider mb-1 lowercase">
            <MaterialIcon name="request_quote" className="text-base" />
            <span>quarterly advance tax mode</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light text-surface lowercase tracking-tight">tax copilot,</h1>
          <p className="text-base text-surface opacity-90 max-w-xl lowercase mt-1">
            relax, your quarterly advance tax is automatically set aside from daily gigs.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low text-ink-muted text-xs lowercase">
              <MaterialIcon name="schedule" className="text-base text-ocean-bevel" />
              <span>next advance tax on {status.quarterlyDueDate}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-berry text-white text-xs font-semibold lowercase shadow-[0_4px_0_0_#8A2E12]">
              <MaterialIcon name="warning" className="text-base" />
              <span>q2 due in {deadlineDays} days - 45% cumulative</span>
            </div>
          </div>
        </div>

        {/* Mascot Copilot Hero Badge — the page's single mascot */}
        <div className="self-center lg:self-end shrink-0 flex items-end justify-center pt-2 lg:pr-2">
          <div className="relative flex flex-col items-center">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface px-3 py-1 rounded-full shadow-[0_3px_0_0_#F78305] text-[11px] font-semibold text-ink whitespace-nowrap opacity-95 z-30 flex items-center gap-1.5 border border-primary/20">
              <MaterialIcon name="verified_user" className="text-sm text-ocean" filled />
              <span>relax, rahul! 0 penalties</span>
            </div>
            <MascotMonster mood="happy" size="md" celebrate={readiness >= 75} />
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <span className="text-xs font-label text-ink-muted lowercase block">estimated annual gig income</span>
          <div className="text-3xl text-ink font-currency font-medium tracking-tight mt-1">
            <Currency value={status.estimatedAnnualIncome} />
          </div>
          <span className="text-[11px] text-ink-muted lowercase block mt-1">
            ~<Currency value={dailyRunRate} />
            /day across Zomato + Swiggy
          </span>
        </div>

        <div className="p-4 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <span className="text-xs font-label text-ink-muted lowercase block">tax reserved to date</span>
          <div className="text-3xl text-ink font-currency font-medium tracking-tight mt-1">
            <Currency value={status.taxAlreadyReserved} />
          </div>
          <span className="text-[11px] text-ink-muted lowercase block mt-1">
            auto-earmarked - 6.85% p.a. liquid escrow
          </span>
        </div>

        <div className="p-4 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <span className="text-xs font-label text-ink-muted lowercase block">recommended additional reserve</span>
          <div className="text-3xl text-ink font-currency font-medium tracking-tight mt-1">
            <Currency value={status.recommendedAdditionalReserve} />
          </div>
          <span className="text-[11px] text-ink-muted lowercase block mt-1">
            <Currency value={dailyTarget} />/day push - q2 by sep 15
          </span>
        </div>

        <div className="p-4 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <span className="text-xs font-label text-ink-muted lowercase block">tax readiness score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl text-ink font-currency font-medium tracking-tight">{readiness}</span>
            <span className="text-sm text-ink-muted lowercase">/100</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-ocean transition-all"
              style={{ width: `${Math.min(100, readiness)}%` }}
            />
          </div>
          <span className="text-[11px] text-ink-muted lowercase block mt-1">
            {readiness >= 68 ? 'good pace' : 'pick up daily reserve'}
          </span>
        </div>
      </div>

      {/* Urgent top-up CTA */}
      <section className="p-5 rounded-card bg-surface-low shadow-[0_5px_0_0_#D8C3AD] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#ad3300]">
            <MaterialIcon name="shield" className="text-2xl text-primary-deep" filled />
          </div>
          <div>
            <strong className="text-lg text-ink lowercase font-label block">q2 advance tax - zero penalty assurance</strong>
            <span className="text-xs text-ink-muted lowercase block mt-1">
              file by sep 15 - section 44ada deemed profit - pay current quarter + interest accrual to stay penalty-free under sec 234c
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:ml-auto shrink-0">
          <button
            onClick={() => handleReserve(500)}
            className="px-2.5 py-2 rounded-btn bg-surface-container text-xs text-ink-muted font-semibold lowercase shadow-[0_4px_0_0_#D8C3AD] active:translate-y-[2px] active:shadow-[0_2px_0_0_#D8C3AD] transition-all cursor-pointer"
          >
            +500
          </button>
          <button
            onClick={() => setShowFormula(true)}
            className="px-2.5 py-2 rounded-btn bg-ocean-faint text-ocean text-xs font-semibold lowercase shadow-[0_4px_0_0_#7AA5A5] active:translate-y-[2px] active:shadow-[0_2px_0_0_#7AA5A5] transition-all cursor-pointer"
          >
            view 44ada
          </button>
          {topUpSuccess ? (
            <span className="px-4 py-2.5 rounded-btn bg-ink text-white text-xs font-bold lowercase flex items-center gap-1.5">
              <MaterialIcon name="check_circle" className="text-base" />
              reserved!
            </span>
          ) : (
            <button
              onClick={() => handleReserve(status.recommendedAdditionalReserve)}
              className="px-4 py-2.5 rounded-btn bg-berry text-white text-xs font-bold lowercase shadow-[0_4px_0_0_#8A2E12] active:translate-y-[2px] active:shadow-[0_2px_0_0_#8A2E12] transition-all cursor-pointer"
            >
              reserve <Currency value={status.recommendedAdditionalReserve} />
            </button>
          )}
        </div>
      </section>

      {/* 3-step explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <div className="w-10 h-10 rounded-2xl bg-ocean-faint text-ocean flex items-center justify-center mb-3">
            <MaterialIcon name="savings" className="text-xl" />
          </div>
          <strong className="block text-sm font-display text-ink lowercase">proportional daily earmarking</strong>
          <p className="text-xs text-ink-muted leading-relaxed mt-1">
            10% auto-withheld only on days you clear 950+ - nothing on slow or strike days, so you never dip below safe spending.
          </p>
        </div>

        <div className="p-5 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <div className="w-10 h-10 rounded-2xl bg-ocean-faint text-ocean flex items-center justify-center mb-3">
            <MaterialIcon name="account_balance" className="text-xl" />
          </div>
          <strong className="block text-sm font-display text-ink lowercase">section 44ada presumptive tax</strong>
          <p className="text-xs text-ink-muted leading-relaxed mt-1">
            50% of gross gig receipts is deemed profit under 44ADA - no books, no CA fees, and fully rebated under section 87A.
          </p>
        </div>

        <div className="p-5 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
          <div className="w-10 h-10 rounded-2xl bg-ocean-faint text-ocean flex items-center justify-center mb-3">
            <MaterialIcon name="lock" className="text-xl" />
          </div>
          <strong className="block text-sm font-display text-ink lowercase">controlled liquid escrow</strong>
          <p className="text-xs text-ink-muted leading-relaxed mt-1">
            Reserved rupees earn 6.85% p.a. in a zero-lock liquid vault - ready to pay the advance challan the instant it is due.
          </p>
        </div>
      </div>

      {/* Live gig tax simulator */}
      <section className="p-5 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
        <div className="flex items-center gap-2 mb-3">
          <MaterialIcon name="tune" className="text-lg text-primary" />
          <h3 className="text-base font-display text-ink lowercase">gig tax simulator</h3>
          <span className="ml-auto text-xs text-ink-muted lowercase">daily gig earnings</span>
        </div>
        <input
          type="range"
          min={400}
          max={3000}
          step={50}
          value={dailyEarnings}
          onChange={e => setDailyEarnings(Number(e.target.value))}
          className="w-full"
          aria-label="daily gig earnings"
        />
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-xs text-ink-muted lowercase">400</span>
          <span className="text-2xl font-currency text-primary lowercase">
            <Currency value={dailyEarnings} />
            /day
          </span>
          <span className="text-xs text-ink-muted lowercase">3,000</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-ocean-faint">
            <span className="text-[11px] text-ink-muted lowercase block">estimated annual gig income</span>
            <div className="text-lg font-currency text-ink">
              <Currency value={simAnnual} />
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-ocean-faint">
            <span className="text-[11px] text-ink-muted lowercase block">44ada deemed profit (50%)</span>
            <div className="text-lg font-currency text-ink">
              <Currency value={sim44ADAProfit} />
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary-dim">
            <span className="text-[11px] text-primary lowercase block">net advance tax</span>
            <div className="text-lg font-currency text-ink">
              {simTaxLiability > 0 ? <Currency value={simTaxLiability} /> : <span>0</span>}
            </div>
            <span className="text-[11px] text-primary lowercase">- 0 after 87a rebate</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-ink-muted lowercase">quick reserve:</span>
          {[250, 500, 1000].map(amt => (
            <button
              key={amt}
              onClick={() => handleReserve(amt)}
              className="px-3 py-2 rounded-btn bg-primary-faint text-primary-deep text-xs font-bold lowercase shadow-[0_3px_0_0_#D8C3AD] active:translate-y-[2px] active:shadow-[0_1px_0_0_#D8C3AD] transition-all"
            >
              +<Currency value={amt} />
            </button>
          ))}
          {topUpSuccess && (
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <MaterialIcon name="check_circle" className="text-base" />
              reserved to escrow!
            </span>
          )}
        </div>
      </section>

      {/* Quarterly installment ladder */}
      <section className="p-5 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
        <div className="flex items-center gap-2 mb-4">
          <MaterialIcon name="calendar_month" className="text-lg text-ocean-bevel" />
          <h3 className="text-base font-display text-ink lowercase">quarterly advance tax installment ladder</h3>
          <span className="ml-auto text-xs text-ink-muted lowercase">44ada - cumulative</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-ocean-faint border border-ocean">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-ink lowercase">q1 - jun 15</strong>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-ocean uppercase">
                <MaterialIcon name="check_circle" className="text-sm" /> settled
              </span>
            </div>
            <div className="text-lg font-currency text-ink mt-1">
              <Currency value={Math.round(status.targetQuarterlyProvision * 0.15)} />
            </div>
            <span className="text-[11px] text-ink-muted lowercase">15% cumulative - paid</span>
          </div>

          <div className="p-4 rounded-2xl bg-berry-dim border border-berry">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-berry lowercase">q2 - sep 15</strong>
              <span className="text-[10px] font-semibold text-berry uppercase lowercase">urgent - {deadlineDays}d</span>
            </div>
            <div className="text-lg font-currency text-berry mt-1">
              <Currency value={Math.round(status.targetQuarterlyProvision * 0.45)} />
            </div>
            <span className="text-[11px] text-berry lowercase">45% cumulative - reserve by deadline</span>
          </div>

          <div className="p-4 rounded-2xl bg-ocean-faint border border-ocean">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-ink lowercase">q3 - dec 15</strong>
              <span className="text-[10px] font-semibold text-ocean-bevel uppercase">scheduled</span>
            </div>
            <div className="text-lg font-currency text-ink mt-1">
              <Currency value={Math.round(status.targetQuarterlyProvision * 0.75)} />
            </div>
            <span className="text-[11px] text-ink-muted lowercase">75% cumulative - auto-earmarked daily</span>
          </div>

          <div className="p-4 rounded-2xl bg-ocean-faint border border-ocean">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-ink lowercase">q4 - mar 15</strong>
              <span className="text-[10px] font-semibold text-ocean-bevel uppercase">final</span>
            </div>
            <div className="text-lg font-currency text-ink mt-1">
              <Currency value={status.targetQuarterlyProvision} />
            </div>
            <span className="text-[11px] text-ink-muted lowercase">100% cumulative - final settlement</span>
          </div>
        </div>
      </section>

      {/* CTA + statutory footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-card bg-surface shadow-[0_5px_0_0_#D8C3AD]">
        <div className="flex items-center gap-4">
          {/* Flat icon avatar (not a second mascot — this page keeps exactly one monster) */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-fixed shrink-0 flex items-center justify-center shadow-[0_4px_0_0_#ffb959]">
            <MaterialIcon name="description" className="text-3xl sm:text-4xl text-primary-deep" filled />
          </div>
          <div>
            <p className="text-sm font-label text-ink lowercase">zero penalties. zero stress.</p>
            <p className="text-xs text-ink-muted lowercase">
              prefilled ITNS-280 challan generated from your escrow - pay in two taps, statutory, sec 44ada.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            confetti({ particleCount: 90, spread: 100, origin: { y: 0.6 } });
            setTopUpSuccess(true);
            setTimeout(() => setTopUpSuccess(false), 2500);
          }}
          className="px-5 py-3 rounded-btn bg-berry text-white text-xs font-bold lowercase shadow-[0_5px_0_0_#8A2E12] active:translate-y-[2px] active:shadow-[0_2px_0_0_#8A2E12] transition-all cursor-pointer"
        >
          {topUpSuccess ? 'challan ready' : 'prefill & download itns-280'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="px-3 py-1.5 rounded-full bg-ocean-faint text-ocean text-[11px] font-semibold lowercase">
            statutory guidance - zero penalty assurance for indian gig workers
          </span>
          <span className="px-3 py-1.5 rounded-full bg-ocean-faint text-ocean text-[11px] font-semibold lowercase">
            section 44ada & 87a - income tax act 1961
          </span>
        </div>
        <p className="text-[11px] text-ink-subtle text-center lowercase mt-1">{status.disclaimer}</p>
      </div>

      {/* 44ADA modal */}
      {showFormula && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface rounded-card shadow-[0_5px_0_0_#D8C3AD] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-display text-ink lowercase">how section 44ada saves gig workers</h3>
              <button
                onClick={() => setShowFormula(false)}
                aria-label="close 44ada breakdown"
                className="p-2 rounded-full text-ink-muted hover:text-ink"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-surface-elevated">
                <span className="text-ink-muted lowercase">standard filing without 44ada</span>
                <strong className="font-currency text-ink">
                  <Currency value={status.estimatedAnnualIncome * 0.1} />
                </strong>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-elevated">
                <span className="text-ink-muted lowercase">with 44ada presumptive (50%)</span>
                <strong className="font-currency text-ink">
                  <Currency value={Math.round(status.estimatedAnnualIncome / 2)} />
                </strong>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-ink-muted lowercase">87a rebate applied</span>
                <strong className="font-currency text-primary lowercase">0 net - within rebate limit</strong>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-4">
              Presumptive taxation keeps your books simple: for gig earners under 44ADA, only 50% of gross receipts count as business profit, and with the section 87A rebate your net tax is effectively zero until income crosses the rebate slab.
            </p>
            <button
              onClick={() => handleReserve(250)}
              className="w-full mt-5 px-4 py-3 rounded-btn bg-ocean text-white text-xs font-bold shadow-[0_4px_0_0_#4E7A7A] active:translate-y-[2px] active:shadow-[0_2px_0_0_#4E7A7A] transition-all lowercase"
            >
              reserve 250 now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};