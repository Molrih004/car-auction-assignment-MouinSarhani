import { Router } from 'express';
import { carService } from '../services/index.js';
import { asyncHandler } from '../middleware/errorHandling.js';
import { requireRole } from '../middleware/currentUser.js';
import { carFilterSchema, carSchema } from '../validation/schemas.js';

export const carsRouter = Router();

// Public: everyone can browse, also without an account (BRW-01, BRW-02)
carsRouter.get('/', asyncHandler(async (req, res) => {
  const filter = carFilterSchema.parse(req.query);
  const cars = await carService.getAll(filter);
  res.json({ data: cars, meta: { count: cars.length } });
}));

carsRouter.get('/:id', asyncHandler(async (req, res) => {
  const car = await carService.getById(req.params.id);
  res.json({ data: car });
}));

carsRouter.post('/', requireRole('SELLER'), asyncHandler(async (req, res) => {
  const input = carSchema.parse(req.body);
  const car = await carService.create(input, req.user!);
  res.status(201).json({ data: car });
}));

carsRouter.put('/:id', requireRole('SELLER', 'STAFF'), asyncHandler(async (req, res) => {
  const input = carSchema.parse(req.body);
  const car = await carService.update(req.params.id, input, req.user!);
  res.json({ data: car });
}));

carsRouter.delete('/:id', requireRole('SELLER', 'STAFF'), asyncHandler(async (req, res) => {
  await carService.delete(req.params.id, req.user!);
  res.status(204).end();
}));
