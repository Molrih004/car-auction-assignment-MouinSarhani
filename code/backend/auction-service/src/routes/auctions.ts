import { Router } from 'express';
import { auctionService, bidService } from '../services/index.js';
import { asyncHandler } from '../middleware/errorHandling.js';
import { requireRole } from '../middleware/currentUser.js';
import { createAuctionSchema, listQuerySchema, placeBidSchema, updateAuctionSchema } from '../validation/schemas.js';

export const auctionsRouter = Router();

// Public, also without an account (BRW-01). The reserve price is only added for the seller and staff.
auctionsRouter.get('/', asyncHandler(async (req, res) => {
  const filter = listQuerySchema.parse(req.query);
  const auctions = await auctionService.list(filter, req.user);
  res.json({ data: auctions, meta: { count: auctions.length } });
}));

auctionsRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json({ data: await auctionService.get(req.params.id, req.user) });
}));

auctionsRouter.post('/', requireRole('SELLER'), asyncHandler(async (req, res) => {
  const input = createAuctionSchema.parse(req.body);
  res.status(201).json({ data: await auctionService.create(input, req.user!) });
}));

auctionsRouter.patch('/:id', requireRole('SELLER', 'STAFF'), asyncHandler(async (req, res) => {
  const input = updateAuctionSchema.parse(req.body);
  res.json({ data: await auctionService.update(req.params.id, input, req.user!) });
}));

auctionsRouter.delete('/:id', requireRole('SELLER', 'STAFF'), asyncHandler(async (req, res) => {
  await auctionService.delete(req.params.id, req.user!);
  res.status(204).end();
}));

// BID-01: only buyers can bid (ACC-04). The rules are in BidService.
auctionsRouter.post('/:id/bids', requireRole('BUYER'), asyncHandler(async (req, res) => {
  const { amount } = placeBidSchema.parse(req.body);
  res.status(201).json({ data: await bidService.placeBid(req.params.id, amount, req.user!) });
}));
