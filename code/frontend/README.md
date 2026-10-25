# VeloVault frontend

SvelteKit (Svelte 5) + TypeScript + Vite, built as a static app with `@sveltejs/adapter-static`. The pages run in the browser and get their data from the API gateway with `fetch` (`PUBLIC_API_URL`, default `http://localhost:3000`). The screens follow `products/wireflow.md` and `products/hi-fi-prototype.md`.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

The backend has to run too (see `code/backend/README.md`).

## Scripts

```bash
npm run dev      # Development server with hot reload
npm run build    # Build the static app to build/
npm run check    # svelte-check: TypeScript and Svelte checks
npm run lint     # ESLint (JavaScript, TypeScript and Svelte recommended rules)
```

## Structure

```text
src/
├── app.html                 # The HTML page
├── app.css                  # Colours and fonts from the hi-fi prototype
├── routes/                  # One page per wireflow screen
│   ├── +layout.svelte       # Header + the page
│   ├── +layout.ts           # ssr = false: the app runs in the browser
│   ├── +error.svelte        # Page not found
│   ├── +page.svelte         # B1 car list with filters
│   └── login/+page.svelte   # B6 log in, then back to where you came from
└── lib/
    ├── api/
    │   ├── client.ts        # fetch to the gateway, adds the token, turns errors into ApiError
    │   ├── types.ts         # The API messages as TypeScript types
    │   ├── auth.ts          # POST /auth/login
    │   ├── cars.ts          # GET /cars
    │   └── auctions.ts      # GET /auctions, bids
    ├── stores/
    │   ├── auth.svelte.ts   # Logged in user and token ($state, saved in localStorage)
    │   └── bidDraft.ts      # The typed bid per auction, kept while logging in
    ├── utils/
    │   ├── format.ts        # Dutch time, euros, status in words
    │   └── now.svelte.ts    # Reactive clock and polling with $state and $effect
    └── components/          # Header, status badge, filters, car card, message box
```

## Reactivity (Svelte 5 runes)

- `$state` holds data, for example the cars from the API or the logged in user.
- `$derived` is computed from state and updates by itself, for example the listings from the cars and the filter.
- `$effect` runs when the state it reads changes, for example loading the cars again when the filters in the URL change.
