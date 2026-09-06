# TollBooth (working title)

An AI agent that pays per-query, via Binance x402, for premium data it decides
it needs mid-analysis — spending from a hard, agent-cannot-bypass budget, with
every purchase logged and explained.

Built for the **Binance Agent OS Mini Hackathon**, Track A.

See `RESEARCH_BRIEF.md` and `BUILD_ROADMAP.md` at the project root (from
Session 0) for the full research, scope, and session plan.

## Important scope note

This project implements the x402 **buyer** role only. The Binance B402 seller
role (accepting payments via `/verify` and `/settle`) requires a gated partner
developer account that we don't have. Every "seller" this agent pays in the
demo is a **mock endpoint we built ourselves** — clearly labeled as simulated
in the UI, this README, and the demo video. No real B402 settlement occurs.

## Stack

- `apps/web` — Next.js (App Router), Supabase auth
- `apps/api` — Fastify server
- `packages/types` — shared TypeScript types
- `packages/config` — shared ESLint/TypeScript config
- `packages/ui` — shared UI primitives

## Getting started

This scaffold was generated without network access, so dependencies have
**not been installed or build-verified yet**. First real steps on your
machine:

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# fill in the Supabase values in both files
pnpm dev
```

`apps/web` runs on `:3000`, `apps/api` on `:4000` (see `apps/api/.env.example`).

## Environment split

Every session runs against **testnet** credentials by default. Mainnet is
only touched in an explicitly-scoped go-live session, per the build ruleset.
See `apps/api/.env.example` for the `BINANCE_TESTNET_*` / `BINANCE_MAINNET_*`
naming convention.
