# TollBooth (working title)

An AI agent that pays per-query, via Binance x402, for premium data it decides
it needs mid-analysis — spending from a hard, agent-cannot-bypass budget, with
every purchase logged and explained.

Built for the **Binance Agent OS Mini Hackathon**, Track A.

See `RESEARCH_BRIEF.md` and `BUILD_ROADMAP.md` at the project root for the
full research, scope, and session-by-session build plan. `SESSION_REPORT.md`
has a detailed log of what was built and verified in each session.

## What's real vs. simulated

- **Real:** EIP-3009/EIP-712 payment authorization signing (buyer side) and
  cryptographic signature verification (seller side) — both implemented per
  the x402 v2 spec, using `viem`.
- **Simulated:** settlement. Accepting real Binance x402 (B402) payments
  requires a gated partner developer account (business details, RSA key,
  IP whitelist) that we don't have and couldn't realistically obtain inside
  the hackathon window. Every "seller" this agent pays is a mock endpoint we
  built ourselves (`apps/api/src/routes/mock-seller.ts`) — it verifies the
  buyer's signature for real but never calls Binance's actual `/verify` or
  `/settle`, and no funds actually move. This is labeled everywhere it
  matters: the API responses, the dashboard UI, and the demo video.

## Stack

- `apps/web` — Next.js (App Router), Supabase auth, decision-log dashboard
- `apps/api` — Fastify server: buyer payment skill, spend-limit enforcement,
  mock seller
- `packages/types` — shared TypeScript types
- `packages/config` — shared ESLint/TypeScript config
- `packages/ui` — shared UI primitives

## Getting started

This project was scaffolded without network access, so nothing has been
installed or run yet. First real steps:

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# fill in every value in apps/api/.env — apps/web only needs
# NEXT_PUBLIC_API_URL, which already defaults to localhost:4000
pnpm dev
```

`apps/web` runs on `:3000`, `apps/api` on `:4000`.

Once running: visit `/dashboard` directly — no sign-up required, the ledger
is open to anyone. Click "Buy premium data via x402" and watch a real
signed payment authorization get verified against the mock seller, logged,
and reflected in the spend meter. A "Connect wallet" button in the header
is available as an optional identity affordance for visitors (via a
browser wallet extension) — it's unrelated to the agent's own payment
wallet (a separate server-side key in `apps/api`) and nothing in the app
is gated behind it.

## Environment split

Every session runs against **testnet** credentials by default. The agent's
wallet (`AGENT_WALLET_PRIVATE_KEY`) refuses to load unless
`AGENT_OS_MODE=testnet` is set. There is no mainnet path implemented in this
codebase at all.

## Deploying

See `DEPLOYMENT.md` for the full runbook — apps/web to Vercel, apps/api to
Railway, with the exact monorepo settings each platform needs (they're
opposite of each other: Vercel wants a per-app root directory, Railway's
shared-monorepo pattern wants the root directory left at repo root).

## Hackathon submission notes

- Track A: build an AI agent with Binance Agent OS.
- Entry is via following @Binance, reposting, and replying with the
  submission (demo video + GitHub repo link) plus completing a survey.
- Not available to participants in the US, UK, EEA, Hong Kong, Singapore, or
  other Binance-restricted jurisdictions — confirm eligibility before
  submitting.
- Double-check the exact current process on Binance's own hackathon post
  before submitting; the above is accurate as of research done during this
  build but hasn't been re-verified at submission time.
