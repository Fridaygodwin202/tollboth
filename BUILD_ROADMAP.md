# Build Roadmap — TollBooth (working title)
An AI agent that pays per-query, via x402, for premium data it decides it needs — against a clearly-labeled mock seller, within a hard spend limit.

Session 1 — Core Infrastructure — theme-agnostic scaffold: apps/web + apps/api skeletons, Supabase auth, env templates, deploy stub.
Session 2 — Buyer Payment Skill — agent-side EIP-712 signing + 402-retry loop, with a hard per-request/session spend limit enforced in code (not just declared).
Session 3 — Mock Seller & Decision Log — the clearly-labeled simulated seller endpoint, plus a dashboard showing each purchase decision, its rationale, and remaining budget.
Session 4 — Polish & Submission — README, demo video, GitHub cleanup, confirm official judging/submission mechanics, submit.

Session 5 — Visual Design Pass (added after Session 4) — a real visual identity for the dashboard, deferred from every earlier session since none of them touched design. Added deliberately, not pulled forward silently — see SESSION_REPORT.md for the design plan and rationale.
