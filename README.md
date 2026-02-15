# Print-on-Demand T-Shirt MVP

Monorepo MVP for international POD commerce.

## Stack
- Frontend: Next.js App Router + TypeScript + Tailwind
- Backend: NestJS + TypeScript
- DB: PostgreSQL + Prisma
- Payments: Stripe Checkout (USD default)
- File storage: local `./storage` (S3-replaceable path pattern)

## Monorepo Structure
- `apps/web`: storefront + admin/producer portal pages
- `apps/api`: NestJS API, Prisma schema, Stripe webhook, production job generation
- `packages/shared`: shared type placeholders

## Run with Docker
```bash
cp .env.example .env
docker compose up --build
```

API: `http://localhost:4000`
Web: `http://localhost:3000`
Swagger: `http://localhost:4000/docs`

## Local Dev (without docker)
```bash
pnpm install
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
pnpm --filter api dev
pnpm --filter web dev
```

## Stripe setup (dev)
1. Put test key in `.env`: `STRIPE_SECRET_KEY=sk_test_...`
2. Run Stripe CLI forwarding:
```bash
stripe listen --forward-to localhost:4000/orders/webhooks/stripe
```
3. Set `STRIPE_WEBHOOK_SECRET` from CLI output.
4. In MVP fallback mode (no Stripe key), checkout returns mock success URL.

## Main Flows
1. `/customize` choose design/variant/qty.
2. `/cart` creates Stripe checkout session.
3. Stripe `checkout.session.completed` webhook:
   - marks order `PAID`
   - creates `OrderItem`
   - creates `ProductionJob` assigned to default producer
   - generates job ticket PDF in `storage/jobs/*.pdf`
4. Producer portal updates status + tracking.
5. `/order/track` shows latest production/tracking data.

## Seed Accounts
- Admin: `admin@example.com / admin1234`
- Producer: `producer@example.com / producer1234`

## Key Endpoints
- `POST /auth/login`
- `GET /designs` (+ admin CRUD)
- `GET /products/bases` (+ admin CRUD)
- `POST /orders/checkout-session`
- `POST /orders/webhooks/stripe`
- `GET /orders/:id/track?email=...`
- `GET /admin/orders`, `GET /admin/jobs`
- `GET/PATCH /producer/jobs`

## Tests
- `apps/api/src/orders/orders.service.spec.ts` includes webhook/service unit tests.

## TODO (post-MVP)
- Multi-currency and FX handling
- Tax/VAT and region-specific invoicing
- Shipping fee rules by zone/carrier
- Producer routing engine (capacity/SLA/region)
- Real email sender integration
- Move storage adapter to S3-compatible provider
- Queue-based async event pipeline
