import type { PurchaseResult } from "@tollbooth/types";
import { loadAgentWallet } from "./wallet.js";
import {
  parsePaymentRequired,
  selectPaymentRequirement,
  atomicAmountToUsd,
  buildAuthorization,
  signAuthorization,
  encodePaymentHeader
} from "./x402-client.js";
import { SpendLimitTracker } from "./spend-limit.js";
import { recordDecision } from "./decision-log.js";

const PREFERRED_NETWORK = process.env.X402_PREFERRED_NETWORK ?? "bsc-testnet";
const ASSET_DECIMALS = Number(process.env.X402_ASSET_DECIMALS ?? 6); // USDC-style default

/**
 * Attempts to fetch a resource, paying for it via x402 if the server
 * responds 402. Enforces the spend limit BEFORE any signing — a denied
 * request never reaches the wallet, and is still logged.
 *
 * `spendLimitTracker` is injected rather than constructed here so the
 * per-session accumulator can be shared across multiple purchase calls
 * within the same server process.
 */
export async function purchaseResource(
  resourceUrl: string,
  reason: string,
  spendLimitTracker: SpendLimitTracker
): Promise<PurchaseResult> {
  const initialResponse = await fetch(resourceUrl);

  if (initialResponse.status !== 402) {
    // Not a paid resource (or already accessible) — nothing to buy, nothing to log.
    return {
      decision: {
        id: "n/a",
        createdAt: new Date().toISOString(),
        resource: resourceUrl,
        reason,
        amountUsd: 0,
        decision: "approved",
        denialReason: "Resource did not require payment (status was not 402)."
      },
      responseStatus: initialResponse.status,
      responseBody: await safeReadBody(initialResponse)
    };
  }

  const paymentRequired = await parsePaymentRequired(initialResponse);
  const requirement = selectPaymentRequirement(paymentRequired.accepts, PREFERRED_NETWORK);
  const amountUsd = atomicAmountToUsd(requirement.maxAmountRequired, ASSET_DECIMALS);

  const limitCheck = spendLimitTracker.check(amountUsd);
  if (!limitCheck.allowed) {
    const decision = await recordDecision({
      resource: resourceUrl,
      reason,
      amountUsd,
      decision: "denied",
      denialReason: limitCheck.reason
    });
    // Hard stop. No signing attempted, no wallet touched.
    return { decision, error: limitCheck.reason };
  }

  const { account, walletClient } = loadAgentWallet();
  const authorization = buildAuthorization(requirement, account.address);
  const signature = await signAuthorization(walletClient, account, requirement, authorization);

  const paymentHeader = encodePaymentHeader({
    x402Version: paymentRequired.x402Version,
    scheme: requirement.scheme,
    network: requirement.network,
    payload: { signature, authorization }
  });

  const paidResponse = await fetch(resourceUrl, {
    headers: { "X-PAYMENT": paymentHeader }
  });

  // Only record the spend against the session limit once we've actually
  // sent the signed payment — not before.
  spendLimitTracker.recordSpend(amountUsd);

  const decision = await recordDecision({
    resource: resourceUrl,
    reason,
    amountUsd,
    decision: "approved",
    txSignature: signature
  });

  return {
    decision,
    responseStatus: paidResponse.status,
    responseBody: await safeReadBody(paidResponse)
  };
}

async function safeReadBody(response: Response): Promise<unknown> {
  try {
    return await response.clone().json();
  } catch {
    try {
      return await response.text();
    } catch {
      return undefined;
    }
  }
}
