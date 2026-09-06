/**
 * Generic, theme-agnostic shared types.
 * Payment/agent-specific types are intentionally NOT added here yet —
 * that's Session 2+ work per the build ruleset's infra-before-theme rule.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
}

/* ---------------------------------------------------------------------- *
 * x402 payment flow types (introduced Session 2 — see BUILD_ROADMAP.md).
 * Shapes follow the x402 v2 spec's 402 response / X-PAYMENT header format.
 * NOTE: we are buyer-only. No seller-side (/verify, /settle) types here —
 * that role is out of scope per the Session 0 feasibility check.
 * ---------------------------------------------------------------------- */

export interface X402PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string; // atomic units, as a decimal string
  resource: string;
  description: string;
  mimeType?: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, unknown>;
}

export interface X402PaymentRequiredResponse {
  x402Version: number;
  accepts: X402PaymentRequirements[];
  error?: string;
}

export interface Eip3009Authorization {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: Eip3009Authorization;
  };
}

export interface SpendLimitConfig {
  maxPerRequestUsd: number;
  maxPerSessionUsd: number;
}

export interface DecisionLogEntry {
  id: string;
  createdAt: string;
  resource: string;
  reason: string;
  amountUsd: number;
  decision: "approved" | "denied";
  denialReason?: string;
  txSignature?: string;
}

export interface PurchaseResult {
  decision: DecisionLogEntry;
  responseStatus?: number;
  responseBody?: unknown;
  error?: string;
}
