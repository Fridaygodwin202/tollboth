# Demo video script (target: ~90–105 seconds)

Record this only after completing the first-run checklist in
`SESSION_REPORT.md` (Session 4) **and**, ideally, the deployment runbook in
`DEPLOYMENT.md` — a live public URL is more convincing than a localhost
recording. If deployment isn't done yet, `localhost:3000` still works for
this script; just swap the URL.

## 1. Hook (10s)
> "This is an agent that pays for its own data. When it needs a premium
> market signal, it doesn't ask a human for an API key — it pays for it
> itself, on the spot, via Binance's x402 payment protocol. And it can
> never spend more than the budget I gave it, because that's enforced in
> code, not in a prompt."

## 2. Show the dashboard, budget, and history (15s)
- Open `/dashboard`.
- Point at the session budget bar (currently at $0 spent).
- Point at the red "MOCK SELLER" banner — say plainly: *"To be upfront —
  the seller side of Binance's x402 payments requires partner approval we
  couldn't get in the hackathon window, so the endpoint this agent pays is
  one we built ourselves. The signature verification is real cryptography;
  the settlement is simulated."*

## 3. Show the real Binance Agent OS touchpoint (15s)
- Click "Check market conditions." Narrate: *"This is a real, live call to
  Binance — it checks actual market data to decide whether paying for the
  premium signal is even worth it right now, instead of buying on a
  fixed schedule."*
- Point at the "Source" line — say plainly which source served the check
  (Agent OS MCP or the public REST fallback), whichever it actually was.
  Don't overstate this if it fell back — the fallback is still real
  Binance data, just say which one.

## 4. Trigger a real purchase (20s)
- Type a reason (or use the default), click "Buy premium data via x402".
- Narrate while it runs: *"It just got a 402 Payment Required back, signed
  an EIP-712 authorization with its own wallet, and retried the request
  with the payment attached."*
- Show the result: "approved", the returned mock data, the budget bar
  moving, and the new row in the history table.

## 5. Show the limit actually blocking it (20s)
- Either use a second account with a lower limit already configured, or
  narrate: *"If I try to spend more than its per-request or session limit
  — even one cent more — this is denied before the wallet is ever
  touched."* Show a denied entry in the history table with its reason.
- (If you pre-recorded a denied attempt from the checklist step, cut to
  that clip here instead of re-triggering live.)

## 6. Close (10–15s)
> "That's TollBooth — an agent that can autonomously buy the data it
> decides it needs, cryptographically, on a budget it literally cannot
> exceed. Built for Track A of the Binance Agent OS Mini Hackathon."

## Notes
- Keep the MOCK SELLER disclaimer in the video — don't cut it for pacing.
  It's more credible to state the real constraint clearly than to imply
  full settlement works.
- If time allows, a 2-second cut to the code (`spend-limit.ts`'s `check()`
  function or `mock-facilitator.ts`'s signature recovery) reassures a
  technical judge this isn't just a UI mockup.
