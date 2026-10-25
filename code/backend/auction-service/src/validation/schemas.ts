import { z } from 'zod';
import { STATUSES } from '../types/index.js';

const euros = (field: string) => z.number({ invalid_type_error: `Fill in the ${field} in whole euros` })
  .int(`Fill in the ${field} in whole euros`)
  .positive(`The ${field} must be more than 0`);

const dateTime = (field: string) => z.coerce.date({ errorMap: () => ({ message: `Fill in a valid ${field}` }) });

// AUC-03: the end is after the start, and the reserve price is not lower than the starting price
const auctionRules = <T extends z.ZodTypeAny>(schema: T) => schema
  .refine((a: { startAt?: Date; endAt?: Date }) => !a.startAt || !a.endAt || a.endAt > a.startAt, {
    message: 'The end must be after the start.', path: ['endAt'],
  })
  .refine((a: { startingPrice?: number; reservePrice?: number }) =>
    a.startingPrice === undefined || a.reservePrice === undefined || a.reservePrice >= a.startingPrice, {
    message: 'The reserve price can\'t be lower than the starting price.', path: ['reservePrice'],
  });

const auctionFields = z.object({
  startingPrice: euros('starting price'),
  reservePrice: euros('reserve price'),
  startAt: dateTime('start date and time'),
  endAt: dateTime('end date and time'),
});

export const createAuctionSchema = auctionRules(auctionFields.extend({ carId: z.string().uuid('Choose a car') }));

export const updateAuctionSchema = auctionRules(auctionFields.partial());

export const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  carId: z.string().optional(),
});

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;

// Body of POST /auctions/:id/bids (BID-01)
export const placeBidSchema = z.object({
  amount: z.number({ invalid_type_error: 'Fill in an amount in whole euros.', required_error: 'Fill in an amount in whole euros.' })
    .int('Fill in an amount in whole euros.')
    .positive('Fill in an amount in whole euros.'),
});

// Body of PATCH /auctions/:id/status (STF-03). Staff can only choose these two, the scheduler sets ACTIVE and ENDED.
export const statusChangeSchema = z.object({
  status: z.enum(['PENDING', 'CANCELLED'], { errorMap: () => ({ message: 'Choose pending or cancelled.' }) }),
});
