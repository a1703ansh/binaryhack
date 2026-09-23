import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../lib/auth.js';
import { asyncHandler } from '../lib/errors.js';
import { buildDashboard } from '../services/dashboard.service.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const payload = await buildDashboard((req as AuthedRequest).userId);
  res.json(payload);
}));

export default router;