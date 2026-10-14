import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./data/database.sqlite',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  await prisma.car.deleteMany();

  await prisma.car.createMany({
    data: [
      { make: 'Volkswagen', model: 'Golf', year: 2019, color: 'Blue', mileage: 42000, price: 16500 },
      { make: 'Toyota', model: 'Corolla', year: 2021, color: 'White', mileage: 18000, price: 21000 },
      { make: 'BMW', model: '3 Series', year: 2018, color: 'Black', mileage: 65000, price: 19500 },
      { make: 'Ford', model: 'Focus', year: 2020, color: 'Red', mileage: 30000, price: 15000 },
      { make: 'Tesla', model: 'Model 3', year: 2022, color: 'Grey', mileage: 12000, price: 34000 },
    ],
  });

  console.log('Database seeded successfully.');
  console.log('Created 5 cars.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
