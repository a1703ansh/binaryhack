import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Upload, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  Fuel, 
  Wrench, 
  Utensils, 
  Smartphone, 
  Home, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';
import { Expense, ExpenseCategory } from '../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, safeSpending } = useEarnWise();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(450);
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [note, setNote] = useState('');
  const [isReceiptScanning, setIsReceiptScanning] = useState(false);
  const [detectedReceipt, setDetectedReceipt] = useState<{ category: ExpenseCategory; amount: number } | null>(null);

  const categories: { label: ExpenseCategory; icon: any; color: string }[] = [
    { label: 'Fuel', icon: Fuel, color: '#EF4444' },
    { label: 'Vehicle Maintenance', icon: Wrench, color: '#F97316' },
    { label: 'Food', icon: Utensils, color: '#EAB308' },
    { label: 'Phone/Data', icon: Smartphone, color: '#3B82F6' },
    { label: 'Rent', icon: Home, color: '#8B5CF6' },
    { label: 'Other', icon: Receipt, color: '#64748B' }
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addExpense({
      date: 'Just now',
      amount: Number(amount),
      category,
      note: note || `${category} gig operational expense`,
      receiptStatus: 'manual'
    });

    setAmount(0);
    setNote('');
    setIsAddModalOpen(false);
  };

  const handleSimulateReceiptUpload = () => {
    setIsReceiptScanning(true);
    setTimeout(() => {
      setIsReceiptScanning(false);
      setDetectedReceipt({ category: 'Fuel', amount: 450 });
    }, 1200);
  };

  const handleAcceptReceipt = () => {
    if (!detectedReceipt) return;
    addExpense({
      date: 'Just now (Receipt Scanned)',
      amount: detectedReceipt.amount,
      category: detectedReceipt.category,
      note: 'HP Petrol Pump refuel (Instant Receipt Scan)',
      receiptStatus: 'verified'
    });
    setDetectedReceipt(null);
  };

  const handleExportCSV = () => {
    const header = 'Date,Category,Amount,Note,Status\n';
    const rows = expenses.map(e => `"${e.date}","${e.category}",${e.amount},"${e.note}","${e.receiptStatus || 'verified'}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnwise-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Operational Activity</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Expenses & Behavioral Data</h1>
          <p className="text-xs text-slate-400">
            Repositioned as behavioral signals informing your safe-to-spend buffer & minimum balance guardrails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Behavioral Signal Context Card */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300">
            <strong className="text-white text-sm block">How Expenses Power Zero-Effort Finance:</strong>
            <p className="text-slate-400 mt-0.5 leading-relaxed max-w-xl">
              In EarnWise, expenses are not just numbers to lament—they dynamically calibrate your <strong>Safe Weekly Spending</strong> allowance (₹{safeSpending.safeWeeklySpending.toLocaleString('en-IN')}) and help detect operational cost shocks early.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-slate-400">Total Tracked:</span>
          <div className="text-xl font-black font-mono text-white mt-0.5">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Mock Receipt Upload Widget (Step 20 Specification) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Instant Receipt Scanner (Mock OCR)</span>
          </h3>
          <p className="text-xs text-slate-400">Upload fuel slips or mechanic invoices for instant classification</p>
        </div>

        {!detectedReceipt ? (
          <div 
            onClick={handleSimulateReceiptUpload}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-slate-950/60 cursor-pointer transition-all"
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isReceiptScanning ? 'text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
            <p className="text-xs font-semibold text-slate-200">
              {isReceiptScanning ? 'Analyzing Receipt via Smart Classifier...' : 'Click to Upload Receipt / Fuel Slip'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Supports petrol pump slips, workshop bills & maintenance receipts
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <span>Detected: {detectedReceipt.category}</span>
                  <span className="font-mono text-white text-sm">₹{detectedReceipt.amount}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pending review
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Extracted from petrol pump receipt timestamp 09:30 AM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDetectedReceipt(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Discard
              </button>
              <button
                onClick={handleAcceptReceipt}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow"
              >
                Confirm & Log Expense
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expense History List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white">Recent Expenses</h3>
          <span className="text-xs text-slate-400">{expenses.length} entries</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {expenses.map(exp => (
            <div key={exp.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                  {exp.category === 'Fuel' ? <Fuel className="w-4 h-4 text-red-400" /> :
                   exp.category === 'Vehicle Maintenance' ? <Wrench className="w-4 h-4 text-orange-400" /> :
                   exp.category === 'Food' ? <Utensils className="w-4 h-4 text-yellow-400" /> :
                   exp.category === 'Phone/Data' ? <Smartphone className="w-4 h-4 text-blue-400" /> :
                   <Receipt className="w-4 h-4 text-slate-400" />}
                </div>

                <div>
                  <div className="font-semibold text-white">{exp.note}</div>
                  <div className="text-[11px] text-slate-400">{exp.date} • {exp.category}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-white text-sm">
                  -₹{exp.amount.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-emerald-400">
                  {exp.receiptStatus === 'verified' ? 'Verified Receipt' : 'Manual Entry'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">Add Operational Expense</h2>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setCategory(c.label)}
                      className={`p-2 rounded-xl border text-center font-semibold text-xs ${
                        category === c.label 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Fuel top-up / Mobile data pack"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
