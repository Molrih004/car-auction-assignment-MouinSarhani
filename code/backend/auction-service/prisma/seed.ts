import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./data/database.sqlite',
});
const prisma = new PrismaClient({ adapter });

// Ids from the other seeds: users from auth-service, cars from car-service
const SELLER = 3; // Diane Hoekstra
const BUYERS = [1, 2]; // Tom Verhoeven, Pieter Janssens
const CAR = {
  ds: '11111111-1111-4111-8111-111111111111',
  porsche: '22222222-2222-4222-8222-222222222222',
  peugeot: '33333333-3333-4333-8333-333333333333',
  giulia: '44444444-4444-4444-8444-444444444444',
  sm: '55555555-5555-4555-8555-555555555555',
  pagode: '66666666-6666-4666-8666-666666666666',
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Times are relative to now, so the demo always has an auction that ends soon, one that hasn't started and one that ended
const at = (offsetMs: number) => new Date(Math.round((Date.now() + offsetMs) / 60000) * 60000);

// Bids from the starting price up, every bid higher than the one before, buyers taking turns.
// The last (highest) bid is always from the second buyer, so in the demo Tom has to bid to become the highest.
const bidsFor = (from: number, step: number, count: number, firstAt: number, lastAt: number) =>
  Array.from({ length: count }, (_, i) => ({
    amount: from + i * step,
    buyerId: BUYERS[(count - i) % BUYERS.length],
    placedAt: at(firstAt + ((lastAt - firstAt) * i) / Math.max(count - 1, 1)),
  }));

const auctions = [
  {
    id: 'a1111111-1111-4111-8111-111111111111', carId: CAR.ds, startingPrice: 15000, reservePrice: 20000,
    startAt: at(-3 * DAY), endAt: at(3 * HOUR), status: 'ACTIVE',
    bids: bidsFor(15000, 500, 7, -3 * DAY + HOUR, -2 * HOUR),
  },
  {
    id: 'a2222222-2222-4222-8222-222222222222', carId: CAR.porsche, startingPrice: 45000, reservePrice: 60000,
    startAt: at(-2 * DAY), endAt: at(4 * DAY), status: 'ACTIVE',
    bids: bidsFor(46500, 1500, 6, -2 * DAY + HOUR, -5 * HOUR),
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333', carId: CAR.peugeot, startingPrice: 12500, reservePrice: 14000,
    startAt: at(DAY), endAt: at(8 * DAY), status: 'PENDING', bids: [],
  },
  {
    id: 'a4444444-4444-4444-8444-444444444444', carId: CAR.giulia, startingPrice: 20000, reservePrice: 25000,
    startAt: at(-17 * DAY), endAt: at(-7 * DAY), status: 'ENDED',
    bids: bidsFor(20000, 500, 15, -16 * DAY, -7 * DAY - 2 * 60000),
  },
  {
    id: 'a5555555-5555-4555-8555-555555555555', carId: CAR.sm, startingPrice: 38000, reservePrice: 42000,
    startAt: at(-DAY), endAt: at(5 * DAY), status: 'ACTIVE', bids: [],
  },
  {
    id: 'a6666666-6666-4666-8666-666666666666', carId: CAR.pagode, startingPrice: 70000, reservePrice: 80000,
    startAt: at(2 * DAY), endAt: at(12 * DAY), status: 'PENDING', bids: [],
  },
];

async function main() {
  console.log('Starting database seed...');

  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();

  for (const { bids, ...auction } of auctions) {
    await prisma.auction.create({ data: { ...auction, sellerId: SELLER, bids: { create: bids } } });
  }

  const bidCount = auctions.reduce((sum, auction) => sum + auction.bids.length, 0);
  console.log('Database seeded successfully.');
  console.log(`Created ${auctions.length} auctions with ${bidCount} bids.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
