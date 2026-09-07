# Build Roadmap — TollBooth (working title)
An AI agent that pays per-query, via x402, for premium data it decides it needs — against a clearly-labeled mock seller, within a hard spend limit.

Session 1 — Core Infrastructure — theme-agnostic scaffold: apps/web + apps/api skeletons, Supabase auth, env templates, deploy stub.
Session 2 — Buyer Payment Skill — agent-side EIP-712 signing + 402-retry loop, with a hard per-request/session spend limit enforced in code (not just declared).
Session 3 — Mock Seller & Decision Log — the clearly-labeled simulated seller endpoint, plus a dashboard showing each purchase decision, its rationale, and remaining budget.
Session 4 — Polish & Submission — README, demo video, GitHub cleanup, confirm official judging/submission mechanics, submit.

Session 5 — Visual Design Pass (added after Session 4) — a real visual identity for the dashboard, deferred from every earlier session since none of them touched design. Added deliberately, not pulled forward silently — see SESSION_REPORT.md for the design plan and rationale.

Session 6 — Real Agent OS MCP Touchpoint (added after Session 5) — the buyer-only x402 flow never actually called anything Binance-hosted, which is a real risk for a Track A submission specifically named "Agent OS". Added a best-effort connection to the real `agent.binance.com/mcp/agentic` MCP server for live market data driving the purchase decision, with a guaranteed-working public-REST fallback so the flow never breaks even if the MCP connection doesn't work headlessly.

Session 7 — Deployment (added after Session 6) — full deployment runbook and config for apps/web (Vercel) and apps/api (Railway), so the submission can point at a live URL instead of localhost.

Session 8 — UX simplification (added after Session 7, user-directed) — removed the mandatory-feeling Supabase sign-in/sign-up flow (it never actually gated anything) and replaced it with an optional wallet-connect affordance; made the no-signup-required dashboard access explicit in the UI copy; fixed a TypeScript tsconfig deprecation warning.

Session 9 — Fix real build errors (added after Session 8) — first real `tsc` compile (via a Render deploy attempt) surfaced genuine TypeScript errors: a wrong `moduleResolution` mode for apps/api (was inheriting Next.js's "Bundler" setting instead of the "NodeNext" mode correct for directly-Node-executed code) plus three independent unknown/implicit-any typing bugs. See SESSION_REPORT.md for full root-cause analysis.
