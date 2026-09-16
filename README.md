# home-align

A platform for real estate brokers to capture and reconcile the preferences of
home-buying groups (e.g. a husband and wife with differing priorities), match
those preferences against available listings, and collect per-buyer feedback
after property visits.

## Roles

- **Broker** — owns buying groups, sets each group's search criteria, invites
  buyers, views aggregated/divergent preferences and feedback across the group.
- **Buyer** — belongs to exactly one buying group, ranks must-have features and
  the six fundamentals (light, space, location, layout, quality, work
  required) privately, and rates properties after visiting them. A buyer's
  individual rankings are visible to their broker but never to other buyers in
  the same group.

## Stack

- Next.js (App Router, TypeScript, Tailwind) — serves both the broker
  dashboard and the buyer-facing PWA
- PostgreSQL + Prisma
- Custom email/password auth (JWT session cookies via `jose`, `bcryptjs` for
  hashing) — no third-party auth provider, since invite-by-email and
  per-tenant access control are core requirements
- Resend for transactional email (invites, password resets)
- Docker + docker-compose for local dev and homelab deployment

## Phase plan

**Phase 1 — core loop (current focus)**
Broker/buying-group signup, buyer invite + password reset, broker-set group
criteria, buyer preference capture (must-haves + fundamentals ranking),
broker dashboard showing per-buyer rankings with divergence flagged,
manual/imported listings (ported from the
[la-home-search](https://github.com/gdychow/la-home-search) scrape pipeline),
post-visit buyer feedback.

**Phase 2 — matching & discovery**
Weighted match-scoring of listings against group + individual preferences,
new-listing alerts, forced-choice ("dating app" style) comparisons to infer
implicit preference weights.

**Phase 3 — monetization & native mobile**
Stripe seat-based billing per active buyer, native iOS/Android if the PWA
beta validates demand, multi-agent brokerages.

`Listing.source` is an enum (`MANUAL`, `ZILLOW_SCRAPE`, `MLS`) so a real MLS
feed (RESO/Spark) can be added later as another import path without changing
the schema — real MLS access requires the broker's own MLS membership and a
data licensing/IDX agreement, which is a business step independent of this
codebase.

## Local development

```bash
cp .env.example .env
docker compose up -d postgres
npx prisma migrate dev
npm run dev
```

## Homelab deployment

```bash
cp .env.example .env   # fill in real SESSION_SECRET / RESEND_API_KEY
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

The same image/compose file works for local dev and homelab hosting — only
the `.env` values differ.
