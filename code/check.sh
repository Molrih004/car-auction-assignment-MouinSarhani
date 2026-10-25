#!/bin/sh
# Runs the code quality checks of every part: ESLint and the TypeScript check (and the frontend build).
# Run it before opening a pull request: ./check.sh
set -e
cd "$(dirname "$0")"

for service in auth-service car-service auction-service api-gateway-service; do
  echo "== backend/$service"
  (cd "backend/$service" && npm run --silent lint && npm run --silent type-check)
done

echo "== frontend"
(cd frontend && npm run --silent lint && npm run --silent check > /dev/null && npm run --silent build > /dev/null)

echo "All checks passed."
