import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./data/database.sqlite',
});
const prisma = new PrismaClient({ adapter });

// The demo seller from the auth seed (seller@example.com, Diane Hoekstra) gets id 3 in a fresh auth database
const SELLER_ID = 3;

// Fixed ids, so the auction-service seed can make auctions for these cars
const cars = [
  {
    id: '11111111-1111-4111-8111-111111111111', make: 'Citroën', model: 'DS 21 Pallas', year: 1969, color: 'Gris Palladium',
    mileage: 112000, condition: 'GOOD', price: 32000,
    description: 'Restored in 2015, hydraulics overhauled in 2022. Invoices of the last 20 years are included.',
  },
  {
    id: '22222222-2222-4222-8222-222222222222', make: 'Porsche', model: '911 T', year: 1973, color: 'Signal Orange',
    mileage: 98000, condition: 'EXCELLENT', price: 68000,
    description: 'Matching numbers, second owner. Full service history.',
  },
  {
    id: '33333333-3333-4333-8333-333333333333', make: 'Peugeot', model: '404 Coupé', year: 1965, color: 'Blanc Grège',
    mileage: 134000, condition: 'GOOD', price: 14000,
    description: 'Pininfarina design. New interior in 2019.',
  },
  {
    id: '44444444-4444-4444-8444-444444444444', make: 'Alfa Romeo', model: 'Giulia Sprint GT', year: 1967, color: 'Rosso Alfa',
    mileage: 121000, condition: 'FAIR', price: 29000,
    description: 'Runs and drives well, some rust on the rear sills.',
  },
  {
    id: '55555555-5555-4555-8555-555555555555', make: 'Citroën', model: 'SM', year: 1972, color: 'Bleu Platine',
    mileage: 87000, condition: 'EXCELLENT', price: 45000,
    description: 'Maserati V6. Engine rebuilt by a specialist in Belgium.',
  },
  {
    id: '66666666-6666-4666-8666-666666666666', make: 'Mercedes-Benz', model: '280 SL Pagode', year: 1970, color: 'Silver',
    mileage: 145000, condition: 'GOOD', price: 85000,
    description: 'Inherited from my father. Hardtop and soft top included.',
  },
].map((car) => ({ ...car, sellerId: SELLER_ID }));

async function main() {
  console.log('Starting database seed...');

  await prisma.car.deleteMany();

  await prisma.car.createMany({ data: cars });

  console.log('Database seeded successfully.');
  console.log(`Created ${cars.length} cars.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
