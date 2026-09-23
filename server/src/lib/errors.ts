import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, message, details);
export const unauthorized = (message = 'Not authenticated') => new AppError(401, message);
export const forbidden = (message = 'Forbidden') => new AppError(403, message);
export const notFound = (message = 'Not found') => new AppError(404, message);

export type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}