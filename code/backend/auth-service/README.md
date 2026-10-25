# auth-service

A JWT-based authentication microservice — registration, login, and token verification. Built on Node.js, Express, Prisma 7, and TypeScript with a SQLite database. It doesn't hold any domain data (cars, auctions, bids); it only knows about `User` accounts and issuing/verifying JWTs.

> Part of the car-auction-starter. Clients reach this service through the [api-gateway-service](../api-gateway-service), which proxies `/auth/*` here. The service is self-contained and also runs on its own.

## Quick Start

### Prerequisites

- Node.js 24
- npm

### Installation

```bash
# Create your local environment file
cp .env.example .env

# Installs dependencies and generates the Prisma client (postinstall)
npm install

# Create the database and run migrations
npm run prisma:migrate

# Create the demo users
npm run prisma:seed

npm run dev
```

The API will be available at `http://localhost:4001`.

### Demo users

`npm run prisma:seed` creates four accounts you can log in with straight away. They are named after the personas from the interviews:

| Email | Password | Name | Role |
| --- | --- | --- | --- |
| `buyer@example.com` | `supersecret1` | Tom Verhoeven | `BUYER` |
| `buyer2@example.com` | `supersecret1` | Pieter Janssens | `BUYER` |
| `seller@example.com` | `supersecret1` | Diane Hoekstra | `SELLER` |
| `staff@example.com` | `supersecret1` | Sandra Meijer | `STAFF` |

The seed only creates or resets these accounts (to the password and role above); users who registered themselves are kept. Any other email has to be registered first with `POST /auth/register`. These credentials are for local development only.

### Build for Production

```bash
npm run build
npm start
```

### Docker

`.env` is not baked into the image (it is listed in `.dockerignore`), so all environment variables must be passed in at `docker run` time. The final image only contains the compiled `dist/`, the generated Prisma client (for the seed script), production `node_modules` (plus the `prisma` and `tsx` CLIs), `prisma/`, `prisma.config.ts`, and `entrypoint.sh`. The image pre-creates `/data` for a mounted SQLite file:

```bash
docker build -t auth-service .
docker run -p 4001:4001 \
  -e DATABASE_URL=file:/data/database.sqlite \
  -e JWT_SECRET=change-me \
  -e SEED_DATABASE=true \
  -v $(pwd)/data:/data \
  auth-service
```

`entrypoint.sh` runs `prisma migrate deploy` before starting the compiled server, so migrations apply automatically on container start. With `SEED_DATABASE=true` it also runs the seed script, so the [demo users](#demo-users) exist; other users are kept.

---

## Domain Model

```mermaid
erDiagram
    USER {
        int    id
        string email
        string name
        string password_hash
        string role  "BUYER | SELLER | STAFF"
        timestamp created_at
        timestamp updated_at
    }
```

Passwords are never stored in plain text — only a bcrypt hash (`password_hash`).

---

## Project Structure

```text
src/
├── server.ts               # App setup: middleware, route mounting, error handler
├── generated/
│   └── prisma/             # Generated Prisma client (git-ignored, do not edit)
├── lib/
│   └── prisma.ts           # Shared Prisma client (SQLite adapter)
├── middleware/
│   ├── authenticate.ts     # Verifies the Bearer JWT, attaches req.user
│   └── errorHandling.ts    # HttpError, asyncHandler wrapper, central error handler
├── routes/
│   └── auth.ts             # POST /register, POST /login, GET /me
├── services/
│   └── UserService.ts      # register / login / findById + JWT signing
├── types/
│   └── index.ts            # JwtPayload, Role
└── validation/
    └── schemas.ts          # Zod schemas for register/login bodies

prisma/
├── schema.prisma           # Prisma data model (User)
├── seed.ts                 # Creates/resets the demo users
└── migrations/

data/                       # Local SQLite database (git-ignored, only .gitkeep is committed)

prisma.config.ts            # Prisma 7 configuration
tsconfig.json               # TypeScript config (ESM, NodeNext, src/ → dist/)
.env.example                # Template for your local .env
.gitignore / .dockerignore  # Keep .env, data, dist and src/generated out of git and the image
Dockerfile                  # Multi-stage Debian-slim build for the production image
entrypoint.sh               # Runs pending migrations (and optionally the seed), then starts the server
test-api.js                 # API smoke test (npm run test:api)
```

The Prisma client is generated into `src/generated/prisma` (configured via `output` in `schema.prisma`). It is recreated on every `npm install` and is not committed, so run `npm run prisma:generate` after changing the schema.

---

## API Reference

Base URL: `http://localhost:4001` (or `http://localhost:3000` through the gateway)

### Auth

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create a user, returns a JWT |
| POST | `/auth/login` | No | Verify credentials, returns a JWT |
| GET | `/auth/me` | Yes (`Authorization: Bearer <token>`) | Returns the authenticated user |
| GET | `/auth/users` | Yes, staff only | All users with name, email, role and registration date (STF-01) |

**`POST /auth/register` request body** (use an email that doesn't exist yet). The role is `BUYER` or `SELLER`, a `STAFF` account can't be made by registering:

```json
{ "name": "Tom Verhoeven", "email": "tom@example.com", "password": "supersecret1", "role": "BUYER" }
```

**`POST /auth/login` request body** (the seeded users can log in right away):

```json
{ "email": "buyer@example.com", "password": "supersecret1" }
```

**Response (both routes):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "buyer@example.com", "name": "Tom Verhoeven", "role": "BUYER" }
}
```

The token holds `sub` (user id), `email`, `name` and `role`, and is valid for 7 days. Errors look like `{ "error": { "code": "EMAIL_IN_USE", "message": "..." } }`, the message can be shown to the user.

`register` returns `409` if the email is already taken. `login` returns `401` for a wrong email or password — the same error either way, so the response doesn't reveal whether an account exists.

**`GET /auth/me` response:**

```json
{ "data": { "id": 1, "email": "buyer@example.com", "name": "Tom Verhoeven", "role": "BUYER" } }
```

Returns `401` if the `Authorization` header is missing, malformed, or the token is invalid/expired.

### Health

```http
GET /health
→ { "status": "ok", "service": "auth-service", "environment": "development" }
```

---

## Error Responses

All errors return `{ "error": "<message>" }`.

| Status | Cause |
| --- | --- |
| 400 | Request body failed Zod validation (e.g. password under 8 characters) |
| 401 | Invalid credentials, or missing/invalid/expired JWT |
| 404 | User not found (`/auth/me` for a deleted user) |
| 409 | Email already registered |
| 500 | Server or database error |

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed. `.env` is git-ignored; never commit real secrets.

```env
# Database
DATABASE_URL="file:./data/database.sqlite"

# Server
PORT=4001
NODE_ENV=development

# JWT
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d
```

In Docker, `SEED_DATABASE=true` additionally creates the demo users on start (see [Docker](#docker)).

`JWT_SECRET` must be overridden with a real secret outside local development — the token is only as safe as this value.

---

## Dependencies

### Production

- **express** — web framework
- **@prisma/client** (v7) — database ORM
- **@prisma/adapter-better-sqlite3** — SQLite driver for Prisma 7
- **better-sqlite3** — SQLite native driver
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT signing and verification
- **zod** — runtime validation
- **cors** — CORS middleware
- **dotenv** — environment variable loading

### Development

- **prisma** (v7) — CLI for migrations and codegen
- **typescript** — TypeScript compiler
- **tsx** — TypeScript/ESM runner with watch mode, used for `npm run dev`

This service uses native ESM (`"type": "module"` + `moduleResolution: NodeNext`), like every service in the car-auction-starter. That's why it uses `tsx` for hot reload instead of `ts-node-dev` (which doesn't reliably support ESM).

---

## Available Scripts

```bash
npm run dev               # Start dev server with hot reload (tsx watch)
npm run build             # Compile TypeScript
npm start                 # Run compiled build

npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Create/reset the demo users
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:studio    # Open Prisma Studio GUI
npm run type-check       # TypeScript check without building
npm run test:api         # Smoke-test the API against a running server
```

---

## Security Notes

- Passwords hashed with bcrypt (cost factor 10) before storage — plain-text passwords never touch the database
- `login` runs the bcrypt comparison even when the user doesn't exist, so response timing doesn't leak whether an email is registered
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN` (default 7 days)
- Input validated with Zod before reaching the database
- Prisma uses parameterized queries (SQL injection safe)
- CORS enabled — restrict origins before deploying to production

---

## License

MIT
