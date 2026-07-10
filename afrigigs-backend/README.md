# AfriGigs — Strapi Backend

Escrow-backed, localized gig-marketplace API. Strapi v4 + MySQL.

## Contents

```
src/api/
  currency/                 Currency (code, symbol, minimum_national_bid)
  country/                  Country (cities, gig terminology, currency link)
  skills-catalog/           Master skills list
  skilled-profile/          Manual-trades / digital-services worker profile
  professional-profile/     White-collar worker profile (resume, certs)
  job/                      Job postings + custom `rankBids` proximity sort
  bid/                      Bids + lifecycle-enforced national/int'l minimums
  escrow-transaction/       Escrow ledger + custom `release` action
  wallet/                   Withdrawable worker balance
  verification-submission/  Video-selfie ID review queue
  review/                   Ratings, feeds trust_score_yes
  conversation/ + message/  Per-job chat threads

src/extensions/
  users-permissions/        Adds AfriGigs fields to User + POST /users/me/location
                            (raw GPS in, resolved city out — coordinates never stored)

src/components/profile/     certification.json (repeatable component on ProfessionalProfile)

config/                     database, server, admin, middlewares, plugins, cron-tasks
scripts/seed.js             Pre-seeds currencies, countries+cities, skills catalog
```

## Setup

```bash
npm install
cp .env.example .env
# fill in APP_KEYS, *_SALT, *_SECRET (use `openssl rand -base64 32` per value),
# DATABASE_*, GOOGLE_GEOCODING_API_KEY, and payment gateway keys

npm run develop      # starts Strapi in dev mode w/ admin panel at :1337/admin
```

After the first boot, create your admin user, then seed reference data:

```bash
npm run seed
```

## Key custom endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/users/me/location` | Auth'd. Body `{ latitude, longitude }` → reverse-geocodes and stores `native_last_city` only. Raw coords never persisted or returned. |
| `GET` | `/api/jobs/:id/rank-bids` | Returns the job's bids sorted by proximity (if not `FOR_EVERYONE` scope) → `trust_score_yes` → `profile_completion_skilled`. |
| `POST` | `/api/escrow-transactions/:id/release` | Auth'd, job-owner only. Moves held funds into the assigned worker's `Wallet.balance`, marks job `completed`. |

## Business rules enforced server-side (not just UI)

- **Bid minimums** (`src/api/bid/content-types/bid/lifecycles.js`): international bids ≥ $5 USD fixed floor; domestic bids ≥ `country.currency.minimum_national_bid`. Bid amounts are immutable after creation (withdraw + re-bid instead of editing).
- **Verification approval** (`verification-submission` lifecycle): flipping a submission to `approved` automatically sets `user.is_verified_human = true`.
- **Trust score** (`review` lifecycle): a 4★ or 5★ review increments the recipient's `trust_score_yes`, which feeds the proximity ranking algorithm.
- **Stalled escrow safeguard** (`config/cron-tasks.js`, hourly): any `in_progress` job with `held` escrow past its `completion_confirmation_deadline` auto-flags to `disputed` so it surfaces for admin review instead of sitting silently locked.

## Permissions

`src/index.js` bootstrap grants the `public` role read-only access to `Currency`, `Country`, and `SkillsCatalog` (needed for pre-login dropdowns). Everything else — jobs, bids, wallets, escrow, profiles — should be restricted to `authenticated` (or narrower, owner-scoped) permissions via **Settings → Roles** in the admin panel; wire up policies there for owner-only writes on `Job`, `Bid`, `Wallet`, etc.

## Payments

Gateway webhooks (Paystack / Flutterwave / DPO) are not wired to a specific route in this scaffold — add a `POST /api/webhooks/:gateway` custom route/controller that verifies the gateway signature, then creates an `EscrowTransaction` with `status: funded` and updates the linked `Job.escrow_status`. Keep the `release` action as the single place funds move into a `Wallet`, so escrow logic stays centralized.
