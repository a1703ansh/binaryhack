import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { asyncHandler } from '../lib/errors.js';
import { createUserWithOnboardData } from '../services/seed.service.js';

/**
 * Reset a user back to the canonical demo benchmark state.
 * Wipes the full data surface in FK-safe order and re-provisions onboard data.
 */
const router = Router();
router.use(requireAuth);

router.post('/reset', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  await prisma.$transaction(async (tx) => {
    await tx.automationLog.deleteMany({ where: { userId } });
    await tx.ledgerEntry.deleteMany({ where: { userId } });
    await tx.payoutRun.deleteMany({ where: { userId } });
    await tx.chatMessage.deleteMany({ where: { userId } });
    await tx.transaction.deleteMany({ where: { userId } });
    await tx.expense.deleteMany({ where: { userId } });
    await tx.savingsGoal.deleteMany({ where: { userId } });
    await tx.ledgerAccount.deleteMany({ where: { userId } });
    await tx.incomeSource.deleteMany({ where: { userId } });
    await tx.investmentProfile.deleteMany({ where: { userId } });
    await tx.taxProfile.deleteMany({ where: { userId } });
    await tx.savingsSettings.deleteMany({ where: { userId } });

    await createUserWithOnboardData(tx, userId);
  });

  res.json({ ok: true, message: 'Demo data reset to benchmark state' });
}));

export default router;