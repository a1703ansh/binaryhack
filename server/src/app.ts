import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from './env.js';
import { AppError } from './lib/errors.js';
import { uploadsDir } from './lib/upload.js';

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import incomeRoutes from './routes/income.routes.js';
import payoutRoutes from './routes/payout.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import investRoutes from './routes/invest.routes.js';
import taxRoutes from './routes/tax.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import autosaveRoutes from './routes/autosave.routes.js';
import logsRoutes from './routes/logs.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import demoRoutes from './routes/demo.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);

const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'earnwise-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/autosave', autosaveRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/demo', demoRoutes);

// SPA static + fallback (production: serve built client dist from the monorepo root)
const clientDist = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(resolve(clientDist, 'index.html'));
  });
}

app.use((_req, _res, next) => next(new AppError(404, 'Not found')));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof AppError ? err.status : 500;
  const message = err instanceof AppError ? err.message : (err as Error)?.message ?? 'Internal server error';

  if (status >= 500) console.error('[error]', err);

  res.status(status).json({
    error: message,
    details: err instanceof AppError ? err.details : undefined
  });
});