import { recoverTypedDataAddress } from "viem";
import { bscTestnet } from "viem/chains";
import type { X402PaymentPayload, X402PaymentRequirements } from "@tollbooth/types";

/**
 * MOCK FACILITATOR — NOT REAL B402 SETTLEMENT.
 *
 * This performs genuine EIP-712 signature verification (recovering the
 * signer's address via pure cryptography, no RPC call needed for a plain
 * EOA) — that part is real. What it does NOT do is call Binance's B402
 * `/verify` and `/settle` endpoints, or move any real funds on-chain.
 * Real settlement requires a partner developer account we don't have (see
 * RESEARCH_BRIEF.md). Every response from this module must stay labeled as
 * simulated wherever it surfaces — API responses, the dashboard UI, and the
 * demo video/README.
 */
export async function verifyPayment(
  requirements: X402PaymentRequirements,
  payload: X402PaymentPayload
): Promise<{ valid: boolean; reason?: string; recoveredAddress?: string }> {
  const { authorization, signature } = payload.payload;

  const domainName = requirements.extra?.name as string | undefined;
  const domainVersion = requirements.extra?.version as string | undefined;
  if (!domainName || !domainVersion) {
    return { valid: false, reason: "Payment requirement missing extra.name/version." };
  }

  let recoveredAddress: string;
  try {
    recoveredAddress = await recoverTypedDataAddress({
      domain: {
        name: domainName,
        version: domainVersion,
        chainId: bscTestnet.id,
        verifyingContract: requirements.asset as `0x${string}`
      },
      types: {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" }
        ]
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: authorization.from as `0x${string}`,
        to: authorization.to as `0x${string}`,
        value: BigInt(authorization.value),
        validAfter: BigInt(authorization.validAfter),
        validBefore: BigInt(authorization.validBefore),
        nonce: authorization.nonce as `0x${string}`
      },
      signature: signature as `0x${string}`
    });
  } catch (err) {
    return {
      valid: false,
      reason: `Signature recovery failed: ${err instanceof Error ? err.message : String(err)}`
    };
  }

  if (recoveredAddress.toLowerCase() !== authorization.from.toLowerCase()) {
    return {
      valid: false,
      reason: "Recovered signer does not match the authorization's `from` address.",
      recoveredAddress
    };
  }

  if (authorization.to.toLowerCase() !== requirements.payTo.toLowerCase()) {
    return { valid: false, reason: "Authorization `to` does not match payTo.", recoveredAddress };
  }

  if (BigInt(authorization.value) < BigInt(requirements.maxAmountRequired)) {
    return { valid: false, reason: "Authorized value is less than required.", recoveredAddress };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec < Number(authorization.validAfter) || nowSec > Number(authorization.validBefore)) {
    return { valid: false, reason: "Authorization is outside its valid time window.", recoveredAddress };
  }

  return { valid: true, recoveredAddress };
}
