import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { dutchDateTime, euros } from '../lib/time.js';
import { HttpError } from '../middleware/errorHandling.js';
import type { CurrentUser } from '../middleware/currentUser.js';
import { auctionService } from './AuctionService.js';

type AuctionForBid = { status: string; startAt: Date; endAt: Date; startingPrice: number; bids: { amount: number }[] };

// BID-02: higher than the current bid, or at least the starting price for the first bid
const lowestAllowed = (auction: AuctionForBid) =>
  auction.bids[0] ? auction.bids[0].amount + 1 : auction.startingPrice;

// BID-03: only an active auction accepts bids. The time is checked too, so a bid one second
// after the end is refused even when the scheduler hasn't marked the auction as ended yet.
const checkOpen = (auction: AuctionForBid, now: Date) => {
  if (auction.status === 'PENDING' || (auction.status === 'ACTIVE' && auction.startAt > now)) {
    throw new HttpError(409, 'AUCTION_NOT_STARTED', `This auction starts on ${dutchDateTime(auction.startAt)}, you can bid from then.`);
  }
  if (auction.status !== 'ACTIVE' || auction.endAt <= now) {
    throw new HttpError(409, 'AUCTION_CLOSED', 'This auction is closed, you can\'t bid anymore.');
  }
};

const tooLow = (lowest: number, someoneWasFaster: boolean) => {
  const error = new HttpError(
    409,
    'BID_TOO_LOW',
    `${someoneWasFaster ? 'Someone placed a higher bid just before you. ' : ''}Your bid has to be at least ${euros(lowest)}.`,
  );
  error.details = { lowestAllowed: lowest };
  return error;
};

export class BidService {
  /**
   * BID-01: a buyer places a bid. Follows the auction service lane of products/activity-diagram-place-bid.md.
   * The role (step 2) is already checked by requireRole('BUYER') on the route.
   */
  async placeBid(auctionId: string, amount: number, user: CurrentUser) {
    const auction = await auctionService.find(auctionId);
    const now = new Date();

    checkOpen(auction, now); // step 3
    const lowest = lowestAllowed(auction);
    if (amount < lowest) throw tooLow(lowest, false); // step 4

    // Step 5: save the bid only if it is STILL the highest. The check and the insert are one SQL statement,
    // and SQLite runs one statement at a time, so two bids at the same moment can never both win (BID-07).
    const bidId = randomUUID();
    const placedAt = now.toISOString().replace('Z', '+00:00'); // same format Prisma uses for SQLite dates
    let inserted = 0;
    try {
      inserted = await prisma.$executeRaw`
        INSERT INTO bids (id, auction_id, buyer_id, amount, placed_at)
        SELECT ${bidId}, ${auctionId}, ${user.id}, ${amount}, ${placedAt}
        WHERE EXISTS (SELECT 1 FROM auctions WHERE id = ${auctionId} AND status = 'ACTIVE')
          AND ${amount} >= COALESCE(
            (SELECT MAX(amount) + 1 FROM bids WHERE auction_id = ${auctionId}),
            (SELECT starting_price FROM auctions WHERE id = ${auctionId})
          )`;
    } catch (error) {
      // The unique (auction_id, amount) index is the last safety net for an equal bid
      console.warn('Bid insert refused by the database:', error);
    }

    if (inserted === 0) {
      // Someone was faster (5a), or the auction closed in the meantime: tell the buyer what changed
      const latest = await auctionService.find(auctionId);
      checkOpen(latest, new Date());
      throw tooLow(lowestAllowed(latest), true);
    }

    const updated = await auctionService.find(auctionId);
    return {
      bid: { id: bidId, amount, placedAt: now.toISOString() },
      isHighest: updated.bids[0]?.amount === amount,
      currentBid: updated.bids[0]?.amount ?? amount,
      bidCount: updated._count.bids,
    };
  }
}

export const bidService = new BidService();
