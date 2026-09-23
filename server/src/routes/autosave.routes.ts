import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { validateBody } from '../lib/validate.js';
import { asyncHandler } from '../lib/errors.js';
import { buildDashboard } from '../services/dashboard.service.js';

const router = Router();
router.use(requireAuth);

const settingsSchema = z.object({
  minimumBalance: z.number().int().min(0).optional(),
  monthlySavingsTarget: z.number().int().min(0).optional(),
  emergencyFundTarget: z.number().int().min(1).optional(),
  autoSaveActive: z.boolean().optional(),
  pausedToday: z.boolean().optional(),
  skipToday: z.boolean().optional(),
  maxMonthlyCap: z.number().int().min(0).optional()
});

router.patch('/', validateBody(settingsSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  await prisma.savingsSettings.updateMany({ where: { userId }, data: req.body });
  const settings = await prisma.savingsSettings.findUniqueOrThrow({ where: { userId } });
  res.json(settings);
}));

const actionSchema = z.object({
  action: z.enum(['pause', 'resume', 'skip'])
});

router.post('/action', validateBody(actionSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { action } = req.body;

  const settings = await prisma.savingsSettings.findUniqueOrThrow({ where: { userId } });
  const updates: Record<string, boolean> = { };
  let title = '';
  let reason = '';

  if (action === 'pause') {
    updates.pausedToday = true;
    title = 'Auto-Save Paused for Today';
    reason = 'User manually paused auto-save for today. System will automatically resume tomorrow.';
  } else if (action === 'resume') {
    updates.pausedToday = false;
    updates.skipToday = false;
    title = 'Auto-Save Resumed';
    reason = 'Auto-Save reactivated. Safe saving rules will apply to future payouts.';
  } else {
    updates.skipToday = true;
    title = "Today's Payout Skipped";
    reason = "User requested to skip today's auto-save. It will resume automatically tomorrow.";
  }

  await prisma.$transaction(async (tx) => {
    await tx.savingsSettings.update({ where: { userId }, data: updates });
    await tx.automationLog.create({
      data: {
        userId,
        type: 'SYSTEM_ALERT',
        title,
        amount: 0,
        reason,
        canUndo: false,
        undone: false
      }
    });
  });

  res.json({ ok: true, settings: { ...settings, ...updates } });
}));

export default router;

// Auto-save view needs the ledger + aggregate state; expose via dashboard (gated below)
export const autosaveDashboard = buildDashboard;