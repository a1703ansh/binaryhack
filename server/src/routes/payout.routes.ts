import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { asyncHandler } from '../lib/errors.js';
import { validateBody } from '../lib/validate.js';
import { processPayout, undoAutoSave } from '../services/ledger.service.js';

const router = Router();
router.use(requireAuth);

const payoutSchema = z.object({
  source: z.string().trim().min(1, 'Source platform is required'),
  amount: z.number().int().positive('Amount must be a positive whole rupee figure')
});

router.post('/process', validateBody(payoutSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { source, amount } = req.body;

  const result = await processPayout(userId, source, amount);
  res.status(201).json({ ok: true, ...result });
}));

const undoSchema = z.object({
  logId: z.string().min(1)
});

router.post('/undo', validateBody(undoSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const result = await undoAutoSave(userId, req.body.logId);
  res.json({ ok: true, ...result });
}));

export default router;