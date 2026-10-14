import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./data/database.sqlite',
});
const prisma = new PrismaClient({ adapter });

// Demo accounts for local development only — never use these credentials in production
const DEMO_PASSWORD = 'supersecret1';
const demoUsers = [
  { email: 'student@example.com', role: 'USER' },
  { email: 'admin@example.com', role: 'ADMIN' },
];

async function main() {
  console.log('Starting database seed...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Upsert instead of deleting: users who registered themselves are kept,
  // and the demo accounts are reset to their known password and role.
  for (const { email, role } of demoUsers) {
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role },
      create: { email, passwordHash, role },
    });
  }

  console.log('Database seeded successfully.');
  console.log(`Demo users (password "${DEMO_PASSWORD}"): ${demoUsers.map((u) => `${u.email} (${u.role})`).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
