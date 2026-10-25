import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const unauthorized = (res: Response) =>
  res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Your login has expired. Please log in again.' } });

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    unauthorized(res);
    return;
  }

  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
    next();
  } catch {
    unauthorized(res);
  }
};
