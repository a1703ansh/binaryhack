import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { type Platform, ALL_PLATFORMS, parseCSVTransactions, sanitizeCSVTransactions } from '@earnwise/shared';
import { Currency } from '../lib/currency';
import { MaterialIcon } from './ui';

interface IncomeConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* =========================================================
   Connect an income stream — "Flat Mascot Playful" restyle.
   Ingestion logic (platform / UPI / bank / CSV parsing and
   import) is unchanged; only the presentation moved to tokens.
   ========================================================= */

const METHODS = [
  { id: 'platform', label: 'Gig App', icon: 'two_wheeler' },
  { id: 'upi', label: 'UPI Auto', icon: 'smartphone' },
  { id: 'bank', label: 'Bank Stmt', icon: 'account_balance' },
  { id: 'csv', label: 'CSV File', icon: 'upload_file' },
] as const;

export const IncomeConnectionModal: React.FC<IncomeConnectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { simulatePlatformConnection, addIncomeSource, importIncomeTransactions } = useEarnWise();
  const [selectedMethod, setSelectedMethod] = useState<'platform' | 'upi' | 'bank' | 'csv'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Zomato');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  // Real ingested records shown on the success screen (instead of a hardcoded list)
  const [ingestedRecords, setIngestedRecords] = useState<{ date: string; amount: number; platform: string }[]>([]);
  const csvFileName = csvFile?.name ?? null;

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1400));

    if (selectedMethod === 'platform') {
      await simulatePlatformConnection(selectedPlatform);
      setIngestedRecords([
        { date: 'Sep 18', amount: 920, platform: selectedPlatform },
        { date: 'Sep 19', amount: 1150, platform: selectedPlatform },
        { date: 'Sep 20', amount: 740, platform: selectedPlatform },
        { date: 'Sep 21', amount: 1280, platform: selectedPlatform },
        { date: 'Sep 22', amount: 1050, platform: selectedPlatform }
      ]);
    } else if (selectedMethod === 'upi') {
      addIncomeSource('Other', 'UPI');
      await simulatePlatformConnection('Other');
      setIngestedRecords([
        { date: 'Sep 18', amount: 920, platform: 'UPI' },
        { date: 'Sep 19', amount: 1150, platform: 'UPI' },
        { date: 'Sep 20', amount: 740, platform: 'UPI' },
        { date: 'Sep 21', amount: 1280, platform: 'UPI' },
        { date: 'Sep 22', amount: 1050, platform: 'UPI' }
      ]);
    } else if (selectedMethod === 'bank') {
      addIncomeSource('Freelancing', 'Bank Statement');
      await simulatePlatformConnection('Freelancing');
      setIngestedRecords([
        { date: 'Sep 18', amount: 920, platform: 'Bank' },
        { date: 'Sep 19', amount: 1150, platform: 'Bank' },
        { date: 'Sep 20', amount: 740, platform: 'Bank' },
        { date: 'Sep 21', amount: 1280, platform: 'Bank' },
        { date: 'Sep 22', amount: 1050, platform: 'Bank' }
      ]);
    } else if (selectedMethod === 'csv') {
      if (!csvFile) {
        setIsConnecting(false);
        setCsvError('Please choose a CSV file before connecting.');
        return;
      }
      try {
        const text = await csvFile.text();
        const rows = parseCSVTransactions(text);
        const txs = sanitizeCSVTransactions(rows, ALL_PLATFORMS);
        if (txs.length === 0) {
          setIsConnecting(false);
          setCsvError('No valid payout rows found. Expected columns: Date, Amount, Platform, Description.');
          return;
        }
        addIncomeSource('Other', 'CSV Upload');
        importIncomeTransactions(txs);
        // Show the ACTUAL parsed records from the uploaded file
        setIngestedRecords(txs.slice(0, 5).map(t => ({
          date: t.date,
          amount: t.amount,
          platform: t.source
        })));
      } catch {
        setIsConnecting(false);
        setCsvError('Could not read that file. Please try a plain-text CSV.');
        return;
      }
    }

    setIsConnecting(false);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setIsConnecting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Connect Income Stream"
    >
      <div className="relative w-full max-w-md bg-surface rounded-card shadow-[0_8px_0_0_#d8c3ad] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-bevel-neutral">
          <div>
            <h2 className="font-questrial text-lg text-ink leading-tight">Connect Income Stream</h2>
            <p className="font-ui text-[11px] text-ink-subtle">Sync payouts automatically into EarnWise</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-ink-subtle hover:bg-surface-high hover:text-ink transition-colors cursor-pointer"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="mt-4 space-y-4">
            {/* Method tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-container rounded-btn">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id)}
                  aria-pressed={selectedMethod === m.id}
                  className={`py-2 px-1 rounded-btn font-ui text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedMethod === m.id
                      ? 'bg-primary text-primary-on shadow-[0_2px_0_0_#ad3300]'
                      : 'text-ink-muted hover:bg-surface-high'
                  }`}
                >
                  <MaterialIcon name={m.icon} className="text-lg" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Platform selection */}
            {selectedMethod === 'platform' && (
              <div className="space-y-2">
                <span className="font-ui text-[11px] font-semibold text-ink-muted">Choose gig platform</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['Zomato', 'Rapido', 'Urban Company', 'Other'] as Platform[]).map(plat => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      aria-pressed={selectedPlatform === plat}
                      className={`p-3 rounded-btn border-2 text-left flex items-center justify-between font-ui text-xs font-semibold transition-all cursor-pointer ${
                        selectedPlatform === plat
                          ? 'bg-primary-fixed border-primary text-primary-deep shadow-[0_2px_0_0_#f9a61f]'
                          : 'bg-surface-low border-bevel-neutral text-ink-muted hover:bg-surface-high'
                      }`}
                    >
                      <span>{plat}</span>
                      {selectedPlatform === plat && <MaterialIcon name="check_circle" className="text-base" filled />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* UPI */}
            {selectedMethod === 'upi' && (
              <div className="p-3.5 rounded-btn bg-surface-low space-y-2">
                <p className="font-questrial text-[13px] text-ink-muted">
                  Simulate reading incoming UPI settlement SMS / webhooks from gig partners:
                </p>
                <input
                  type="text"
                  readOnly
                  aria-label="Simulated UPI identifiers"
                  value="swiggy.partner@icici / gig.payout@axis"
                  className="w-full px-3 py-2 rounded-btn bg-surface border-2 border-bevel-neutral text-ink-subtle font-currency text-[11px]"
                />
              </div>
            )}

            {/* CSV upload */}
            {selectedMethod === 'csv' && (
              <div className="border-2 border-dashed border-bevel-neutral hover:border-primary rounded-card p-5 text-center bg-surface-low">
                <MaterialIcon name="upload" className="text-2xl text-ink-subtle mb-1" />
                <p className="font-ui text-xs font-medium text-ink-muted">
                  {csvFileName || 'Click to upload payout CSV or statement'}
                </p>
                <p className="font-ui text-[10px] text-ink-subtle mt-1">
                  Columns: Date, Amount, Platform, Description
                </p>
                {csvError && <p className="font-ui text-[10px] text-danger mt-1">{csvError}</p>}
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      setCsvFile(e.target.files[0]);
                      setCsvError(null);
                    }
                  }}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="mt-2 inline-block px-3 py-1.5 rounded-full bg-surface-container text-ink font-ui text-xs font-semibold shadow-[0_3px_0_0_#d8c3ad] hover:bg-surface-high cursor-pointer"
                >
                  Browse file
                </label>
              </div>
            )}

            {/* Bank statement */}
            {selectedMethod === 'bank' && (
              <div className="p-3.5 rounded-btn bg-surface-low space-y-1.5">
                <p className="font-questrial text-[13px] text-ink-muted">
                  Simulate connecting your salary or digital savings account via a mock Account Aggregator protocol.
                </p>
                <div className="font-ui text-[11px] text-secondary-deep flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  100% read-only metadata ingestion
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 rounded-full font-ui font-bold text-sm bg-secondary text-white shadow-[0_5px_0_0_#065f46] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_0_#065f46] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <MaterialIcon name="progress_activity" className="text-lg animate-spin" />
                  <span>Connecting securely…</span>
                </>
              ) : (
                <>
                  <span>Connect &amp; ingest past payouts</span>
                  <MaterialIcon name="arrow_forward" className="text-lg" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-secondary/15 text-secondary-deep flex items-center justify-center mx-auto">
              <MaterialIcon name="check_circle" className="text-3xl" filled />
            </div>
            <div>
              <h3 className="font-questrial text-lg text-ink">Connected successfully!</h3>
              <p className="font-ui text-[11px] text-ink-subtle mt-1">
                Ingested recent settlement records into your income stream.
              </p>
            </div>
            <div className="p-3 rounded-btn bg-surface-low text-left font-currency tabular-nums text-[11px] text-ink-muted space-y-1">
              {ingestedRecords.map((r, idx) => (
                <div key={idx}>
                  • {r.date} — <Currency value={r.amount} /> ({r.platform} • Synced)
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-full font-ui font-bold text-sm bg-secondary text-white shadow-[0_4px_0_0_#065f46] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_0_#065f46] transition-all cursor-pointer"
            >
              View updated income
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
