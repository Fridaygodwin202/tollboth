# Session 0 — Research Brief
**Date:** 2026-09-05
**Event:** Binance Agent OS Mini Hackathon

## Event Rules
- Prize pool: $60,000 USDC, split across two tracks.
- Track A ($20,000): build an AI agent with Binance Agent OS.
- Track B ($40,000): connect your own MCPs and trade live.
- **Submission deadline: September 8, 2026, 23:59 UTC** — confirm exact remaining hours against your local timezone.
- Submission requires: a demo/video, a GitHub repo, and a completed survey. Some sources describe entry as also requiring following/reposting @Binance and replying with the submission — verify the exact current submission mechanism on Binance's own hackathon page before the final session, since secondary sources describe this slightly differently.
- Eligibility: not available to participants in the US, UK, EEA, Hong Kong, Singapore, or other Binance-restricted jurisdictions. Confirm your own eligibility before investing further time.
- **Unresolved:** no official granular judging rubric (category weights) was found in public sources. Check the official hackathon page directly for this before Session 4 (Polish & Submission), so effort in the final session goes where it's actually scored.

## Idea Lock
- **Track:** A — build an AI agent with Agent OS.
- **Workflow:** Payment Workflows (x402 / B402), scoped to the **buyer role only**.

## Agent OS Feasibility Check
- The official Agent OS MCP server (`https://agent.binance.com/mcp/agentic`) natively exposes three capabilities: real-time market data, read-only account info, and placing trading orders. Payment (x402/B402) and on-chain (Wallet Agentic Hub) capabilities are separate Agent OS integrations, not exposed through the MCP server itself.
- **B402 access is gated for the seller role.** Accepting x402 payments (calling `/verify` and `/settle`) requires a partner developer account: business name, EVM wallet address, RSA public key, IP whitelist. Both the Sandbox (Testnet) and Production base URLs are listed as "contact us for access" rather than self-serve — not realistically obtainable inside this deadline.
- **The buyer role is lighter.** A buyer only needs to sign an EIP-712 authorization off-chain; no partner account is required for that half of the flow. Third-party SDKs (e.g. Trust Wallet AgentKit) already support one-command x402 buyer integration on BNB Chain, which is the recommended path instead of hand-rolling B402 signing.
- **Decision:** build the agent as an x402 **buyer** only, and demo it against a self-built, clearly-labeled **mock seller** endpoint (an HTTP server that returns 402 with mock payment requirements and accepts a simulated proof-of-payment). This must stay visibly labeled as simulated everywhere it appears — in the UI, the README, and the demo video — per the ruleset's rule against unlabeled mocks.

## Prior-Art Check
- Binance/community MCP servers built for this hackathon so far skew toward the trading side (order execution, risk guardrails), not payments.
- Trust Wallet has already shipped an AgentKit SDK feature for x402 buyer-side payments — meaning "an agent that can pay via x402" is not itself a novel primitive. The differentiator needs to be the specific, concrete thing your agent autonomously decides to buy and why, not the payment mechanism itself.

## Feasibility Spot-Check
- EIP-712 signing for the buyer flow: available via existing wallet SDKs (e.g. Trust Wallet AgentKit), no gated approval needed.
- Mock seller: a plain HTTP endpoint you control, so no external dependency risk.

## One-Line Pitch (proposed — confirm or adjust)
An AI research agent that autonomously pays per-query, via x402, for premium market-data lookups it decides it needs mid-analysis — spending from a hard, agent-cannot-bypass budget, with every purchase logged and explained.

## Assumptions Carried Forward
- Exact judging rubric unconfirmed — verify before final session.
- Exact submission mechanism (form vs. social-post-based entry) unconfirmed — verify before final session.
- No B402 partner credentials in hand; buyer-only + mock-seller scope assumes this stays true for the rest of the build. If partner access comes through unexpectedly, that's a scope change to revisit deliberately, not fold in silently.
