import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandling.js';
import type { CurrentUser } from '../middleware/currentUser.js';
import type { CarFilter, CarInput } from '../validation/schemas.js';

const AUCTION_SERVICE_URL = process.env.AUCTION_SERVICE_URL || 'http://localhost:4002';
// Sandra wants an answer within a couple of seconds (NFR-07)
const AUCTION_CHECK_TIMEOUT_MS = 2000;

const dutchDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' });

export class CarService {
  async getAll(filter: CarFilter) {
    return prisma.car.findMany({
      where: {
        make: filter.make ? { in: filter.make } : undefined,
        year: { gte: filter.yearFrom, lte: filter.yearTo },
        condition: filter.condition ? { in: filter.condition } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) throw new HttpError(404, 'CAR_NOT_FOUND', 'We can\'t find this car.');
    return car;
  }

  async create(input: CarInput, user: CurrentUser) {
    return prisma.car.create({ data: { ...input, sellerId: user.id } });
  }

  async update(id: string, input: CarInput, user: CurrentUser) {
    await this.getOwnCar(id, user);
    return prisma.car.update({ where: { id }, data: input });
  }

  async delete(id: string, user: CurrentUser) {
    await this.getOwnCar(id, user);
    await this.checkNoOpenAuction(id);
    await prisma.car.delete({ where: { id } });
  }

  // A seller can only change their own cars, staff can change every car (ACC-04)
  private async getOwnCar(id: string, user: CurrentUser) {
    const car = await this.getById(id);
    if (user.role !== 'STAFF' && car.sellerId !== user.id) {
      throw new HttpError(403, 'NOT_YOUR_CAR', 'You can only change your own cars.');
    }
    return car;
  }

  /**
   * CAR-06: a car with a pending or active auction can't be deleted, otherwise buyers would bid on a car that is gone.
   * If the auction service doesn't answer in time, the car is NOT deleted (open question 1 in the requirements).
   */
  private async checkNoOpenAuction(carId: string) {
    let auctions: { status: string; endAt: string }[];
    try {
      const response = await fetch(`${AUCTION_SERVICE_URL}/auctions?carId=${carId}`, {
        signal: AbortSignal.timeout(AUCTION_CHECK_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`auction-service answered ${response.status}`);
      auctions = ((await response.json()) as { data: typeof auctions }).data;
    } catch (error) {
      console.warn(`Could not check auctions for car ${carId}:`, error);
      throw new HttpError(503, 'AUCTION_CHECK_FAILED', 'We can\'t check if this car has an auction right now. Please try again in a moment.');
    }

    const open = auctions.find((auction) => auction.status === 'PENDING' || auction.status === 'ACTIVE');
    if (open) {
      throw new HttpError(409, 'CAR_HAS_AUCTION', `This car can't be removed because it has an auction that ends on ${dutchDate(open.endAt)}.`);
    }
  }
}

export const carService = new CarService();
