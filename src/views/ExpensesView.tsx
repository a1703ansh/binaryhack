import React, { useState } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { type ExpenseCategory } from '@earnwise/shared';
import { api } from '../api/client';
import { Currency } from '../lib/currency';
import { Button, Input, MaterialIcon, Modal } from '../components/ui';

/* =========================================================
   Expenses as behavioural signals — "Flat Mascot Playful"
   restyle. Create / scan / import / export logic is unchanged.
   ========================================================= */

const CATEGORIES: { label: ExpenseCategory; icon: string }[] = [
  { label: 'Fuel', icon: 'local_gas_station' },
  { label: 'Vehicle Maintenance', icon: 'build' },
  { label: 'Food', icon: 'restaurant' },
  { label: 'Phone/Data', icon: 'smartphone' },
  { label: 'Rent', icon: 'home' },
  { label: 'EMI/Repayment', icon: 'credit_card' },
  { label: 'Other', icon: 'receipt_long' },
];

const CATEGORY_ICON: Record<ExpenseCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.label]: c.icon }),
  {} as Record<ExpenseCategory, string>
);

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, safeSpending, refresh } = useEarnWise();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(450);
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [note, setNote] = useState('');
  const [isReceiptScanning, setIsReceiptScanning] = useState(false);
  const [detectedReceipt, setDetectedReceipt] = useState<{ category: ExpenseCategory; amount: number } | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

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

  const handleExportCSV = async () => {
    const blob = await api.download('/expenses/export-csv');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnwise-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Expense CSV import (Date, Category, Amount, Note) — mirrors the export format
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || '');
      try {
        const res = await api.post<{ imported: number }>('/expenses/import-csv', { csv: text });
        await refresh();
        setImportSummary(res.imported > 0
          ? `Imported ${res.imported} expense record${res.imported === 1 ? '' : 's'}.`
          : 'No valid rows found. Expected columns: Date, Category, Amount, Note.');
      } catch {
        setImportSummary('Could not import that file. Expected columns: Date, Category, Amount, Note.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-ui text-[11px] font-semibold text-berry uppercase tracking-wider mb-1">
            <MaterialIcon name="receipt_long" className="text-base" />
            <span>Operational activity</span>
          </div>
          <h1 className="font-questrial text-3xl text-surface lowercase tracking-tight">expenses &amp; behaviour</h1>
          <p className="font-questrial text-sm text-surface/95 max-w-xl">
            expenses as behavioural signals that inform your safe-to-spend buffer and minimum balance guardrails
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportCSV} className="rounded-full">
            <MaterialIcon name="download" className="text-base" />
            <span className="font-ui">Export CSV</span>
          </Button>

          <label className="px-3 py-1.5 rounded-full font-ui text-xs font-semibold text-ink-muted border-2 border-bevel-neutral hover:bg-surface-high transition-colors cursor-pointer inline-flex items-center gap-1.5">
            <MaterialIcon name="upload" className="text-base" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="rounded-full">
            <MaterialIcon name="add_circle" className="text-lg" filled />
            <span className="font-ui">Add expense</span>
          </Button>
        </div>
      </div>

      {/* Behavioural signal context */}
      <div className="bg-surface rounded-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_6px_0_0_#006686]">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-berry-fixed text-berry-ondeep flex items-center justify-center shrink-0">
            <MaterialIcon name="insights" className="text-xl" filled />
          </div>
          <div>
            <strong className="font-questrial text-base text-ink block">How expenses power zero-effort finance</strong>
            <p className="font-questrial text-sm text-ink-muted mt-0.5 leading-relaxed max-w-xl">
              Expenses are not just numbers to lament — they dynamically calibrate your{' '}
              <strong className="text-ink">safe weekly spending</strong> allowance (
              <Currency value={safeSpending.safeWeeklySpending} />) and help detect operational cost shocks early.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-card bg-surface-low text-right shrink-0">
          {importSummary && <div className="font-ui text-[10px] text-secondary-deep mb-1">{importSummary}</div>}
          <span className="font-ui text-[11px] text-ink-subtle">Total tracked:</span>
          <div className="font-currency tabular-nums text-xl text-ink mt-0.5">
            <Currency value={totalExpense} />
          </div>
        </div>
      </div>

      {/* Receipt scanner */}
      <div className="bg-surface rounded-card p-5 sm:p-6 shadow-[0_6px_0_0_#845400]">
        <div className="pb-3 border-b border-bevel-neutral mb-4">
          <h3 className="font-questrial text-lg text-ink flex items-center gap-2">
            <MaterialIcon name="document_scanner" className="text-xl text-primary-deep" />
            <span>Instant receipt scanner (mock OCR)</span>
          </h3>
          <p className="font-ui text-[11px] text-ink-subtle">
            Upload fuel slips or mechanic invoices for instant classification
          </p>
        </div>

        {!detectedReceipt ? (
          <button
            type="button"
            onClick={handleSimulateReceiptUpload}
            className="w-full border-2 border-dashed border-bevel-neutral hover:border-primary rounded-card p-6 text-center bg-surface-low transition-all cursor-pointer"
          >
            <MaterialIcon
              name="upload"
              className={`text-3xl mx-auto mb-2 block ${isReceiptScanning ? 'text-primary-deep animate-bounce' : 'text-ink-subtle'}`}
            />
            <p className="font-ui text-xs font-semibold text-ink">
              {isReceiptScanning ? 'Analyzing receipt via smart classifier…' : 'Click to upload receipt / fuel slip'}
            </p>
            <p className="font-ui text-[10px] text-ink-subtle mt-1">
              Supports petrol pump slips, workshop bills &amp; maintenance receipts
            </p>
          </button>
        ) : (
          <div className="p-4 rounded-card bg-secondary/15 border-2 border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MaterialIcon name="check_circle" className="text-2xl text-secondary-deep shrink-0" filled />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-questrial text-sm text-secondary-deep">Detected: {detectedReceipt.category}</span>
                  <span className="font-currency tabular-nums text-sm text-ink">
                    <Currency value={detectedReceipt.amount} />
                  </span>
                  <span className="font-ui text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-primary-deep">
                    Pending review
                  </span>
                </div>
                <p className="font-ui text-[11px] text-ink-muted mt-0.5">
                  Extracted from petrol pump receipt timestamp 09:30 AM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setDetectedReceipt(null)} className="rounded-full">
                Discard
              </Button>
              <Button variant="secondary" size="sm" onClick={handleAcceptReceipt} className="rounded-full">
                Confirm &amp; log
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-surface rounded-card p-5 sm:p-6 shadow-[0_6px_0_0_#d8c3ad]">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-bevel-neutral mb-4">
          <h3 className="font-questrial text-lg text-ink">Recent expenses</h3>
          <span className="font-currency tabular-nums text-xs text-ink-subtle">{expenses.length} entries</span>
        </div>

        <div className="divide-y divide-bevel-neutral">
          {expenses.map(exp => (
            <div key={exp.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-ink-muted shrink-0">
                  <MaterialIcon name={CATEGORY_ICON[exp.category] ?? 'receipt_long'} className="text-lg" />
                </div>

                <div className="min-w-0">
                  <div className="font-ui text-xs font-semibold text-ink truncate">{exp.note}</div>
                  <div className="font-ui text-[11px] text-ink-subtle">{exp.date} • {exp.category}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-currency tabular-nums font-bold text-ink text-sm">
                  <Currency value={-exp.amount} />
                </div>
                <span className="font-ui text-[10px] text-secondary-deep">
                  {exp.receiptStatus === 'verified' ? 'Verified receipt' : 'Manual entry'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add expense modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add operational expense"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <span className="block font-ui font-semibold text-ink-muted mb-1.5 text-sm">Category</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCategory(c.label)}
                  aria-pressed={category === c.label}
                  className={`p-2.5 rounded-btn border-2 flex flex-col items-center gap-1 font-ui text-[11px] font-semibold transition-all cursor-pointer ${
                    category === c.label
                      ? 'bg-primary-fixed border-primary text-primary-deep shadow-[0_2px_0_0_#f9a61f]'
                      : 'bg-surface-low border-bevel-neutral text-ink-muted hover:bg-surface-high'
                  }`}
                >
                  <MaterialIcon name={c.icon} className="text-lg" />
                  <span className="text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            id="expense-amount"
            label="Amount (₹)"
            type="number"
            required
            min={1}
            className="font-currency tabular-nums"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />

          <Input
            id="expense-note"
            label="Description / note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Fuel top-up / Mobile data pack"
          />

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" full onClick={() => setIsAddModalOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" variant="secondary" full className="rounded-full">
              Save expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
