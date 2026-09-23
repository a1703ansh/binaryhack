import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { validateBody } from '../lib/validate.js';
import { asyncHandler } from '../lib/errors.js';
import { approveInvestmentPlan } from '../services/ledger.service.js';
import { generateAllocation, simulateGrowth } from '@earnwise/shared';

const router = Router();
router.use(requireAuth);

router.get('/profile', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const profile = await prisma.investmentProfile.findUnique({ where: { userId } });
  res.json(profile);
}));

router.get('/categories', asyncHandler(async (_req, res) => {
  const { INITIAL_INVESTMENT_CATEGORIES } = await import('@earnwise/shared');
  res.json(INITIAL_INVESTMENT_CATEGORIES);
}));

const approveSchema = z.object({ amount: z.number().int().min(0) });
router.post('/approve', validateBody(approveSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const log = await approveInvestmentPlan(userId, req.body.amount);
  res.status(201).json({ ok: true, log });
}));

const simulateSchema = z.object({
  monthlyContribution: z.number().int().min(100).max(100000),
  durationYears: z.number().int().min(1).max(30),
  annualRate: z.number().min(0).max(0.30).default(0.10)
});
router.post('/simulate', validateBody(simulateSchema), asyncHandler(async (req, res) => {
  const { monthlyContribution, durationYears, annualRate } = req.body;
  res.json(simulateGrowth(monthlyContribution, durationYears, annualRate));
}));

router.get('/allocation/:amount', asyncHandler(async (req, res) => {
  const amount = Number(req.params.amount as string);
  res.json({ amount, ...generateAllocation(isFinite(amount) ? amount : 1000) });
}));

export default router;