import type { AuctionStatus } from '$lib/api/types';

/**
 * The status changes staff may make, the same table as STAFF_TRANSITIONS in the auction service.
 * The page only shows these as buttons (error prevention). The server checks them again, because
 * the status can change while the page is open (use case 2, path 8a).
 */
export const STAFF_TRANSITIONS: Record<AuctionStatus, ('PENDING' | 'CANCELLED')[]> = {
  PENDING: ['CANCELLED'],
  ACTIVE: ['PENDING', 'CANCELLED'],
  ENDED: [],
  CANCELLED: [],
};

export const statusName: Record<AuctionStatus, string> = {
  PENDING: 'Pending', ACTIVE: 'Active', ENDED: 'Ended', CANCELLED: 'Cancelled',
};

export const actionLabel: Record<'PENDING' | 'CANCELLED', string> = {
  PENDING: 'Back to pending',
  CANCELLED: 'Cancel auction',
};
