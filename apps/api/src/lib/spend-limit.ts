import type { SpendLimitConfig } from "@tollbooth/types";

/**
 * Enforces spend limits in code, not in agent instructions. This check runs
 * BEFORE any EIP-712 signing is attempted — a denied request never reaches
 * the wallet. The agent (or whatever calls purchaseResource) cannot bypass
 * this by reasoning its way around it; the only way to change the limit is
 * to change SPEND_LIMIT_* env vars and restart the process.
 *
 * Session accumulation is in-memory for now (resets on restart). If this
 * needs to survive restarts for the demo, back it with the same Supabase
 * decision_log table decision-log.ts already writes to — flagged here
 * rather than silently assumed.
 */
export class SpendLimitTracker {
  private sessionSpentUsd = 0;

  constructor(private readonly config: SpendLimitConfig) {
    if (config.maxPerRequestUsd <= 0 || config.maxPerSessionUsd <= 0) {
      throw new Error(
        "SpendLimitTracker: limits must be positive. Refusing to start with " +
          "a zero or negative limit, since that could mean an unset env var " +
          "silently became a no-op check."
      );
    }
  }

  /** Must be called and must return allowed:true before any signing happens. */
  check(amountUsd: number): { allowed: boolean; reason?: string } {
    if (amountUsd <= 0) {
      return { allowed: false, reason: "Amount must be positive." };
    }
    if (amountUsd > this.config.maxPerRequestUsd) {
      return {
        allowed: false,
        reason: `Amount $${amountUsd.toFixed(4)} exceeds per-request limit of $${this.config.maxPerRequestUsd}.`
      };
    }
    if (this.sessionSpentUsd + amountUsd > this.config.maxPerSessionUsd) {
      return {
        allowed: false,
        reason:
          `Amount $${amountUsd.toFixed(4)} would push session spend to ` +
          `$${(this.sessionSpentUsd + amountUsd).toFixed(4)}, over the ` +
          `session limit of $${this.config.maxPerSessionUsd}.`
      };
    }
    return { allowed: true };
  }

  /** Only call this after a payment has actually been approved and signed. */
  recordSpend(amountUsd: number): void {
    this.sessionSpentUsd += amountUsd;
  }

  getSessionSpentUsd(): number {
    return this.sessionSpentUsd;
  }

  getConfig(): SpendLimitConfig {
    return this.config;
  }
}

export function loadSpendLimitConfigFromEnv(): SpendLimitConfig {
  const maxPerRequestUsd = Number(process.env.SPEND_LIMIT_MAX_PER_REQUEST_USD);
  const maxPerSessionUsd = Number(process.env.SPEND_LIMIT_MAX_PER_SESSION_USD);

  if (!Number.isFinite(maxPerRequestUsd) || !Number.isFinite(maxPerSessionUsd)) {
    throw new Error(
      "SPEND_LIMIT_MAX_PER_REQUEST_USD and SPEND_LIMIT_MAX_PER_SESSION_USD " +
        "must be set to positive numbers in apps/api/.env. Refusing to " +
        "default to an arbitrary limit — an unset spend cap is a safety " +
        "issue, not a convenience default."
    );
  }

  return { maxPerRequestUsd, maxPerSessionUsd };
}
