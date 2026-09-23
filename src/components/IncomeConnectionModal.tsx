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
import { Platform } from '../types';

interface IncomeConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncomeConnectionModal: React.FC<IncomeConnectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { simulatePlatformConnection, addIncomeSource } = useEarnWise();
  const [selectedMethod, setSelectedMethod] = useState<'platform' | 'upi' | 'bank' | 'csv'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Zomato');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    if (selectedMethod === 'platform') {
      await simulatePlatformConnection(selectedPlatform);
    } else if (selectedMethod === 'upi') {
      addIncomeSource('Other', 'UPI');
      await simulatePlatformConnection('Other');
    } else if (selectedMethod === 'bank') {
      addIncomeSource('Freelancing', 'Bank Statement');
      await simulatePlatformConnection('Freelancing');
    } else if (selectedMethod === 'csv') {
      addIncomeSource('Other', 'CSV Upload');
      await simulatePlatformConnection('Other');
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
                  <input
                    type="file"
                    accept=".csv"
                    onChange={e => {
                      if (e.target.files?.[0]) setCsvFileName(e.target.files[0].name);
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
              <div>• Sep 18 — ₹920 (Synced)</div>
              <div>• Sep 19 — ₹1,150 (Synced)</div>
              <div>• Sep 20 — ₹740 (Synced)</div>
              <div>• Sep 21 — ₹1,280 (Synced)</div>
              <div>• Sep 22 — ₹1,050 (Synced)</div>
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
