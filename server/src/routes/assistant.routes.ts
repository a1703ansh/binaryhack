import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { validateBody } from '../lib/validate.js';
import { asyncHandler } from '../lib/errors.js';
import { answerAssistantQuestion } from '../services/llm.service.js';
import { buildDashboard } from '../services/dashboard.service.js';
import type { AssistantContext } from '@earnwise/shared';

const router = Router();
router.use(requireAuth);

const SUGGESTED_CHIPS = [
  "How much can I safely spend this week?",
  "Why did you save ₹150 today?",
  "How much tax have I reserved?",
  "What is my emergency fund status?"
];

const messageSchema = z.object({
  text: z.string().trim().min(1).max(1000)
});

router.post('/', validateBody(messageSchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const text = req.body.text;

  const userMsg = await prisma.chatMessage.create({
    data: { userId, sender: 'user', text }
  });

  const dashboard = await buildDashboard(userId);
  const emergency = dashboard.goals.find((g) => (g as { category: string }).category === 'Emergency') as
    | { currentAmount?: number }
    | undefined;

  const ctx: AssistantContext = {
    userName: dashboard.user.name,
    currentBalance: dashboard.currentBalance,
    minimumBalance: (dashboard.settings as { minimumBalance: number }).minimumBalance,
    savedThisMonth: dashboard.month.saved,
    savingsTarget: (dashboard.settings as { monthlySavingsTarget: number }).monthlySavingsTarget,
    todayIncome: dashboard.todayAction.payoutAmount,
    todaySaved: dashboard.todayAction.recommendedSave,
    taxReserved: dashboard.month.taxReserved,
    investedTotal: dashboard.ledgers.INVESTED ?? 0,
    emergencyFundCurrent: emergency?.currentAmount ?? 10500,
    emergencyFundTarget: (dashboard.settings as { emergencyFundTarget: number }).emergencyFundTarget,
    safeWeeklySpending: dashboard.safeSpending.safeWeeklySpending,
    averageDailyIncome: dashboard.forecast.averageDailyIncome,
    lastSaveReason: dashboard.todayAction.reason,
    isAutoSavePaused: (dashboard.settings as { pausedToday: boolean }).pausedToday
  };

  const replyText = await answerAssistantQuestion(text, ctx);

  const assistantMsg = await prisma.chatMessage.create({
    data: { userId, sender: 'assistant', text: replyText, chips: JSON.stringify(SUGGESTED_CHIPS) }
  });

  res.status(201).json({
    userMessage: { id: userMsg.id },
    reply: {
      id: assistantMsg.id,
      sender: assistantMsg.sender,
      text: assistantMsg.text,
      timestamp: 'Just now',
      chips: SUGGESTED_CHIPS
    }
  });
}));

export default router;