import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const logs = await prisma.automationLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(logs.map((l) => ({
    id: l.id,
    timestamp: l.createdAt.toISOString(),
    type: l.type,
    title: l.title,
    amount: l.amount,
    reason: l.reason,
    canUndo: l.canUndo,
    undone: l.undone,
    payoutAmount: l.payoutAmount ?? undefined,
    spendableRemaining: l.spendableRemaining ?? undefined
  })));
}));

export default router;