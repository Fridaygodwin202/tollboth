# Deployment runbook

I can't execute any of this myself — no network access in the build
environment, and account creation/OAuth are things only you can do. This is
the exact sequence to get both apps live. If any step errors, paste it back
and I'll fix the code.

Do this **after** the local first-run checklist in `SESSION_REPORT.md`
(Session 4) has already succeeded once — deploying code that's never run
locally means debugging two unknowns at once instead of one.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "TollBooth: Binance Agent OS Mini Hackathon submission"
gh repo create tollbooth --public --source=. --push
# or push to an existing repo you've already created
```

## 2. Deploy apps/api to Render (or Railway — either works)

Render's own docs confirm `pnpm install` correctly finds the true workspace
root regardless of `rootDir`, so either of these patterns works:

**Option A — set a root directory (Render's own recommended pattern):**
- **Root Directory:** `apps/api`
- **Build Command:** `pnpm install && pnpm --filter @tollbooth/api build`
- **Start Command:** `pnpm --filter @tollbooth/api start`

**Option B — no root directory, filtered commands from repo root:**
- **Root Directory:** leave unset
- **Build Command:** `pnpm install && pnpm --filter @tollbooth/api build`
- **Start Command:** `pnpm --filter @tollbooth/api start`

Either way, under **Environment**, add every value from
`apps/api/.env.example` (see the full list below). Don't set `PORT` —
Render injects it automatically and `src/index.ts` already reads
`process.env.PORT`.

### If the build fails with `Cannot find module 'viem'` / `'@modelcontextprotocol/sdk'...`

This isn't a missing-dependency problem — it was a real `tsconfig.json`
issue, already fixed in this repo: `apps/api` was inheriting
`"moduleResolution": "Bundler"` from the shared config (meant for
`apps/web`'s Next.js bundler-based build), but `apps/api` is executed
directly by Node (`tsx` in dev, compiled + `node` in production), which
needs `"NodeNext"` instead. Packages with complex `exports` maps (`viem`,
`@modelcontextprotocol/sdk`) fail to resolve their types under the wrong
mode; simpler packages (`fastify`, `@supabase/supabase-js`) happen to work
either way, which is why only some imports failed. If you pulled the repo
before this fix, re-download the latest zip.

## 2b. Deploy apps/api to Railway (alternative)

Railway needs the **opposite** setup from Vercel for a shared pnpm
workspace: do **not** set a per-service root directory — Railway's own
docs are explicit that shared/workspace monorepos should keep the service
rooted at the repo root and override build/start commands instead, or a
per-app root directory will miss the workspace packages
(`@tollbooth/types`, `@tollbooth/ui`) entirely and the build will fail.

1. Create a new Railway project, connect this GitHub repo.
2. In the service's **Settings** tab:
   - **Root Directory:** leave unset (repo root).
   - **Build Command:** `pnpm install && pnpm --filter @tollbooth/api build`
   - **Start Command:** `pnpm --filter @tollbooth/api start`
3. Under **Variables**, add every value from `apps/api/.env.example`
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AGENT_WALLET_PRIVATE_KEY`,
   `SPEND_LIMIT_MAX_PER_REQUEST_USD`, `SPEND_LIMIT_MAX_PER_SESSION_USD`,
   `X402_PREFERRED_NETWORK`, `X402_ASSET_DECIMALS`,
   `MOCK_SELLER_PRICE_USD`, `MOCK_SELLER_PAYOUT_ADDRESS`,
   `X402_MOCK_ASSET_ADDRESS`, `AGENT_OS_MODE=testnet`, `AGENT_OS_MCP_URL`,
   `AGENT_OS_CHECK_SYMBOL`, `AGENT_OS_VOLATILITY_THRESHOLD_PCT`). Do **not**
   set `PORT` — Railway injects it automatically and `src/index.ts` already
   reads `process.env.PORT`.
4. Deploy. Once live, copy the public Railway URL (Settings → Networking →
   Generate Domain if one isn't assigned yet).
5. Confirm it's actually up: `curl https://<your-railway-url>/health` should
   return `{"status":"ok",...}`.

## 3. Deploy apps/web to Vercel

Current Vercel guidance for a pnpm/Turborepo monorepo is the mirror image
of Railway's: set the app's own directory as the **Root Directory**, and
explicitly include the rest of the monorepo in the build.

1. Import this GitHub repo into a new Vercel project.
2. In **Project Settings → General**:
   - **Root Directory:** `apps/web`
   - Check **"Include files outside the root directory in the Build Step"**
     — without this, Vercel won't upload `packages/*`, and the build will
     fail on the `@tollbooth/types`/`@tollbooth/ui` workspace imports.
3. `apps/web/vercel.json` already sets the build/install commands to run
   from the monorepo root (`cd ../.. && pnpm turbo run build --filter=@tollbooth/web`)
   — Vercel should pick this up automatically once Root Directory is set.
4. Under **Environment Variables**, set:
   - `NEXT_PUBLIC_API_URL` — the Render (or Railway) URL from step 2, e.g. `https://tollbooth-api.onrender.com`.
   (apps/web doesn't need Supabase credentials — the decision log is written server-side by apps/api only.)
5. Deploy. Visit the resulting `*.vercel.app` URL.

## 4. Smoke test the live deployment

Don't trust localhost success to mean the deployed version works — env
vars, CORS, and cross-origin cookies behave differently once two different
domains are involved.

1. Open the deployed web URL, confirm the home page's health check shows
   apps/api as "ok" (proves `NEXT_PUBLIC_API_URL` is wired correctly).
2. Go to `/dashboard`, click "Check market conditions," then "Pay toll via
   x402" — confirm a real decision lands in the ledger and in Supabase.
3. If the purchase call fails with a CORS error in the browser console:
   `apps/api`'s CORS is currently `origin: true` (allow-all), which should
   already permit this — if it still fails, the more likely cause is
   `NEXT_PUBLIC_API_URL` pointing at the wrong URL, not CORS.

## 5. Update the demo video plan

Once the live URLs work, re-point `DEMO_SCRIPT.md` at the deployed
dashboard URL instead of `localhost:3000` — a live public URL is more
convincing to judges than a local screen recording, and doubles as proof
the "fully deployed" claim is real.

## Known limitations of this deployment

- Render's (and Railway's) free tiers can sleep on inactivity — check
  before recording the demo that the service is actually warm, not
  cold-starting on the first click. A cold start can take 30+ seconds,
  which will look broken on camera if you don't account for it.
- The Agent OS MCP connection (`binance-agent-os.ts`) is best-effort and
  unverified (see Session 6 notes) — if it fails in production the same
  way it might locally, `/agent-os/check` still works via the public REST
  fallback, so the dashboard flow itself won't break either way.
