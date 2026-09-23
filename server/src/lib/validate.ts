import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { badRequest } from './errors.js';

export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(badRequest('Invalid request body', result.error.flatten().fieldErrors));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(badRequest('Invalid query parameters', result.error.flatten().fieldErrors));
    }
    req.query = result.data as never;
    next();
  };
}

export const rupee = z.number().int().min(0).max(10_000_000);