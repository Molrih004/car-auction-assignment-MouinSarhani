import { api } from './client';
import type { Auction, AuctionStatus, Bid, PlaceBidResult } from './types';

export const getAuctions = (status?: AuctionStatus) =>
  api<{ data: Auction[] }>('GET', `/auctions${status ? `?status=${status}` : ''}`).then((res) => res.data);

export const getAuction = (id: string) => api<{ data: Auction }>('GET', `/auctions/${id}`).then((res) => res.data);

export const getBids = (auctionId: string) => api<{ data: Bid[] }>('GET', `/auctions/${auctionId}/bids`).then((res) => res.data);

// BID-01
export const placeBid = (auctionId: string, amount: number) =>
  api<{ data: PlaceBidResult }>('POST', `/auctions/${auctionId}/bids`, { amount }).then((res) => res.data);

// STF-03
export const changeStatus = (auctionId: string, status: 'PENDING' | 'CANCELLED') =>
  api<{ data: Auction }>('PATCH', `/auctions/${auctionId}/status`, { status }).then((res) => res.data);

// Correct the start and end of a pending auction (for example after staff put it back to pending)
export const updateAuctionTimes = (auctionId: string, startAt: string, endAt: string) =>
  api<{ data: Auction }>('PATCH', `/auctions/${auctionId}`, { startAt, endAt }).then((res) => res.data);
