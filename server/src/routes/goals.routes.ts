import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { notFound } from '../lib/errors.js';
import { asyncHandler } from '../lib/errors.js';
import { validateBody } from '../lib/validate.js';

const router = Router();
router.use(requireAuth);

const goalSchema = z.object({
  name: z.string().trim().min(2),
  targetAmount: z.number().int().positive(),
  currentAmount: z.number().int().min(0).default(0),
  deadline: z.string().trim().optional().default(''),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  category: z.enum(['Emergency', 'Vehicle', 'Festival', 'Family', 'General']).default('General'),
  icon: z.string().default('Target')
});

router.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  res.json(await prisma.savingsGoal.findMany({ where: { userId } }));
}));

router.post('/', validateBody(goalSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const goal = await prisma.savingsGoal.create({ data: { userId, ...req.body } });
  res.status(201).json(goal);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = req.params as { id: string };
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) throw notFound('Goal not found');
  await prisma.savingsGoal.delete({ where: { id } });
  res.json({ ok: true });
}));

export default router;