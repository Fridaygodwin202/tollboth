"use client";

import { useEffect, useState } from "react";
import { Button } from "@tollbooth/ui";
import type {
  DecisionLogEntry,
  SpendLimitConfig,
  PurchaseResult,
  AgentOsCheckResult
} from "@tollbooth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEFAULT_REASON = "Checking a premium market signal mid-analysis.";

interface SpendLimitState {
  config: SpendLimitConfig;
  sessionSpentUsd: number;
}

export default function DashboardPage() {
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([]);
  const [spendLimit, setSpendLimit] = useState<SpendLimitState | null>(null);
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<PurchaseResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agentOsResult, setAgentOsResult] = useState<AgentOsCheckResult | null>(null);
  const [agentOsBusy, setAgentOsBusy] = useState(false);

  async function refresh() {
    setLoadError(null);
    try {
      const [decisionsRes, spendRes] = await Promise.all([
        fetch(`${API_URL}/decisions`),
        fetch(`${API_URL}/spend-limit`)
      ]);
      setDecisions(await decisionsRes.json());
      setSpendLimit(await spendRes.json());
    } catch (err) {
      setLoadError(
        `Can't reach apps/api at ${API_URL}. Is it running? (${
          err instanceof Error ? err.message : String(err)
        })`
      );
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function triggerPurchase() {
    setBusy(true);
    setLastResult(null);
    try {
      const res = await fetch(`${API_URL}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceUrl: `${API_URL}/mock-seller/premium-data`,
          reason
        })
      });
      const result: PurchaseResult = await res.json();
      setLastResult(result);
      await refresh();
    } catch (err) {
      setLastResult({
        decision: {
          id: "client-error",
          createdAt: new Date().toISOString(),
          resource: "",
          reason,
          amountUsd: 0,
          decision: "denied",
          denialReason: err instanceof Error ? err.message : String(err)
        },
        error: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setBusy(false);
    }
  }

  async function checkAgentOs() {
    setAgentOsBusy(true);
    setAgentOsResult(null);
    try {
      const res = await fetch(`${API_URL}/agent-os/check`);
      const result: AgentOsCheckResult = await res.json();
      setAgentOsResult(result);
      if (result.shouldBuy) {
        setReason(result.reason);
      }
    } catch (err) {
      setAgentOsResult({
        source: "binance-public-rest",
        shouldBuy: false,
        reason: err instanceof Error ? err.message : String(err),
        detail: null
      });
    } finally {
      setAgentOsBusy(false);
    }
  }

  const pct = spendLimit
    ? Math.min(100, (spendLimit.sessionSpentUsd / spendLimit.config.maxPerSessionUsd) * 100)
    : 0;

  return (
    <main>
      <h1>The ledger</h1>

      <p className="mock-notice">
        This ledger pays a mock seller we built ourselves — not a real
        Binance-verified merchant. Every signature below is checked for
        real; no settlement or funds movement actually occurs.
      </p>

      {loadError && <p role="alert">{loadError}</p>}

      {spendLimit && (
        <section>
          <h2>Gate status</h2>
          <div
            className="gate-arm-track"
            role="progressbar"
            aria-valuenow={spendLimit.sessionSpentUsd}
            aria-valuemin={0}
            aria-valuemax={spendLimit.config.maxPerSessionUsd}
          >
            <div
              className={`gate-arm-fill${pct >= 100 ? " gate-arm-full" : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="gate-arm-label">
            ${spendLimit.sessionSpentUsd.toFixed(2)} of $
            {spendLimit.config.maxPerSessionUsd.toFixed(2)} spent this session
            (${spendLimit.config.maxPerRequestUsd.toFixed(2)} max per request)
          </p>
        </section>
      )}

      <section>
        <h2>Check with Binance Agent OS</h2>
        <p>
          Asks Binance&apos;s real Agent OS MCP server for live market data
          first (falling back to Binance&apos;s public API if that
          connection isn&apos;t available) to decide whether paying for the
          premium signal is actually worth it right now.
        </p>
        <Button variant="quiet" onClick={checkAgentOs} disabled={agentOsBusy}>
          {agentOsBusy ? "Checking…" : "Check market conditions"}
        </Button>
        {agentOsResult && (
          <p className="mono-note">
            Source: {agentOsResult.source} — {agentOsResult.reason}
          </p>
        )}
      </section>

      <section>
        <h2>Request passage</h2>
        <label>
          Reason the agent gives for buying
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <Button onClick={triggerPurchase} disabled={busy}>
          {busy ? "Paying the toll…" : "Pay toll via x402"}
        </Button>
        {lastResult && (
          <p>
            Result: <strong>{lastResult.decision.decision}</strong>
            {lastResult.decision.denialReason ? ` — ${lastResult.decision.denialReason}` : ""}
          </p>
        )}
      </section>

      <section>
        <h2>Past tickets ({decisions.length})</h2>
        {decisions.length === 0 && (
          <p>No tickets yet. Pay a toll above to see the first one land here.</p>
        )}
        <div className="ledger">
          {decisions.map((d) => (
            <div className="ticket-stub" key={d.id}>
              <span className={`ticket-status ${d.decision}`}>{d.decision}</span>
              <span className="ticket-amount">${d.amountUsd.toFixed(4)}</span>
              <span className="ticket-reason">{d.reason}</span>
              <span className="ticket-meta">
                {new Date(d.createdAt).toLocaleString()}
                {d.denialReason ? ` — ${d.denialReason}` : ""}
                {d.txSignature ? ` — sig ${d.txSignature.slice(0, 14)}…` : ""}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
