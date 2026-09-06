"use client";

import { useEffect, useState } from "react";
import { Button } from "@tollbooth/ui";
import type { DecisionLogEntry, SpendLimitConfig, PurchaseResult } from "@tollbooth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEFAULT_REASON = "Demo: checking a premium market signal mid-analysis.";

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
        `Could not reach apps/api at ${API_URL}. Is it running? (${
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

  const pct = spendLimit
    ? Math.min(100, (spendLimit.sessionSpentUsd / spendLimit.config.maxPerSessionUsd) * 100)
    : 0;

  return (
    <main>
      <h1>Decision log</h1>
      <p role="alert" style={{ border: "1px solid #c00", padding: "0.75rem" }}>
        <strong>MOCK SELLER</strong> — the resource this page buys from is a
        simulated endpoint we built ourselves. Signatures are verified for
        real; no real B402 settlement occurs and no real funds move.
      </p>

      {loadError && <p role="alert">{loadError}</p>}

      {spendLimit && (
        <section>
          <h2>Session budget</h2>
          <p>
            ${spendLimit.sessionSpentUsd.toFixed(2)} spent of $
            {spendLimit.config.maxPerSessionUsd.toFixed(2)} session limit
            (${spendLimit.config.maxPerRequestUsd.toFixed(2)} max per request)
          </p>
          <div style={{ background: "#eee", height: 8, borderRadius: 4 }}>
            <div
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "#c00" : "#0a7",
                height: "100%",
                borderRadius: 4
              }}
            />
          </div>
        </section>
      )}

      <section>
        <h2>Trigger a purchase (demo)</h2>
        <label>
          Reason the agent gives for buying
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <Button onClick={triggerPurchase} disabled={busy}>
          {busy ? "Purchasing…" : "Buy premium data via x402"}
        </Button>
        {lastResult && (
          <p>
            Result: <strong>{lastResult.decision.decision}</strong>
            {lastResult.decision.denialReason ? ` — ${lastResult.decision.denialReason}` : ""}
          </p>
        )}
      </section>

      <section>
        <h2>History ({decisions.length})</h2>
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Decision</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.createdAt).toLocaleString()}</td>
                <td>{d.decision}</td>
                <td>${d.amountUsd.toFixed(4)}</td>
                <td>{d.reason}</td>
                <td>{d.denialReason ?? d.txSignature?.slice(0, 12) ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
