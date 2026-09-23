import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { prisma } from '../db.js';
import { unauthorized } from './errors.js';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthedRequest extends Request {
  userId: string;
}

const COOKIE_NAME = 'earnwise_token';

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: env.isProd });
}

export function readToken(req: Request): string | null {
  const fromCookie = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);

  return null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = readToken(req);
    if (!token) throw unauthorized();

    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw unauthorized();

    (req as AuthedRequest).userId = user.id;
    next();
  } catch {
    next(unauthorized());
  }
}