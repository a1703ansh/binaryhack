import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { asyncHandler } from '../lib/errors.js';
import { validateBody } from '../lib/validate.js';
import { reserveAdditionalTax } from '../services/ledger.service.js';
import { computeTaxStatus } from '@earnwise/shared';
import { prisma } from '../db.js';

const router = Router();
router.use(requireAuth);

// Current provisioning status (derived from ledger + profile)
router.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const [profile, taxAccount] = await Promise.all([
    prisma.taxProfile.findUnique({ where: { userId } }),
    prisma.ledgerAccount.findUnique({ where: { userId_type: { userId, type: 'TAX' } } })
  ]);
  const reserved = taxAccount?.balance ?? profile?.taxAlreadyReserved ?? 0;
  const status = computeTaxStatus(reserved);
  res.json({
    ...status,
    quarterlyDueDate: profile?.quarterlyDueDate ?? 'March 15, 2027',
    quarterlyDaysRemaining: profile?.quarterlyDaysRemaining ?? 24,
    readinessPercentage: profile?.readinessPercentage ?? status.readinessPercentage,
    mockTaxRate: (profile?.mockTaxRate ?? 10) / 100
  });
}));

const reserveSchema = z.object({ additional: z.number().int().min(1) });
router.post('/reserve', validateBody(reserveSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const profile = await reserveAdditionalTax(userId, req.body.additional);
  res.status(201).json({ ok: true, taxProfile: { ...profile, mockTaxRate: profile.mockTaxRate / 100 } });
}));

export default router;