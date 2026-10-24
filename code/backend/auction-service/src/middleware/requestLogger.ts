import type { Request, Response, NextFunction } from 'express';

// Logs every request with its status and how long it took, so slow or failing services show up in the logs
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)`);
  });
  next();
};
