#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Opt-in: SEED_DATABASE=true creates/resets the demo users on every start (other users are kept)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

exec node dist/server.js
