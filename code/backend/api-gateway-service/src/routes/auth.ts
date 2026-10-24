import { serviceProxy } from './serviceProxy.js';

export const AUTH_PATHS = ['/auth'];

export const authProxy = serviceProxy('auth-service', process.env.AUTH_SERVICE_URL || 'http://localhost:4001', AUTH_PATHS);
