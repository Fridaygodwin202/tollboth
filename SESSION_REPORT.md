## Session 1: Core Infrastructure
**Date:** 2026-09-05
**Goal:** Theme-agnostic monorepo scaffold — apps, shared packages, Supabase auth, deploy stub.

**Files added/changed:**
- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore` — workspace root config
- `README.md` — project overview, scope note on mock-seller-only payments, setup steps
- `apps/web/*` — Next.js App Router skeleton: layout, home page, sign-up/sign-in pages, browser Supabase client, live health-check component
- `apps/api/*` — Fastify server: bootstrap, `/health` route, server-side Supabase client
- `packages/types/src/index.ts` — generic `ApiResponse<T>`, `HealthStatus` (intentionally no payment/agent-specific types yet)
- `packages/config/*` — shared `tsconfig.base.json`, ESLint preset
- `packages/ui/src/index.tsx` — one unstyled `Button` primitive
- `apps/web/vercel.json`, `deploy/README.md` — deploy stub, not connected to a live target

**Current full file tree:**
```
.
├── .gitignore
├── README.md
├── apps
│   ├── api
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── index.ts
│   │   │   ├── lib/supabase.ts
│   │   │   └── routes/health.ts
│   │   └── tsconfig.json
│   └── web
│       ├── .env.example
│       ├── app
│       │   ├── (auth)/sign-in/page.tsx
│       │   ├── (auth)/sign-up/page.tsx
│       │   ├── globals.css
│       │   ├── health-check.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── lib/supabase/client.ts
│       ├── next.config.mjs
│       ├── package.json
│       ├── tsconfig.json
│       └── vercel.json
├── deploy/README.md
├── package.json
├── packages
│   ├── config
│   │   ├── eslint-preset.cjs
│   │   ├── package.json
│   │   └── tsconfig.base.json
│   ├── types
│   │   ├── package.json
│   │   ├── src/index.ts
│   │   └── tsconfig.json
│   └── ui
│       ├── package.json
│       ├── src/index.tsx
│       └── tsconfig.json
├── pnpm-workspace.yaml
└── turbo.json
```

**Dependencies installed:**
- **Not yet installed** — this environment has no network access, so `pnpm install` has not been run. Declared, not verified:
  - `next@^14.2.15`, `react@^18.3.1`, `react-dom@^18.3.1` — apps/web
  - `@supabase/supabase-js@^2.45.4` — apps/web, apps/api
  - `fastify@^5.0.0`, `@fastify/cors@^10.0.1`, `dotenv@^16.4.5` — apps/api
  - `tsx@^4.19.1` — apps/api dev runner
  - `turbo@^2.1.3`, `typescript@^5.6.3` — root devDependencies
- Per ruleset rule 9, these should be treated as **unverified** until Session 2 actually runs `pnpm install`, at which point log any version drift here.

**Supabase schema state:**
- No tables created yet. Only `supabase.auth` (built-in) is used, via the sign-up/sign-in/sign-out pages. No custom schema exists — do not assume any table beyond Supabase's own `auth.users`.

**Env vars required:**
- `apps/web/.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
- `apps/api/.env.example`: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BINANCE_TESTNET_API_KEY`, `BINANCE_TESTNET_API_SECRET`, `BINANCE_MAINNET_API_KEY`, `BINANCE_MAINNET_API_SECRET`, `AGENT_OS_MODE`
- None of these have values yet — they must be confirmed present before any session that depends on them runs (ruleset 9.7).

**Agent OS mode:** testnet (default — no live or mainnet calls made this session; `BINANCE_MAINNET_*` vars are declared for naming consistency only and are empty)

**Sub-account scope & limits:** Not yet created. This session did no Agent OS integration work — no MCP calls, no B402 calls, no sub-account setup. Deferred to Session 2 (Buyer Payment Skill).

**Decision log (this session):** None — no trade, payment, or on-chain action was taken or attempted this session.

**API endpoints live:**
- `GET /health` — apps/api liveness check, returns `HealthStatus`

**Known stubs/mocks/TODOs:**
- Deploy targets are stubbed, not connected (`apps/web/vercel.json` unlinked; apps/api has no hosting target chosen yet)
- Auth uses a plain browser Supabase client, not `@supabase/ssr` — sessions aren't synced to server components/middleware yet. Fine for this stage; revisit only if a session actually needs server-side session checks.
- No automated tests yet.
- **Nothing payment/x402-related has been built yet** — that's Session 2. Anything resembling a "mock seller" does not exist in this codebase yet; don't assume it does.

**Assumptions carried into next session:**
- Package manager/workspace tool: pnpm + turborepo (ruleset default, unconfirmed with you — flag if you want something else)
- Deploy targets: Vercel (web) assumed; api target (Railway/Render/Fly) still undecided — Section 10 open item, not resolved this session
- Dependency versions above are declared but **not install-verified** (no network in this sandbox) — first thing to check on your machine
- No Supabase project has been created/connected yet — you'll need to create one and fill in both `.env` files before `pnpm dev` will fully work (the app will still boot; auth and the health-check's Supabase-touching paths will error without it)
- Official hackathon judging rubric and exact submission mechanism are still unconfirmed (carried from Session 0's Research Brief)

**Style history:** N/A — no UI-touching design work done this session (Section 8 process not yet triggered; the current pages are placeholder scaffold, not a design pass)
