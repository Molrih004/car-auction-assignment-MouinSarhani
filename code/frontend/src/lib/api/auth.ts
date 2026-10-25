import { api } from './client';
import type { User } from './types';

export const login = (email: string, password: string) =>
  api<{ token: string; user: User }>('POST', '/auth/login', { email, password });
