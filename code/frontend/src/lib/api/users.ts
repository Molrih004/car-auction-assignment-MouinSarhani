import { api } from './client';
import type { User } from './types';

// Staff only (STF-01)
export const getUsers = () => api<{ data: User[] }>('GET', '/auth/users').then((res) => res.data);
