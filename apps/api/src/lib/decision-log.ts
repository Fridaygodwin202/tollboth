import { randomUUID } from "node:crypto";
import type { DecisionLogEntry } from "@tollbooth/types";
import { supabaseAdmin } from "./supabase.js";

const TABLE = "decision_log";

/**
 * Persists a decision (approved or denied) to Supabase. See
 * supabase/schema.sql at the repo root for the table definition — it has
 * not been run against a live project yet (no Supabase project connected
 * in this environment), so this is unverified against a real database.
 */
export async function recordDecision(
  entry: Omit<DecisionLogEntry, "id" | "createdAt">
): Promise<DecisionLogEntry> {
  const fullEntry: DecisionLogEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  };

  const { error } = await supabaseAdmin.from(TABLE).insert({
    id: fullEntry.id,
    created_at: fullEntry.createdAt,
    resource: fullEntry.resource,
    reason: fullEntry.reason,
    amount_usd: fullEntry.amountUsd,
    decision: fullEntry.decision,
    denial_reason: fullEntry.denialReason ?? null,
    tx_signature: fullEntry.txSignature ?? null
  });

  if (error) {
    // Don't silently drop the decision record — a payment/denial that isn't
    // logged is exactly the kind of untracked action the ruleset's Section 9
    // decision-logging rule exists to prevent. Surface it loudly.
    console.error("[decision-log] Failed to persist decision:", error.message);
  }

  return fullEntry;
}

export async function listDecisions(limit = 50): Promise<DecisionLogEntry[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[decision-log] Failed to fetch decisions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    resource: row.resource,
    reason: row.reason,
    amountUsd: Number(row.amount_usd),
    decision: row.decision,
    denialReason: row.denial_reason ?? undefined,
    txSignature: row.tx_signature ?? undefined
  }));
}
