import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: number;
  email: string;
  name?: string;
  role: string;
}

// The headers the services read to know who the user is (see products/component-diagram.md)
const USER_HEADERS = ['x-user-id', 'x-user-role', 'x-user-name'];

// Logging in and registering must always work, also when the browser still sends an old token
const PUBLIC_PATHS = ['/auth/login', '/auth/register'];

/**
 * Checks the login token once, here at the entry point, so the services don't have to (NFR-13).
 *
 * - No token: the request goes on without a user. Public routes like GET /cars still work,
 *   and a service answers 401 itself when a route needs a login.
 * - Valid token: the user id, role and name are added as headers for the service.
 * - Expired or wrong token: 401 straight away, the request never reaches a service.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Never trust these headers from outside, otherwise anyone could send "X-User-Role: STAFF"
  USER_HEADERS.forEach((header) => delete req.headers[header]);

  const authHeader = req.headers.authorization;
  if (PUBLIC_PATHS.includes(req.path)) {
    delete req.headers.authorization;
    next();
    return;
  }
  if (!authHeader) {
    next();
    return;
  }

  try {
    if (!authHeader.startsWith('Bearer ')) throw new Error('Not a bearer token');
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET!) as unknown as JwtPayload;
    req.headers['x-user-id'] = String(payload.sub);
    req.headers['x-user-role'] = payload.role;
    // Header values can't hold every character, so the name is URI encoded
    req.headers['x-user-name'] = encodeURIComponent(payload.name ?? '');
    next();
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Your login has expired. Please log in again.' } });
  }
};
