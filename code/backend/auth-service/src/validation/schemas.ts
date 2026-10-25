import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Fill in your name'),
  email: z.string().email('Fill in a valid email address'),
  password: z.string().min(8, 'Your password needs at least 8 characters'),
  // STAFF accounts are made by VeloVault, not by registering (ACC-03)
  role: z.enum(['BUYER', 'SELLER'], { errorMap: () => ({ message: 'Choose buyer or seller' }) }),
});

export const loginSchema = z.object({
  email: z.string().email('Fill in a valid email address'),
  password: z.string().min(1, 'Fill in your password'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
