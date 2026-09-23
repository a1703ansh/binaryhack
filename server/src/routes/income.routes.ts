import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { badRequest } from '../lib/errors.js';
import { asyncHandler } from '../lib/errors.js';
import { validateBody } from '../lib/validate.js';
import { parseCSVTransactions, sanitizeCSVTransactions } from '@earnwise/shared';

const router = Router();
router.use(requireAuth);

const PLATFORM_COLORS: Record<string, string> = {
  Swiggy: '#FC8019',
  Uber: '#000000',
  Zomato: '#E23744',
  Rapido: '#FFCC00',
  Freelancing: '#3B82F6',
  'Urban Company': '#6C5CE7',
  Other: '#64748B'
};

const addSourceSchema = z.object({
  name: z.enum(['Swiggy', 'Uber', 'Zomato', 'Rapido', 'Freelancing', 'Urban Company', 'Other']),
  type: z.enum(['Gig Platform', 'UPI', 'Bank Statement', 'CSV Upload'])
});

router.get('/sources', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const sources = await prisma.incomeSource.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  res.json(sources.map((s) => ({
    id: s.id,
    name: s.name,
    connected: s.connected,
    type: s.type,
    monthlyTotal: s.monthlyTotal,
    lastPayoutDate: s.lastPayoutDate ? s.lastPayoutDate.toISOString() : null,
    payoutFrequency: s.payoutFrequency,
    color: s.color
  })));
}));

router.post('/sources', validateBody(addSourceSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { name, type } = req.body;
  const existing = await prisma.incomeSource.findFirst({ where: { userId, name } });
  if (existing) throw badRequest('This platform is already connected');

  const source = await prisma.incomeSource.create({
    data: {
      userId,
      name,
      type,
      connected: true,
      payoutFrequency: 'Daily / Weekly',
      color: PLATFORM_COLORS[name] ?? '#64748B'
    }
  });
  res.status(201).json(source);
}));

// Simulated platform connection wizard: syncs a batch of settlements
router.post('/sources/connect', validateBody(addSourceSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { name, type } = req.body;

  const existing = await prisma.incomeSource.findFirst({ where: { userId, name } });
  const mockAmounts = [920, 1150, 740, 1280, 1050];
  const addedTotal = mockAmounts.reduce((a, b) => a + b, 0);

  await prisma.$transaction(async (tx) => {
    const source = existing ?? await tx.incomeSource.create({
      data: { userId, name, type, connected: true, payoutFrequency: 'Daily / Weekly', color: PLATFORM_COLORS[name] ?? '#64748B' }
    });

    for (let idx = 0; idx < mockAmounts.length; idx++) {
      const amt = mockAmounts[idx];
      await tx.transaction.create({
        data: {
          userId,
          source: name,
          amount: amt,
          date: new Date(Date.now() - idx * 86400000),
          description: `${name} settlement sync`,
          status: 'Received',
          autoSavedAmount: Math.round(amt * 0.1),
          taxReservedAmount: Math.round(amt * 0.1),
          investRecommendedAmount: Math.round(amt * 0.05),
          spendableAmount: Math.round(amt * 0.75),
          kind: 'connect'
        }
      });
    }

    await tx.incomeSource.update({
      where: { id: source.id },
      data: { connected: true, monthlyTotal: { increment: addedTotal } }
    });
  });

  res.json({ ok: true, syncedTransactions: mockAmounts.length, addedTotal });
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const transactions = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 });
  res.json(transactions.map((t) => ({ ...t, date: t.date.toISOString() })));
}));

const csvImportSchema = z.object({
  csv: z.string().min(1, 'CSV content required')
});

router.post('/transactions/import-csv', validateBody(csvImportSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { csv } = req.body;
  const validPlatforms = ['Swiggy', 'Uber', 'Zomato', 'Rapido', 'Freelancing', 'Urban Company', 'Other'];

  const parsed = parseCSVTransactions(csv);
  if (parsed.length === 0) throw badRequest('No valid transactions found in CSV (expected Date, Amount, Platform, Description)');

  const sanitized = sanitizeCSVTransactions(parsed, validPlatforms);
  const totalAdded = sanitized.reduce((acc, t) => acc + t.amount, 0);

  const created = await prisma.$transaction(async (tx) => {
    const rows = sanitized.map((t) => ({
      userId,
      source: t.source,
      amount: t.amount,
      date: new Date(t.date),
      description: t.description,
      status: 'Received' as const,
      kind: 'import'
    }));
    await tx.transaction.createMany({ data: rows });
    return rows.length;
  });

  res.status(201).json({ ok: true, imported: created, totalAdded });
}));

export default router;