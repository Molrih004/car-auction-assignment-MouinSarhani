import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';

// An error with an HTTP status, a code for the frontend and a message for the user (see products/api-message-design.md)
export class HttpError extends Error {
  // Extra data for the frontend, for example the lowest allowed bid
  details?: Record<string, unknown>;

  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, ...(err.details && { details: err.details }) } });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues[0]?.message ?? 'The request is not correct.' } });
  }
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side. Please try again.' } });
};
