# AfriGigs — Frontend (Next.js App Router)

This is the frontend for the AfriGigs Strapi backend described in the project
blueprint. It's plain **JavaScript** (JSX), App Router, MUI for components,
Framer Motion for animation, and a custom Stack/GridBox/Container layout
system — **MUI's `Grid`/`Grid2` is never imported anywhere in this project**,
per the brief's requirement.

## Structure

```
app/                     Route segments (App Router)
  page.jsx                 "/" landing
  onboarding/page.jsx       Instant Onboarding flow
  login/page.jsx
  dashboard/page.jsx
  gigs/page.jsx             Browse gigs
  gigs/[id]/page.jsx        Gig detail + bidding
  gigs/new/page.jsx         Post a job
  profile/[id]/page.jsx     Public profile
  profile/edit/page.jsx
  verify/page.jsx
  wallet/page.jsx
  messages/page.jsx
  messages/[conversationId]/page.jsx
  layout.jsx, providers.jsx, globals.css

components/
  layout/    Stack, GridBox, Container, NavBar
  gigs/      GigCard, BidTicket, BidList
  wallet/    WalletBalanceChip, EscrowStatusTimeline
  shared/    TrustBadge, VerifiedTag, ProfileCompletionRing,
             CountryCurrencySelector, OnboardingStepper, DisputeFlagBanner

lib/
  api.js         Low-level fetch wrapper (JWT header, Strapi query-string builder)
  endpoints.js    Domain functions per content type (JobApi, BidApi, WalletApi, ...)
  auth-context.jsx  React context for the signed-in user
  format.js       Currency/date/initials formatting helpers

hooks/
  useRequireAuth.js     Redirects to /login if signed out
  useDebouncedValue.js  Debounce for filter inputs

theme/
  theme.js   MUI theme tokens (Pan-African dark palette, custom shadows/gradients)
```

## Environment

Set `NEXT_PUBLIC_STRAPI_URL` to your Strapi instance (defaults to
`http://localhost:1337`).

## What's stubbed vs. real

- Every page calls the exact Strapi endpoints documented in the backend
  reference (see comments at the top of each file).
- **Payment gateway checkout** (`app/gigs/new/page.jsx`) posts a placeholder
  `gateway_ref` to `/escrow-transactions`, because the live Paystack/
  Flutterwave/DPO webhook route isn't wired on the backend yet (per the
  backend doc's D.6 note). Swap in the real gateway SDK call once that
  route exists.
- **Admin-only actions** (verification approval, dispute resolution) happen
  in the Strapi admin panel, not in this frontend — pages poll/refetch to
  reflect status changes instead.

## Notes on conventions

- All money values use the `.font-tabular` class (Space Grotesk, tabular
  figures) defined in `globals.css` so amounts don't jitter on update.
- Server-side validation errors (e.g. the bid floor check) are surfaced
  verbatim in the UI — see `components/gigs/BidTicket.jsx` — rather than
  duplicated as client-only checks.
- `prefers-reduced-motion` is respected globally (`globals.css`) and in the
  `VerifiedTag` shimmer specifically.
