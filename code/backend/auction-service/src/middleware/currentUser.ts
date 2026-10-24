import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './errorHandling.js';

export type Role = 'BUYER' | 'SELLER' | 'STAFF';

export interface CurrentUser {
  id: number;
  role: Role;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CurrentUser;
    }
  }
}

/**
 * Reads the user that the API gateway put in the headers after checking the token.
 * The service is only reachable through the gateway, so it can trust these headers.
 */
export const currentUser = (req: Request, _res: Response, next: NextFunction) => {
  const id = Number(req.header('x-user-id'));
  const role = req.header('x-user-role') as Role | undefined;
  if (id && role) {
    req.user = { id, role, name: decodeURIComponent(req.header('x-user-name') ?? '') };
  }
  next();
};

// Use on a route: requireRole('SELLER') or requireRole('SELLER', 'STAFF')
export const requireRole = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new HttpError(401, 'UNAUTHORIZED', 'Please log in first.'));
  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, 'FORBIDDEN_ROLE', 'You are not allowed to do this with your account.'));
  }
  next();
};
