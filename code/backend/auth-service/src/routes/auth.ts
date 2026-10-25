import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandling.js';
import { authenticate } from '../middleware/authenticate.js';
import { UserService } from '../services/UserService.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';

const router = Router();
const userService = new UserService();

router.post('/register', asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await userService.register(input);
  res.status(201).json(result);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await userService.login(email, password);
  res.json(result);
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await userService.findById(req.user!.sub);
  res.json({ data: user });
}));

// Only staff can see all users (STF-01). The token is checked by authenticate, the role here.
router.get('/users', authenticate, asyncHandler(async (req, res) => {
  if (req.user!.role !== 'STAFF') {
    res.status(403).json({ error: { code: 'FORBIDDEN_ROLE', message: 'Only staff can see all users.' } });
    return;
  }
  const users = await userService.listAll();
  res.json({ data: users, meta: { count: users.length } });
}));

export { router as authRouter };
