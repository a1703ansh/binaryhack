import React, { useState } from 'react';
import { 
  History, 
  PiggyBank, 
  ReceiptIndianRupee, 
  LineChart, 
  AlertCircle, 
  RotateCcw, 
  Info,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { ExplainableModal } from '../components/ExplainableModal';
import { AutomationLog } from '../types';

export const ActivityView: React.FC = () => {
  const { activityLogs, undoAutoSave } = useEarnWise();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);

  const filtered = activityLogs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const getIcon = (type: AutomationLog['type']) => {
    switch (type) {
      case 'auto-save': return PiggyBank;
      case 'tax-reserve': return ReceiptIndianRupee;
      case 'investment-recommendation': return LineChart;
      default: return Info;
    }
  };

  const getColor = (type: AutomationLog['type']) => {
    switch (type) {
      case 'auto-save': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'tax-reserve': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'investment-recommendation': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit Trail & Activity</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Automation Log & History</h1>
          <p className="text-xs text-slate-400">
            Complete transparent log of all autonomous saving, tax provisioning, and investment triggers
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilterType('auto-save')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'auto-save' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto-Save
          </button>
          <button
            onClick={() => setFilterType('tax-reserve')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'tax-reserve' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tax
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No automation actions found for this filter.
            </div>
          ) : (
            filtered.map(log => {
              const Icon = getIcon(log.type);
              const colorClass = getColor(log.type);

              return (
                <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{log.title}</h4>
                        {log.undone && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Undone / Reversed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                        "{log.reason}"
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {log.amount > 0 && (
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-white">
                          ₹{log.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
                      >
                        View Details
                      </button>

                      {log.canUndo && !log.undone && (
                        <button
                          onClick={() => undoAutoSave(log.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Undo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Details Modal */}
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
