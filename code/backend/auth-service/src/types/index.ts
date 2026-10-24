export const ROLES = ['BUYER', 'SELLER', 'STAFF'] as const;
export type Role = (typeof ROLES)[number];

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}
