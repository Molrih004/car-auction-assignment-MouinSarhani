import type { Auction, AuctionStatus, Condition } from '$lib/api/types';

// Times come from the API in UTC and are always shown in Dutch time (NFR-15)
const TIME_ZONE = 'Europe/Amsterdam';

// "Fri 16 Oct, 20:00"
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE,
  });

// "20:42"
export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE });

// "€ 18.500", the Dutch way of writing amounts
export const euros = (amount: number) => `€\u00a0${amount.toLocaleString('nl-NL')}`;

export const km = (mileage: number) => `${mileage.toLocaleString('nl-NL')} km`;

export const conditionLabel: Record<Condition, string> = { EXCELLENT: 'Excellent', GOOD: 'Good', FAIR: 'Fair' };

// What each condition means (CAR-02: "everyone thinks their own car is excellent")
export const conditionHelp: Record<Condition, string> = {
  EXCELLENT: 'Like new or fully restored, nothing to fix',
  GOOD: 'Well kept, small signs of use, drives without problems',
  FAIR: 'Drives, but needs some work',
};

// "1 h 18 min", or "45 s" in the last minute
export const timeLeft = (endIso: string, now: number) => {
  const ms = new Date(endIso).getTime() - now;
  if (ms <= 0) return 'ended';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${totalSeconds % 60} s`;
  return `${totalSeconds} s`;
};

// BRW-06: in the last 24 hours the page also shows how much time is left
export const endsWithinADay = (endIso: string, now: number) => {
  const ms = new Date(endIso).getTime() - now;
  return ms > 0 && ms <= 24 * 60 * 60 * 1000;
};

/**
 * BRW-05: the status is always a word, never only a colour (Tom is colour-blind).
 * An auction whose end time has passed shows "Closed" straight away, also before the server says ENDED.
 */
export const statusWords = (auction: Auction, now: number): { label: string; kind: 'open' | 'pending' | 'closed' | 'cancelled' } => {
  const effective: AuctionStatus = auction.status === 'ACTIVE' && new Date(auction.endAt).getTime() <= now ? 'ENDED' : auction.status;
  switch (effective) {
    case 'ACTIVE':
      return { label: 'Open', kind: 'open' };
    case 'PENDING':
      return auction.onHold
        ? { label: 'Paused by VeloVault', kind: 'pending' }
        : { label: `Starts ${dateTime(auction.startAt)}`, kind: 'pending' };
    case 'ENDED':
      return { label: `Closed · ended ${dateTime(auction.endAt)}`, kind: 'closed' };
    case 'CANCELLED':
      return { label: 'Cancelled', kind: 'cancelled' };
  }
};

export const isOpen = (auction: Auction, now: number) =>
  auction.status === 'ACTIVE' && new Date(auction.endAt).getTime() > now && new Date(auction.startAt).getTime() <= now;
