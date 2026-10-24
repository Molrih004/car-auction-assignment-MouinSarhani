export const STATUSES = ['PENDING', 'ACTIVE', 'ENDED', 'CANCELLED'] as const;
export type AuctionStatus = (typeof STATUSES)[number];
