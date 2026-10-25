import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandling.js';
import type { CurrentUser } from '../middleware/currentUser.js';
import type { AuctionStatus } from '../types/index.js';
import { auctionService, toAuctionDto, withBidSummary } from './AuctionService.js';

/**
 * STF-03: the status changes staff may make. Same table as in products/system-requirements.md.
 * PENDING -> ACTIVE and ACTIVE -> ENDED are not here: the scheduler does those at the start and end time (AUC-06).
 * ENDED and CANCELLED are final, so they have no changes at all.
 */
export const STAFF_TRANSITIONS: Record<AuctionStatus, AuctionStatus[]> = {
  PENDING: ['CANCELLED'],
  ACTIVE: ['PENDING', 'CANCELLED'],
  ENDED: [],
  CANCELLED: [],
};

const word = (status: string) => status.toLowerCase();

export class StatusService {
  // Use case 2, steps 7 to 10. The role (step 7) is already checked by requireRole('STAFF') on the route.
  async changeStatus(auctionId: string, newStatus: AuctionStatus, user: CurrentUser) {
    const auction = await auctionService.find(auctionId);
    const current = auction.status as AuctionStatus;

    // 8b: the same change twice changes nothing (NFR-11)
    if (current === newStatus) {
      throw new HttpError(409, 'STATUS_UNCHANGED', `This auction is already ${word(current)}.`);
    }
    // 8a: not in the table, for example the auction ended while the page was open
    if (!STAFF_TRANSITIONS[current].includes(newStatus)) {
      throw new HttpError(409, 'STATUS_CHANGE_NOT_ALLOWED', `This auction is ${word(current)} now, so it can't be changed to ${word(newStatus)}.`);
    }

    // Step 9: only update when the status is STILL the one we checked. If the scheduler ended the auction
    // a millisecond ago, count is 0 and nothing changes.
    const { count } = await prisma.auction.updateMany({
      where: { id: auctionId, status: current },
      // Back to pending = on hold: the scheduler leaves it alone until a new start time is set (PATCH /auctions/:id)
      data: { status: newStatus, onHold: newStatus === 'PENDING' },
    });
    if (count === 0) {
      const latest = await auctionService.find(auctionId);
      throw new HttpError(409, 'STATUS_CHANGE_NOT_ALLOWED', `This auction is ${word(latest.status)} now, so it can't be changed to ${word(newStatus)}.`);
    }

    console.log(`Staff ${user.id} changed auction ${auctionId} from ${current} to ${newStatus}`);
    const updated = await prisma.auction.findUniqueOrThrow({ where: { id: auctionId }, include: withBidSummary });
    return toAuctionDto(updated, user);
  }
}

export const statusService = new StatusService();
