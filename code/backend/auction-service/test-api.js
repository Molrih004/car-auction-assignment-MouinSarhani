#!/usr/bin/env node

/**
 * AUCTION-SERVICE API SMOKE TEST
 *
 * Run first: car-service (port 4000) and this service (npm run dev).
 * Start this service with SCHEDULER_INTERVAL_MS=1000 so the scheduler test doesn't have to wait long,
 * and run the seeds of both services first (npm run prisma:seed).
 * Then run: npm run test:api
 *
 * Targets http://localhost:$PORT (default 4002), or BASE_URL if set.
 */

import 'dotenv/config';

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4002}`;
const CAR_SERVICE = process.env.CAR_SERVICE_URL || 'http://localhost:4000';

// The API gateway normally adds these headers after checking the token. Here the test plays the gateway.
const seller = { 'X-User-Id': '3', 'X-User-Role': 'SELLER' };
const otherSeller = { 'X-User-Id': '99', 'X-User-Role': 'SELLER' };
const buyer = { 'X-User-Id': '1', 'X-User-Role': 'BUYER' };
const buyer2 = { 'X-User-Id': '2', 'X-User-Role': 'BUYER' };
const staff = { 'X-User-Id': '4', 'X-User-Role': 'STAFF' };

const SEEDED_ACTIVE = 'a1111111-1111-4111-8111-111111111111';
const SEEDED_PENDING = 'a3333333-3333-4333-8333-333333333333';
const SEEDED_ENDED = 'a4444444-4444-4444-8444-444444444444';

const ctx = {};
const inSeconds = (s) => new Date(Date.now() + s * 1000).toISOString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(method, path, { body, user, base = BASE } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(user ?? {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const newAuction = () => ({ carId: ctx.carId, startingPrice: 10000, reservePrice: 12000, startAt: inSeconds(2), endAt: inSeconds(6) });

const tests = [
  { name: 'Health check', expect: 200, fn: () => request('GET', '/health') },
  {
    name: 'List auctions', expect: 200,
    fn: () => request('GET', '/auctions'),
    check: (res) => res.data.meta.count === res.data.data.length && res.data.data.length > 0,
  },
  {
    name: 'Filter on status', expect: 200,
    fn: () => request('GET', '/auctions?status=ACTIVE'),
    check: (res) => res.data.data.every((a) => a.status === 'ACTIVE'),
  },
  {
    name: 'A buyer never sees the reserve price', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}`, { user: buyer }),
    check: (res) => !('reservePrice' in res.data.data) && !('reserveReached' in res.data.data) && res.data.data.currentBid === 18000,
  },
  {
    name: 'The seller sees the reserve price and if it is reached', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}`, { user: seller }),
    check: (res) => res.data.data.reservePrice === 20000 && res.data.data.reserveReached === false,
  },
  {
    name: 'Staff sees the reserve price', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}`, { user: staff }),
    check: (res) => res.data.data.reservePrice === 20000,
  },
  { name: 'Auction that does not exist', expect: 404, fn: () => request('GET', '/auctions/does-not-exist') },
  {
    name: 'Make a test car at the car service', expect: 201,
    fn: () => request('POST', '/cars', {
      base: CAR_SERVICE, user: seller,
      body: { make: 'Lancia', model: 'Fulvia', year: 1969, color: 'Blue', mileage: 70000, condition: 'GOOD', price: 18000 },
    }),
    after: (res) => { ctx.carId = res.data?.data?.id; },
  },
  { name: 'Create auction without login', expect: 401, fn: () => request('POST', '/auctions', { body: newAuction() }) },
  { name: 'Create auction as buyer', expect: 403, fn: () => request('POST', '/auctions', { body: newAuction(), user: buyer }) },
  { name: 'Create auction for a car of someone else', expect: 403, fn: () => request('POST', '/auctions', { body: newAuction(), user: otherSeller }) },
  {
    name: 'Reserve price lower than starting price', expect: 400,
    fn: () => request('POST', '/auctions', { body: { ...newAuction(), reservePrice: 5000 }, user: seller }),
  },
  {
    name: 'End before start', expect: 400,
    fn: () => request('POST', '/auctions', { body: { ...newAuction(), endAt: inSeconds(-60) }, user: seller }),
  },
  {
    name: 'Create auction, it starts as pending', expect: 201,
    fn: () => request('POST', '/auctions', { body: newAuction(), user: seller }),
    check: (res) => res.data.data.status === 'PENDING',
    after: (res) => { ctx.auctionId = res.data?.data?.id; },
  },
  { name: 'Second auction for the same car', expect: 409, fn: () => request('POST', '/auctions', { body: newAuction(), user: seller }) },
  {
    name: 'Correct the prices while pending', expect: 200,
    fn: () => request('PATCH', `/auctions/${ctx.auctionId}`, { body: { startingPrice: 11000, reservePrice: 13000 }, user: seller }),
    check: (res) => res.data.data.startingPrice === 11000,
  },
  {
    name: 'Scheduler starts the auction at the start time', expect: 'ACTIVE',
    fn: async () => {
      for (let i = 0; i < 10; i++) {
        const res = await request('GET', `/auctions/${ctx.auctionId}`);
        if (res.data.data.status === 'ACTIVE') return { status: 'ACTIVE', data: res.data };
        await sleep(500);
      }
      return { status: 'still not active', data: null };
    },
  },
  {
    name: 'Can\'t change an active auction', expect: 409,
    fn: () => request('PATCH', `/auctions/${ctx.auctionId}`, { body: { startingPrice: 9000 }, user: seller }),
  },
  {
    name: 'Scheduler ends the auction at the end time', expect: 'ENDED',
    fn: async () => {
      for (let i = 0; i < 16; i++) {
        const res = await request('GET', `/auctions/${ctx.auctionId}`);
        if (res.data.data.status === 'ENDED') return { status: 'ENDED', data: res.data };
        await sleep(500);
      }
      return { status: 'still not ended', data: null };
    },
  },
  { name: 'Can\'t delete an ended auction', expect: 409, fn: () => request('DELETE', `/auctions/${SEEDED_ENDED}`, { user: staff }) },
  { name: 'Another seller can\'t delete it', expect: 403, fn: () => request('DELETE', `/auctions/${SEEDED_PENDING}`, { user: otherSeller }) },
  // BID-01: place a bid (use case 1). The seeded active auction has a current bid of 18000 after a fresh seed.
  { name: 'Bid without login (2a)', expect: 401, fn: () => request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 18500 } }) },
  {
    name: 'Bid as seller (2b)', expect: 403,
    fn: () => request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 18500 }, user: seller }),
    check: (res) => res.data.error.code === 'FORBIDDEN_ROLE',
  },
  { name: 'Bid that is not a whole number (4a)', expect: 400, fn: () => request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 'lots' }, user: buyer }) },
  {
    name: 'Bid on a pending auction (3a)', expect: 409,
    fn: () => request('POST', `/auctions/${SEEDED_PENDING}/bids`, { body: { amount: 50000 }, user: buyer }),
    check: (res) => res.data.error.code === 'AUCTION_NOT_STARTED' && res.data.error.message.startsWith('This auction starts on'),
  },
  {
    name: 'Bid on an ended auction (3b)', expect: 409,
    fn: () => request('POST', `/auctions/${SEEDED_ENDED}/bids`, { body: { amount: 50000 }, user: buyer }),
    check: (res) => res.data.error.code === 'AUCTION_CLOSED',
  },
  {
    name: 'Bid equal to the current bid is too low (4a)', expect: 409,
    fn: () => request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 18000 }, user: buyer }),
    check: (res) => res.data.error.code === 'BID_TOO_LOW' && res.data.error.details.lowestAllowed === 18001,
  },
  {
    name: 'Place a valid bid (5, 6)', expect: 201,
    fn: () => request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 18500 }, user: buyer }),
    check: (res) => res.data.data.isHighest === true && res.data.data.currentBid === 18500 && res.data.data.bid.amount === 18500,
  },
  {
    name: 'The auction shows the new current bid (7)', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}`),
    check: (res) => res.data.data.currentBid === 18500,
  },
  {
    name: 'Two buyers bid the same amount at the same moment, only one wins (5a, BID-07)', expect: '1 accepted, 1 refused',
    fn: async () => {
      const results = await Promise.all([
        request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 19000 }, user: buyer }),
        request('POST', `/auctions/${SEEDED_ACTIVE}/bids`, { body: { amount: 19000 }, user: buyer2 }),
      ]);
      const accepted = results.filter((r) => r.status === 201).length;
      const refused = results.filter((r) => r.status === 409 && r.data.error.details.lowestAllowed === 19001).length;
      return { status: `${accepted} accepted, ${refused} refused`, data: results.map((r) => r.data) };
    },
  },
  // BID-05: bid history without names
  {
    name: 'Bid history for everyone has no buyer', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}/bids`),
    check: (res) => res.data.data.length > 0 && res.data.data.every((b) => !('buyerId' in b) && !('isMine' in b))
      && res.data.data[0].amount > res.data.data[1].amount,
  },
  {
    name: 'A buyer sees which bids are his own', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}/bids`, { user: buyer }),
    check: (res) => res.data.data.some((b) => b.isMine === true) && res.data.data.every((b) => !('buyerId' in b)),
  },
  {
    name: 'Staff sees who placed each bid', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ACTIVE}/bids`, { user: staff }),
    check: (res) => res.data.data.every((b) => typeof b.buyerId === 'number'),
  },
  {
    name: 'History stays after the auction ended (BID-06)', expect: 200,
    fn: () => request('GET', `/auctions/${SEEDED_ENDED}/bids`),
    check: (res) => res.data.meta.count === 15,
  },
  { name: 'History of an auction that does not exist', expect: 404, fn: () => request('GET', '/auctions/nope/bids') },
  { name: 'Clean up the test car', expect: 204, fn: () => request('DELETE', `/cars/${ctx.carId}`, { base: CAR_SERVICE, user: staff }) },
];

async function runTests() {
  console.log('\nAUCTION-SERVICE API SMOKE TEST\n');
  console.log(`Target: ${BASE}\n`);

  let failed = 0;
  for (const test of tests) {
    try {
      const result = await test.fn();
      const ok = result.status === test.expect && (test.check?.(result) ?? true);
      if (!ok) failed++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${test.name} (got ${result.status}, expected ${test.expect})`);
      if (!ok) console.log(`     ${JSON.stringify(result.data)}`);
      test.after?.(result);
    } catch (error) {
      console.log(`\nConnection error: ${error.cause?.code || error.message}`);
      console.log(`Make sure the server is running at ${BASE} (npm run dev) and car-service at ${CAR_SERVICE}\n`);
      process.exit(1);
    }
  }

  console.log(`\n${tests.length - failed}/${tests.length} passed\n`);
  process.exit(failed ? 1 : 0);
}

runTests();
