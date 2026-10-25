import { prisma } from '../lib/prisma.js';

/**
 * AUC-06: auctions start and end by themselves at their start and end time, also at night when no staff is working.
 * Every few seconds the database is asked which auctions have to change. updateMany only touches rows that are still
 * in the old status, so running it twice (or on two servers) never changes an auction twice (NFR-11).
 */
export const runScheduler = async (now = new Date()) => {
  const started = await prisma.auction.updateMany({
    where: { status: 'PENDING', onHold: false, startAt: { lte: now }, endAt: { gt: now } },
    data: { status: 'ACTIVE' },
  });
  const ended = await prisma.auction.updateMany({
    where: { status: 'ACTIVE', endAt: { lte: now } },
    data: { status: 'ENDED' },
  });
  // A pending auction whose end time has passed without ever starting can't be won anymore
  const missed = await prisma.auction.updateMany({
    where: { status: 'PENDING', onHold: false, endAt: { lte: now } },
    data: { status: 'CANCELLED' },
  });
  if (started.count || ended.count || missed.count) {
    console.log(`Scheduler: ${started.count} started, ${ended.count} ended, ${missed.count} cancelled because they never started`);
  }
};

export const startScheduler = (intervalMs: number) => {
  const tick = () => runScheduler().catch((error) => console.error('Scheduler failed:', error));
  tick();
  return setInterval(tick, intervalMs);
};
