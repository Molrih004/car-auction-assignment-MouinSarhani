import { Router } from 'express';
import { carService } from '../services/index.js';
import { asyncHandler } from '../middleware/errorHandling.js';

export const carsRouter = Router();

carsRouter.get('/', asyncHandler(async (_req, res) => {
  const cars = await carService.getAll();
  res.json({ data: cars, meta: { count: cars.length } });
}));
