#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Opt-in: SEED_DATABASE=true replaces all cars with the sample data on every start
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

exec node dist/server.js
