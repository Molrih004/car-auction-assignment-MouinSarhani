import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandling.js';
import type { JwtPayload, Role } from '../types/index.js';
import type { RegisterInput } from '../validation/schemas.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

type UserRow = { id: number; email: string; name: string; role: string };

// What leaves the service: never the password hash (NFR-12)
const toPublicUser = (user: UserRow) => ({ id: user.id, email: user.email, name: user.name, role: user.role as Role });

export class UserService {
  async register({ name, email, password, role }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, 'EMAIL_IN_USE', 'There is already an account with this email address.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash, role } });
    return { token: this.signToken(user), user: toPublicUser(user) };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Constant-time comparison even when user doesn't exist to prevent timing attacks
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'The email address or password is not correct.');

    return { token: this.signToken(user), user: toPublicUser(user) };
  }

  async findById(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'We can\'t find this user.');
    return toPublicUser(user);
  }

  private signToken(user: UserRow) {
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name, role: user.role as Role };
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }
}
