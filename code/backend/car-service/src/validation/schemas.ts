import { z } from 'zod';

export const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR'] as const;

// Body of POST /cars and PUT /cars/:id
export const carSchema = z.object({
  make: z.string().trim().min(1, 'Fill in the make'),
  model: z.string().trim().min(1, 'Fill in the model'),
  year: z.number().int().min(1900, 'Fill in a year from 1900').max(new Date().getFullYear(), 'The year can\'t be in the future'),
  color: z.string().trim().min(1, 'Fill in the colour'),
  mileage: z.number().int().min(0, 'The mileage can\'t be negative'),
  condition: z.enum(CONDITIONS, { errorMap: () => ({ message: 'Choose excellent, good or fair' }) }),
  description: z.string().max(5000, 'The description can be 5000 characters at most').default(''),
  price: z.number().positive('The estimated value must be more than 0'),
});

// Query of GET /cars, for example ?make=Citroën,Peugeot&yearFrom=1960&yearTo=1979&condition=EXCELLENT,GOOD
const list = z.string().transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean));

export const carFilterSchema = z.object({
  make: list.optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  condition: list.pipe(z.array(z.enum(CONDITIONS))).optional(),
});

export type CarInput = z.infer<typeof carSchema>;
export type CarFilter = z.infer<typeof carFilterSchema>;
