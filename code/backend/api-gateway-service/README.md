# api-gateway-service

A single entry point that proxies incoming HTTP traffic to the backend services in this repo. It does not hold any data or state of its own — it's a thin routing layer built on Express and [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).

> Part of the car-auction-starter. The service is self-contained: it only needs the URLs of the services it proxies to.

## Quick Start

### Prerequisites

- Node.js 24 (current LTS)
- npm
- `car-service` running locally (see `../car-service/README.md`)
- `auth-service` running locally (see `../auth-service/README.md`) — required for `/auth`

### Installation

```bash
# Create your local environment file
cp .env.example .env

npm install
npm run dev
```

The gateway will be available at <http://localhost:3000>.

### Build for Production

```bash
npm run build
npm start
```

### Docker

The `Dockerfile` is a multi-stage build on `node:24-bookworm-slim` (the same base as `car-service` and `auth-service`); the final image only contains the compiled `dist/` and production `node_modules`. `.env` is excluded from the image (see `.dockerignore`), so pass it in at runtime:

```bash
docker build -t api-gateway-service .
docker run -p 3000:3000 --env-file .env api-gateway-service
```

Inside a container, `localhost` refers to the container itself, not your machine. If `car-service` and `auth-service` run on your host, override the upstream URLs with `host.docker.internal`:

```bash
docker run -p 3000:3000 --env-file .env \
  -e CAR_SERVICE_URL=http://host.docker.internal:4000 \
  -e AUTH_SERVICE_URL=http://host.docker.internal:4001 \
  api-gateway-service
```

To run the gateway together with both services, use the `docker-compose.yml` in the repository root instead.

---

## Project Structure

```text
src/
├── server.ts               # Loads .env, mounts the proxies, /health and the 404 handler
├── middleware/
│   ├── authenticate.ts     # Checks the JWT and adds X-User-Id / X-User-Role / X-User-Name
│   ├── requestLogger.ts    # Logs method, path, status and time of every request
│   └── errorHandling.ts    # asyncHandler wrapper + central error handler
├── routes/
│   ├── serviceProxy.ts     # One proxy setup for every service (body forwarding + 502 when down)
│   ├── auth.ts             # /auth → auth-service
│   ├── cars.ts             # /cars → car-service
│   └── auctions.ts         # /auctions → auction-service
└── validation/
    └── schemas.ts          # Placeholder for gateway-level request validation

tsconfig.json               # TypeScript config (ESM, NodeNext, src/ → dist/)
.env.example                # Template for your local .env
.gitignore / .dockerignore  # Keep .env, node_modules and dist out of git and the image
Dockerfile                  # Multi-stage Debian-slim build for the production image
test-api.js                 # Smoke test through the gateway (npm run test:api)
```

This service uses native ESM, so relative imports end in `.js` (TypeScript resolves `./routes/cars.js` to `cars.ts`).

---

## Routing

| Path | Proxied to | Auth required |
| --- | --- | --- |
| `/auth` | `auth-service` (`AUTH_SERVICE_URL`) | No — must stay reachable so anyone can register/log in |
| `/cars` | `car-service` (`CAR_SERVICE_URL`) | Reading no, writing yes (the service checks the role) |
| `/auctions` | `auction-service` (`AUCTION_SERVICE_URL`) | Reading no, writing yes (the service checks the role) |
| `/health` | handled locally, reports gateway status and configured upstreams | No |

Requests to any other path receive a `404`. A path only matches when it is the prefix itself or continues with `/` or `?`, so `/carsxyz` is not sent to the car service.

When a service is down, the gateway answers `502` with `{ "error": { "code": "SERVICE_UNAVAILABLE", "message": "..." } }`, so the frontend can show a normal message instead of a blank page (NFR-10).

This is a pass-through proxy — it doesn't re-implement each route, it just forwards matching paths (any method) to the upstream service and streams back its response, including error responses. Each upstream service is the source of truth for its own request validation and business logic.

Because `express.json()` runs before the proxy (so `/health` and other local routes can read a JSON body), request bodies are already parsed by the time they reach the proxy. The proxy re-serializes them via `http-proxy-middleware`'s `fixRequestBody` (wired into `on.proxyReq`) — without it, write requests forwarded through the gateway would hang waiting for a body that was already consumed. This is set once in `src/routes/serviceProxy.ts`, which every route file uses.

See `src/routes/serviceProxy.ts` for the proxy setup and `src/server.ts` for how they're mounted.

---

## Authentication

`auth-service` issues the JWTs (`POST /auth/register`, `POST /auth/login`). The gateway checks them in `src/middleware/authenticate.ts`, with the same `JWT_SECRET`, so it doesn't have to call `auth-service` on every request (NFR-13):

| Request | What the gateway does |
| --- | --- |
| No `Authorization` header | Forwards it without a user. Public routes (GET cars, GET auctions) work, write routes get `401` from the service |
| Valid token | Adds `X-User-Id`, `X-User-Role` and `X-User-Name` (URI encoded) and forwards it |
| Expired or wrong token | Answers `401 UNAUTHORIZED` itself, the request never reaches a service |
| `/auth/login` or `/auth/register` | Always forwarded without the token, so an old token in the browser never blocks logging in |

`X-User-*` headers sent by the client are always removed first, so nobody can pretend to be staff by sending `X-User-Role: STAFF`. The services trust these headers because they are only reachable through the gateway.

---

## Environment Variables

Configuration is read from a `.env` file in the service folder, loaded via `import 'dotenv/config'` as the very first import in `src/server.ts` — the route modules read the upstream URLs when they are imported, so `.env` must be loaded before them. `.env` is git-ignored, so each developer keeps their own copy. Create it from the committed template:

```bash
cp .env.example .env
```

`.env.example` contains:

```env
# Server
PORT=3000
NODE_ENV=development

# Same secret as the auth service, the gateway checks the tokens
JWT_SECRET=dev-secret-change-in-production

# Downstream services
CAR_SERVICE_URL=http://localhost:4000
AUTH_SERVICE_URL=http://localhost:4001
AUCTION_SERVICE_URL=http://localhost:4002
```

| Variable | Description | Default if unset |
| --- | --- | --- |
| `PORT` | Port the gateway listens on | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `CAR_SERVICE_URL` | Base URL of `car-service` | `http://localhost:4000` |
| `AUTH_SERVICE_URL` | Base URL of `auth-service` | `http://localhost:4001` |
| `AUCTION_SERVICE_URL` | Base URL of `auction-service` | `http://localhost:4002` |
| `JWT_SECRET` | Secret to check the tokens, must be the same as in `auth-service` | none, required |

When you add a new variable, add it to `.env.example` too (with a safe placeholder value, never a real secret) so others know it exists.

---

## Dependencies

### Production

- **express** — web framework
- **http-proxy-middleware** — request proxying
- **cors** — CORS middleware
- **jsonwebtoken** — checks the login tokens
- **dotenv** — loads `.env`

### Development

- **typescript** — TypeScript compiler
- **tsx** — TypeScript/ESM runner with watch mode, used for `npm run dev`

This service uses native ESM (`"type": "module"` + `moduleResolution: NodeNext`), like every service in the car-auction-starter.

---

## Available Scripts

```bash
npm run dev           # Start dev server with hot reload (tsx watch)
npm run build         # Compile TypeScript
npm start             # Run compiled build
npm run type-check    # TypeScript check without building
npm run test:api      # Smoke-test the gateway (car-service and auth-service must be running; EXPECT_AUCTIONS=200 when auction-service runs too)
```

---

## License

MIT
