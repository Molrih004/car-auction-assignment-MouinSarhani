# Code setup

The VeloVault platform: 4 backend services and a frontend. How it fits together is in [products/component-diagram.md](../products/component-diagram.md).

| Part | Folder | Port | What it does |
| --- | --- | --- | --- |
| Frontend | [frontend/](frontend/) | 8080 (Docker) / 5173 (dev) | SvelteKit app: car list, auction page with bidding, staff screens |
| API gateway | [backend/api-gateway-service/](backend/api-gateway-service/) | 3000 | Only entry point. Checks the login token, routes to the services |
| Auth service | [backend/auth-service/](backend/auth-service/) | 4001 | Register, log in, users |
| Car service | [backend/car-service/](backend/car-service/) | 4000 | Cars CRUD with filters |
| Auction service | [backend/auction-service/](backend/auction-service/) | 4002 | Auctions and bids CRUD, placing a bid (BID-01), changing the status (STF-03), scheduler |

Every service has its own SQLite database (distributed database, CON-01).

## Run everything with Docker

```bash
cd code/backend
docker compose up --build
```

Then open **http://localhost:8080**. On every start the databases are filled with demo data, and the auction times are relative to now, so there is always an auction that ends within a few hours.

## Run it without Docker

Each service in its own terminal (see the README of each service):

```bash
cd code/backend/<service>
cp .env.example .env
npm install
npm run prisma:migrate   # not for the gateway
npm run prisma:seed      # not for the gateway
npm run dev
```

Start the auth service first, then the car service, then the auction service (their seeds use each other's ids), then the gateway. Then the frontend:

```bash
cd code/frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Demo accounts

Password for all: `supersecret1`

| Email | Name | Role |
| --- | --- | --- |
| `buyer@example.com` | Tom Verhoeven | Buyer |
| `buyer2@example.com` | Pieter Janssens | Buyer |
| `seller@example.com` | Diane Hoekstra | Seller |
| `staff@example.com` | Sandra Meijer | Staff |

## Demo of my 2 requirements

**BID-01, place a bid (use case 1)**

1. Open the car list, filter on Citroën, Peugeot, to 1979, Excellent + Good. Open the Citroën DS.
2. Type a bid, press "Log in to place your bid", log in as `buyer@example.com`. You come back and the amount is still there (path 2a).
3. Bid 18000: refused, the lowest allowed bid is shown and the amount stays (4a).
4. Bid 18500: "Your bid is placed. You are now the highest bidder." (step 6), the history shows "(you)".
5. Open the Alfa Romeo Giulia: closed, no bid form, the final price and history stay (3b).

**STF-03, change the status (use case 2)**

1. Log in as `staff@example.com`, you land on the staff search. Search "porsche" or "hoekstra".
2. Manage the Porsche 911 T: only "Back to pending" and "Cancel auction" are shown (allowed from Active).
3. Press "Cancel auction": the dialog shows car, seller, end date and bids. Focus is on "No, go back".
4. Confirm: "The status of Porsche 911 T, 1973 is now Cancelled." Cancelled is final, no buttons anymore.

## Code quality

```bash
cd code
./check.sh
```

Runs ESLint (recommended JavaScript, TypeScript and Svelte rules) and the TypeScript check (svelte-check for the frontend) in every service and the frontend, and builds the frontend. Every service also has an API smoke test (`npm run test:api`) that tests the routes, the roles and the exception paths of the use cases against the running service. The auction service test also tests 2 bids at the same moment.
