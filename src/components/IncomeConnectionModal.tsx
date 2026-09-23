import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Building2, 
  Bike, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight,
  Upload,
  Loader2
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { type Platform, ALL_PLATFORMS, parseCSVTransactions, sanitizeCSVTransactions } from '@earnwise/shared';

interface IncomeConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Connect Income Stream</h2>
            <p className="text-xs text-slate-400">Sync payouts automatically into EarnWise</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="mt-4 space-y-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedMethod('platform')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'platform' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Gig App</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'upi' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI Auto</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'bank' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bank Stmt</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('csv')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'csv' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV File</span>
              </button>
            </div>

            {/* Platform Selection */}
            {selectedMethod === 'platform' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Choose Gig Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Zomato', 'Rapido', 'Urban Company', 'Other'] as Platform[]).map(plat => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-semibold ${
                        selectedPlatform === plat
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{plat}</span>
                      {selectedPlatform === plat && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* UPI Simulated */}
            {selectedMethod === 'upi' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <p className="text-slate-300">Simulate reading incoming UPI settlement SMS/Webhooks from gig partners:</p>
                <input
                  type="text"
                  readOnly
                  value="swiggy.partner@icici / gig.payout@axis"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 font-mono text-xs"
                />
              </div>
            )}

            {/* CSV File Upload */}
            {selectedMethod === 'csv' && (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-5 text-center bg-slate-950/50 cursor-pointer">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-300">
                    {csvFileName || "Click to upload payout CSV or statement"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Columns: Date, Amount, Platform, Description</p>
                  {csvError && (
                    <p className="text-[10px] text-rose-400 mt-1">{csvError}</p>
                  )}
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
                  <label htmlFor="csv-file-input" className="mt-2 inline-block px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 cursor-pointer">
                    Browse File
                  </label>
                </div>
              </div>
            )}

            {/* Bank Statement */}
            {selectedMethod === 'bank' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <p>Simulate connecting your salary or digital savings account via mock Account Aggregator protocol.</p>
                <div className="text-[11px] text-emerald-400">● 100% read-only metadata ingestion</div>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Securely...</span>
                </>
              ) : (
                <>
                  <span>Connect & Ingest Past Payouts</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-4 py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connected Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ingested recent settlement records into your Income stream.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1 font-mono text-slate-300">
              {ingestedRecords.map((r, idx) => (
                <div key={idx}>• {r.date} — ₹{r.amount.toLocaleString('en-IN')} ({r.platform} • Synced)</div>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              View Updated Income
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
