// The messages from products/api-message-design.md, as TypeScript types

export type Role = 'BUYER' | 'SELLER' | 'STAFF';
export type AuctionStatus = 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type Condition = 'EXCELLENT' | 'GOOD' | 'FAIR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Car {
  id: string;
  sellerId: number;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  condition: Condition;
  description: string;
  price: number;
}

export interface Auction {
  id: string;
  carId: string;
  sellerId: number;
  status: AuctionStatus;
  onHold: boolean;
  startingPrice: number;
  currentBid: number | null;
  bidCount: number;
  startAt: string;
  endAt: string;
  // Only for the seller of the auction and staff
  reservePrice?: number;
  reserveReached?: boolean;
}

export interface Bid {
  id: string;
  amount: number;
  placedAt: string;
  // Only for the logged in buyer
  isMine?: boolean;
  // Only for staff
  buyerId?: number;
}

export interface PlaceBidResult {
  bid: Bid;
  isHighest: boolean;
  currentBid: number;
  bidCount: number;
}

// A car together with its auction, what the car list shows
export interface Listing {
  car: Car;
  auction: Auction;
}
