# car-auction-starter

Starter monorepo for a car auction platform, made up of independent microservices.

## Services

| Service | Port | Description |
| --- | --- | --- |
| [car-service](car-service/) | 4000 | Express + Prisma/SQLite API. Exposes `GET /cars`, listing cars from a `Car` table. See [car-service/README.md](car-service/README.md). |
| [auth-service](auth-service/) | 4001 | JWT auth API — register/login/me. See [auth-service/README.md](auth-service/README.md). |
| [api-gateway-service](api-gateway-service/) | 3000 | Proxies `/cars` to `car-service` and `/auth` to `auth-service`. See [api-gateway-service/README.md](api-gateway-service/README.md). |

Every service follows the same setup, and is self-contained so it can be taken out of this repo on its own:

- Node.js 24, TypeScript, native ESM (`"type": "module"`, `moduleResolution: NodeNext`), `tsx` for hot reload
- Its own `package.json` + `package-lock.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `.dockerignore` and `Dockerfile`
- The same npm scripts: `dev`, `build`, `start`, `type-check` and `test:api` (plus `prisma:*` for services with a database)
- Services with a database generate their Prisma client into `src/generated/prisma` on `npm install` and keep their SQLite file in `data/`

The repository root only holds this README and the `docker-compose.yml` that runs the services together.

## Getting started

### With Docker Compose

```bash
docker compose up --build
```

The gateway is then available at `http://localhost:3000` — try `GET /cars` or `POST /auth/register`. Databases live in named Docker volumes; `docker compose down -v` removes them. On every start (`SEED_DATABASE` in `docker-compose.yml`), `car-service` is reset to the sample cars and `auth-service` creates the demo users below.

### Locally with npm

Run each service in its own terminal:

```bash
# car-service (port 4000)
cd car-service
cp .env.example .env
npm install            # also generates the Prisma client
npm run prisma:migrate
npm run prisma:seed
npm run dev

# auth-service (port 4001)
cd auth-service
cp .env.example .env
npm install            # also generates the Prisma client
npm run prisma:migrate
npm run prisma:seed    # creates the demo users
npm run dev

# api-gateway-service (port 3000)
cd api-gateway-service
cp .env.example .env
npm install
npm run dev
```

### Demo users

The auth-service seed creates four accounts for local development (see [auth-service/README.md](auth-service/README.md#demo-users)):

| Email | Password | Role |
| --- | --- | --- |
| `buyer@example.com` | `supersecret1` | `BUYER` |
| `buyer2@example.com` | `supersecret1` | `BUYER` |
| `seller@example.com` | `supersecret1` | `SELLER` |
| `staff@example.com` | `supersecret1` | `STAFF` |

```bash
curl -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"buyer@example.com","password":"supersecret1"}'
```

Any other email has to be registered first with `POST /auth/register`.

### Checking the stack

Check everything end to end with `npm run test:api` in `api-gateway-service` (each service also has its own `npm run test:api`).
