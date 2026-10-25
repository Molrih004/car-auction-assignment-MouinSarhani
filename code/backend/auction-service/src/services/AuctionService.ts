import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandling.js';
import type { CurrentUser } from '../middleware/currentUser.js';
import type { CreateAuctionInput, UpdateAuctionInput } from '../validation/schemas.js';
import type { AuctionStatus } from '../types/index.js';

const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL || 'http://localhost:4000';
const CAR_CHECK_TIMEOUT_MS = 2000;

// Every read also loads the highest bid and the number of bids, so the answer can show them
export const withBidSummary = {
  bids: { orderBy: { amount: 'desc' as const }, take: 1 },
  _count: { select: { bids: true } },
};

type AuctionWithBids = {
  id: string; carId: string; sellerId: number; startingPrice: number; reservePrice: number;
  startAt: Date; endAt: Date; status: string; onHold: boolean; createdAt: Date; updatedAt: Date;
  bids: { amount: number }[]; _count: { bids: number };
};

// The seller of this auction and staff may see the reserve price, buyers never (AUC-04, AUC-08)
const canSeeReserve = (auction: { sellerId: number }, user?: CurrentUser) =>
  !!user && (user.role === 'STAFF' || user.id === auction.sellerId);

/**
 * Turns a database row into the message that goes out (AuctionSummary / AuctionDetail in products/api-message-design.md).
 * This is the only place that decides what a user may see.
 */
export const toAuctionDto = (auction: AuctionWithBids, user?: CurrentUser) => {
  const currentBid = auction.bids[0]?.amount ?? null;
  return {
    id: auction.id,
    carId: auction.carId,
    sellerId: auction.sellerId,
    status: auction.status as AuctionStatus,
    onHold: auction.onHold,
    startingPrice: auction.startingPrice,
    currentBid,
    bidCount: auction._count.bids,
    startAt: auction.startAt.toISOString(),
    endAt: auction.endAt.toISOString(),
    createdAt: auction.createdAt.toISOString(),
    updatedAt: auction.updatedAt.toISOString(),
    ...(canSeeReserve(auction, user) && {
      reservePrice: auction.reservePrice,
      reserveReached: currentBid !== null && currentBid >= auction.reservePrice,
    }),
  };
};

export class AuctionService {
  async list(filter: { status?: AuctionStatus; carId?: string }, user?: CurrentUser) {
    const auctions = await prisma.auction.findMany({
      where: { status: filter.status, carId: filter.carId },
      include: withBidSummary,
      orderBy: { endAt: 'asc' },
    });
    return auctions.map((auction) => toAuctionDto(auction, user));
  }

  async get(id: string, user?: CurrentUser) {
    return toAuctionDto(await this.find(id), user);
  }

  async find(id: string) {
    const auction = await prisma.auction.findUnique({ where: { id }, include: withBidSummary });
    if (!auction) throw new HttpError(404, 'AUCTION_NOT_FOUND', 'We can\'t find this auction.');
    return auction;
  }

  // AUC-01: a seller creates an auction for their own car. It always starts as PENDING (AUC-04 in the use case).
  async create(input: CreateAuctionInput, user: CurrentUser) {
    await this.checkOwnCar(input.carId, user);

    const open = await prisma.auction.findFirst({ where: { carId: input.carId, status: { in: ['PENDING', 'ACTIVE'] } } });
    if (open) throw new HttpError(409, 'CAR_HAS_AUCTION', 'This car already has an auction that is pending or active.');

    const auction = await prisma.auction.create({
      data: { ...input, sellerId: user.id, status: 'PENDING' },
      include: withBidSummary,
    });
    return toAuctionDto(auction, user);
  }

  // Dates and prices can only be corrected while the auction is pending (for example a wrong end date, interview Sandra)
  async update(id: string, input: UpdateAuctionInput, user: CurrentUser) {
    const auction = await this.findOwn(id, user);
    if (auction.status !== 'PENDING') {
      throw new HttpError(409, 'AUCTION_NOT_PENDING', 'You can only change an auction before it has started.');
    }

    const merged = { ...auction, ...input };
    if (merged.endAt <= merged.startAt) throw new HttpError(400, 'VALIDATION_ERROR', 'The end must be after the start.');
    if (merged.reservePrice < merged.startingPrice) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'The reserve price can\'t be lower than the starting price.');
    }

    const updated = await prisma.auction.update({
      where: { id },
      // A new start time means the auction is no longer on hold, the scheduler may start it again
      data: { ...input, ...(input.startAt && { onHold: false }) },
      include: withBidSummary,
    });
    return toAuctionDto(updated, user);
  }

  // Only a pending auction without bids can be deleted (AUC-09)
  async delete(id: string, user: CurrentUser) {
    const auction = await this.findOwn(id, user);
    if (auction.status !== 'PENDING' || auction._count.bids > 0) {
      throw new HttpError(409, 'AUCTION_NOT_DELETABLE', 'Only an auction that hasn\'t started and has no bids can be deleted.');
    }
    await prisma.auction.delete({ where: { id } });
  }

  private async findOwn(id: string, user: CurrentUser) {
    const auction = await this.find(id);
    if (user.role !== 'STAFF' && auction.sellerId !== user.id) {
      throw new HttpError(403, 'NOT_YOUR_AUCTION', 'You can only change your own auctions.');
    }
    return auction;
  }

  // The car lives in another database, so the car service is asked if it exists and belongs to the seller
  private async checkOwnCar(carId: string, user: CurrentUser) {
    let response: Response;
    try {
      response = await fetch(`${CAR_SERVICE_URL}/cars/${carId}`, { signal: AbortSignal.timeout(CAR_CHECK_TIMEOUT_MS) });
    } catch {
      throw new HttpError(503, 'CAR_CHECK_FAILED', 'We can\'t check your car right now. Please try again in a moment.');
    }
    if (response.status === 404) throw new HttpError(400, 'CAR_NOT_FOUND', 'This car doesn\'t exist.');
    if (!response.ok) throw new HttpError(503, 'CAR_CHECK_FAILED', 'We can\'t check your car right now. Please try again in a moment.');

    const { data: car } = (await response.json()) as { data: { sellerId: number } };
    if (car.sellerId !== user.id) throw new HttpError(403, 'NOT_YOUR_CAR', 'You can only create an auction for your own car.');
  }
}

export const auctionService = new AuctionService();
