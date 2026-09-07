# Hackathon submission answers

## Project name
TollBooth

## Project description
TollBooth is an AI agent that pays for its own data. Instead of stopping to
ask a human for an API key when it needs a premium market signal, it checks
live market conditions via Binance's Agent OS MCP server, decides whether
the signal is actually worth paying for, and — if so — pays per-request
using Binance's x402 payment protocol: it signs an EIP-3009/EIP-712 payment
authorization with its own wallet, retries the request with the signed
payment attached, and receives the data back.

Every purchase is capped by a hard spend limit enforced in code — checked
before any signature is ever created, so the agent cannot spend past its
budget no matter how it reasons about a request. Every decision, approved
or denied, is logged to a running ledger with its rationale, visible on a
live dashboard.

Because accepting x402 payments (the seller role) requires a Binance
partner developer account we couldn't obtain inside the hackathon window,
the endpoint TollBooth pays against in this demo is one we built ourselves
— it cryptographically verifies the agent's signature for real, but
doesn't perform real on-chain settlement. This is disclosed clearly in the
dashboard UI, the README, and the demo video.

## Step-by-step replication guide
1. Clone the repo and run `pnpm install` at the root (pnpm + Turborepo monorepo).
2. Create a free Supabase project and run `supabase/schema.sql` in its SQL editor to create the `decision_log` table.
3. Copy `apps/web/.env.example` → `.env.local` and `apps/api/.env.example` → `.env`; fill in your Supabase URL and keys.
4. Generate a fresh testnet-only EVM private key (don't reuse a funded wallet), fund it from a BNB Smart Chain testnet faucet, and set it as `AGENT_WALLET_PRIVATE_KEY`.
5. Set the remaining env vars: spend limits, mock-seller payout/asset addresses (any valid testnet address works), and the Binance Agent OS MCP settings (sensible defaults are pre-filled).
6. Run `pnpm dev` from the repo root. `apps/web` starts on `:3000`, `apps/api` on `:4000`.
7. Open `localhost:3000` and confirm the home page shows `apps/api` as healthy.
8. Go to `/dashboard`, click "Check market conditions" to see a live Binance data check, then "Pay toll via x402" to watch the agent sign a real payment authorization, get it cryptographically verified, and log the result.
9. Optional: lower `SPEND_LIMIT_MAX_PER_REQUEST_USD` below the mock seller's price and restart to see a purchase denied before any signing occurs.
10. Optional: for a live URL instead of localhost, follow `DEPLOYMENT.md` (Vercel for web, Railway for api).
