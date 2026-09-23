import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { clearAuthCookie, requireAuth, setAuthCookie, signToken, type AuthedRequest } from '../lib/auth.js';
import { badRequest, unauthorized } from '../lib/errors.js';
import { validateBody } from '../lib/validate.js';
import { createUserWithOnboardData } from '../services/seed.service.js';
import { buildDashboard } from '../services/dashboard.service.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  occupation: z.string().trim().min(2).default('Delivery Partner')
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, occupation } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badRequest('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name, email, passwordHash, occupation }
      });
      await createUserWithOnboardData(tx, created.id);
      return created;
    });

    const token = signToken({ userId: user.id, email: user.email });
    setAuthCookie(res, token);

    res.status(201).json({ ok: true, user: { id: user.id, name: user.name, email: user.email, occupation: user.occupation } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw unauthorized('Invalid email or password');

    const token = signToken({ userId: user.id, email: user.email });
    setAuthCookie(res, token);

    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, occupation: user.occupation } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const dashboard = await buildDashboard((req as AuthedRequest).userId);
    res.json({ user: dashboard.user });
  } catch (err) {
    next(err);
  }
});

export default router;