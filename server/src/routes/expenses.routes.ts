import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { badRequest, asyncHandler } from '../lib/errors.js';
import { validateBody } from '../lib/validate.js';
import { uploadReceipt, uploadsDir } from '../lib/upload.js';
import { addExpenseRecord } from '../services/ledger.service.js';
import { prisma } from '../db.js';

const router = Router();
router.use(requireAuth);

const EXPENSE_CATEGORIES = ['Fuel', 'Vehicle Maintenance', 'Food', 'Phone/Data', 'Rent', 'EMI/Repayment', 'Other'] as const;

const expenseSchema = z.object({
  amount: z.number().int().positive(),
  category: z.enum(EXPENSE_CATEGORIES),
  note: z.string().trim().min(1, 'Add a short note'),
  date: z.string().datetime().optional()
});

router.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  res.json(await prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } }));
}));

router.post('/', validateBody(expenseSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { amount, category, note, date } = req.body;
  const expense = await addExpenseRecord(userId, {
    amount, category, note,
    date: date ? new Date(date) : undefined
  });
  res.status(201).json(expense);
}));

// Multipart receipt upload
router.post('/receipt', uploadReceipt.single('receipt'), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  if (!req.file) throw badRequest('Receipt image (PNG/JPEG/WEBP, max 8MB) is required');

  const body = (req.body ?? {}) as { amount?: string; category?: string; note?: string };
  const amount = Number(body.amount ?? 0);
  const category = body.category ?? 'Other';
  const note = body.note ?? 'Receipt scanned via upload';

  if (!Number.isInteger(amount) || amount <= 0) {
    // could not build an expense — still record the file for manual review? No: reject cleanly.
    throw badRequest('A positive numeric amount is required with the receipt');
  }

  const expense = await addExpenseRecord(userId, {
    amount,
    category,
    note,
    receiptPath: `/uploads/${req.file.filename}`,
    receiptMime: req.file.mimetype
  });

  res.status(201).json(expense);
}));

// CSV export for expenses
router.get('/export-csv', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const expenses = await prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  const header = 'Date,Amount,Category,Note,ReceiptStatus';
  const rows = expenses.map((e) =>
    [e.date.toISOString().split('T')[0], e.amount, e.category, `"${e.note.replace(/"/g, '""')}"`, e.receiptStatus].join(',')
  );
  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename="earnwise-expenses-${Date.now()}.csv"`);
  res.send([header, ...rows].join('\n'));
}));

const csvImportSchema = z.object({ csv: z.string().min(1) });
router.post('/import-csv', validateBody(csvImportSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const lines = req.body.csv.trim().split('\n').slice(1);
  let imported = 0;

  for (const line of lines) {
    const cols = (line as string).split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
    const amount = Number(cols[1]);
    const category = cols[2];
    if (Number.isInteger(amount) && amount > 0 && EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])) {
      await addExpenseRecord(userId, {
        amount,
        category,
        note: cols[3] || 'Imported expense',
        date: cols[0] ? new Date(cols[0]) : undefined
      });
      imported++;
    }
  }

  res.status(201).json({ ok: true, imported });
}));

export { uploadsDir };
export default router;