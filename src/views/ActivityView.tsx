import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { ExplainableModal } from '../components/ExplainableModal';
import { type AutomationLog } from '@earnwise/shared';
import { Currency } from '../lib/currency';
import { MaterialIcon } from '../components/ui';

/* =========================================================
   Activity & audit log — "Flat Mascot Playful" restyle.
   Filtering, undo and the detail modal are unchanged.
   ========================================================= */

const TYPE_ICON: Record<AutomationLog['type'], string> = {
  'auto-save': 'savings',
  'tax-reserve': 'account_balance',
  'investment-recommendation': 'trending_up',
  'system-alert': 'info',
};

const TYPE_TONE: Record<AutomationLog['type'], string> = {
  'auto-save': 'bg-secondary/15 text-secondary-deep',
  'tax-reserve': 'bg-berry-fixed text-berry-ondeep',
  'investment-recommendation': 'bg-ocean-faint text-ocean-ondeep',
  'system-alert': 'bg-surface-container text-ink-muted',
};

const FILTERS = [
  { id: 'all', label: 'All logs', tone: 'bg-primary text-primary-on shadow-[0_2px_0_0_#ad3300]' },
  { id: 'auto-save', label: 'Auto-save', tone: 'bg-secondary text-white shadow-[0_2px_0_0_#065f46]' },
  { id: 'tax-reserve', label: 'Tax', tone: 'bg-berry text-white shadow-[0_2px_0_0_#842500]' },
] as const;

export const ActivityView: React.FC = () => {
  const { activityLogs, undoAutoSave } = useEarnWise();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);

  const filtered = activityLogs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-ui text-[11px] font-semibold text-ocean uppercase tracking-wider mb-1">
            <MaterialIcon name="history" className="text-base" />
            <span>Audit trail &amp; activity</span>
          </div>
          <h1 className="font-questrial text-3xl text-surface lowercase tracking-tight">automation log</h1>
          <p className="font-questrial text-sm text-surface/95">
            every autonomous save, tax provision and investment trigger, fully explained
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface rounded-full shadow-[0_3px_0_0_#d8c3ad]">
          {FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              aria-pressed={filterType === f.id}
              className={`px-3 py-1.5 rounded-full font-ui text-[11px] font-semibold transition-all cursor-pointer ${
                filterType === f.id ? f.tone : 'text-ink-muted hover:bg-surface-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-surface rounded-card p-5 sm:p-6 shadow-[0_6px_0_0_#006686]">
        <div className="divide-y divide-bevel-neutral">
          {filtered.length === 0 ? (
            <div className="py-12 text-center font-questrial text-sm text-ink-subtle">
              No automation actions found for this filter.
            </div>
          ) : (
            filtered.map(log => (
              <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${TYPE_TONE[log.type]}`}>
                    <MaterialIcon name={TYPE_ICON[log.type]} className="text-xl" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-questrial text-base text-ink">{log.title}</h4>
                      {log.undone && (
                        <span className="font-ui text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger-light text-danger-ondeep">
                          Undone / reversed
                        </span>
                      )}
                    </div>
                    <p className="font-questrial text-sm text-ink-muted mt-0.5 leading-relaxed max-w-xl">
                      &ldquo;{log.reason}&rdquo;
                    </p>
                    <span className="font-currency text-[11px] text-ink-subtle mt-1 block">{log.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {log.amount > 0 && (
                    <div className="font-currency tabular-nums text-base font-bold text-ink text-right">
                      <Currency value={log.amount} />
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1.5 rounded-full font-ui text-[11px] font-semibold bg-surface-container text-ink-muted shadow-[0_3px_0_0_#d8c3ad] hover:bg-surface-high active:translate-y-0.5 cursor-pointer"
                    >
                      View details
                    </button>

                    {log.canUndo && !log.undone && (
                      <button
                        type="button"
                        onClick={() => undoAutoSave(log.id)}
                        className="px-3 py-1.5 rounded-full font-ui text-[11px] font-semibold bg-berry-fixed text-berry-ondeep shadow-[0_3px_0_0_#842500] hover:brightness-105 active:translate-y-0.5 cursor-pointer flex items-center gap-1"
                      >
                        <MaterialIcon name="undo" className="text-sm" />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details modal */}
      {selectedLog && (
        <ExplainableModal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          payoutAmount={selectedLog.payoutAmount || selectedLog.amount}
          saveAmount={selectedLog.type === 'auto-save' ? selectedLog.amount : 0}
          taxAmount={selectedLog.type === 'tax-reserve' ? selectedLog.amount : 0}
          investAmount={selectedLog.type === 'investment-recommendation' ? selectedLog.amount : 0}
          spendableAmount={selectedLog.spendableRemaining || 0}
          reason={selectedLog.reason}
        />
      )}
    </div>
  );
};
