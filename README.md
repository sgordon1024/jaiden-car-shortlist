# First Miles — Jaiden’s car shortlist

A responsive shared shortlist of 20 researched used cars near Buffalo, NY. Sort by price, mileage, year, or recommendation; filter by budget, mileage, state, source, and IIHS model years; leave attributed notes; remove and restore candidates.

## Shared persistence and access

Cloudflare D1 stores notes and removed-car state. A board uses a cryptographically random 256-bit capability in the URL fragment. The API stores only its SHA-256 hash and requires the capability in an Authorization header for every read or write. Anyone with the complete board link can read and edit that board. Do not put sensitive personal information in notes or post your board link publicly. The plain homepage is a read-only research preview until a visitor creates a board.

Notes are append-only and requests carry unique IDs so retries do not duplicate them. Changes to different cars do not overwrite each other. Removal is reversible. Updates sync every ten seconds and on window focus. The browser remembers only the board link and display name; records are in D1, not localStorage. Keep the full board link to reopen the same board on another device.

## Local development

Requires Node 22.13+.

1. `npm ci`
2. `npm run build`
3. `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lethal_molecule_man.sql`
4. `npm start -- --port 4173`
5. `node scripts/test-api.mjs http://127.0.0.1:4173`

Run `npx tsc --noEmit` for type checking. Sites publication applies migrations to the separate hosted database. The app uses the Sites Vinext starter and its build integration; see `.openai/hosting.json`. The public GitHub repository contains source and research, never production database contents or private board links.

## Research limitations

Listings were checked November 13, 2026. Prices, mileage, availability and seller claims may change. This app does not automatically refresh listing data. All cars require independent inspection and financing/insurance confirmation. Payment estimates assume $1,500 down, 10% APR, 60 months, 8.75% tax and a $250 title/registration allowance; they are not loan offers. Insurance, maintenance and fuel are excluded. Build-date exceptions apply to IIHS recommendations.

## Card photos

Photos are local assets under `public/cars`, matched to each listing. Card 12 uses an explicitly labeled representative stock image from the VIN-matched Capital One listing because the seller has not supplied photos; trim may differ. Other photos are sourced from the linked seller listings. Photos remain the property of their respective owners.
