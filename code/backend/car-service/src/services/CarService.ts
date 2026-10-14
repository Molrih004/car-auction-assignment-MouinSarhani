import { prisma } from '../lib/prisma.js';

export class CarService {
  async getAll() {
    return prisma.car.findMany();
  }
}

export const carService = new CarService();
