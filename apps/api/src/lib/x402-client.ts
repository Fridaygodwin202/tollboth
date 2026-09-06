import { randomBytes } from "node:crypto";
import type { WalletClient, Account } from "viem";
import type {
  X402PaymentRequiredResponse,
  X402PaymentRequirements,
  X402PaymentPayload,
  Eip3009Authorization
} from "@tollbooth/types";

/** Parses a 402 response body into the x402 accepts[] shape. Throws if malformed. */
export async function parsePaymentRequired(
  response: Response
): Promise<X402PaymentRequiredResponse> {
  const body = await response.json();
  if (!body || !Array.isArray(body.accepts) || body.accepts.length === 0) {
    throw new Error(
      "Response had status 402 but body did not match the expected x402 " +
        "shape (missing/empty `accepts` array). Refusing to guess a payment " +
        "requirement — treating this as a blocker, not routing around it."
    );
  }
  return body as X402PaymentRequiredResponse;
}

/** Picks the first requirement matching the network we're configured to pay on. */
export function selectPaymentRequirement(
  accepts: X402PaymentRequirements[],
  preferredNetwork: string
): X402PaymentRequirements {
  const match = accepts.find((r) => r.network === preferredNetwork);
  if (!match) {
    const available = accepts.map((r) => r.network).join(", ");
    throw new Error(
      `No payment requirement for network "${preferredNetwork}". ` +
        `Server offered: ${available}. Refusing to pay on an unconfigured ` +
        "network rather than guessing."
    );
  }
  return match;
}

/** Converts an atomic-unit amount (per the asset's decimals) to a USD float for spend-limit checks. */
export function atomicAmountToUsd(
  maxAmountRequired: string,
  assetDecimals: number
): number {
  // Assumes the asset is a USD-pegged stablecoin (1 unit ≈ $1), which holds
  // for USDC/USDT-style assets. If a non-USD-pegged asset is ever used, this
  // conversion needs a real price feed — flagged rather than silently wrong.
  const atomic = BigInt(maxAmountRequired);
  const divisor = 10 ** assetDecimals;
  return Number(atomic) / divisor;
}

function randomHex32(): `0x${string}` {
  return `0x${randomBytes(32).toString("hex")}`;
}

/** Builds the EIP-3009 authorization message (unsigned) for a given requirement. */
export function buildAuthorization(
  requirements: X402PaymentRequirements,
  fromAddress: `0x${string}`
): Eip3009Authorization {
  const nowSec = Math.floor(Date.now() / 1000);
  return {
    from: fromAddress,
    to: requirements.payTo,
    value: requirements.maxAmountRequired,
    validAfter: String(nowSec - 60), // small backdate to tolerate clock skew
    validBefore: String(nowSec + requirements.maxTimeoutSeconds),
    nonce: randomHex32()
  };
}

/**
 * Signs the EIP-3009 TransferWithAuthorization typed data.
 *
 * Domain name/version come from `requirements.extra` — this is standard for
 * x402 implementations, since those values are specific to the asset
 * contract's own EIP-712 domain and can't be assumed. If a resource server
 * doesn't provide them, this throws rather than guessing a value that would
 * produce a signature the (real) contract would reject.
 */
export async function signAuthorization(
  walletClient: WalletClient,
  account: Account,
  requirements: X402PaymentRequirements,
  authorization: Eip3009Authorization
): Promise<`0x${string}`> {
  const domainName = requirements.extra?.name as string | undefined;
  const domainVersion = requirements.extra?.version as string | undefined;

  if (!domainName || !domainVersion) {
    throw new Error(
      "Payment requirement is missing extra.name / extra.version needed " +
        "for the EIP-712 domain. Cannot sign a valid authorization without " +
        "them — this must come from the resource server's 402 response."
    );
  }

  const chainId = await walletClient.getChainId();

  return walletClient.signTypedData({
    account,
    domain: {
      name: domainName,
      version: domainVersion,
      chainId,
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
    }
  });
}

/** Base64-encodes the payment payload for the X-PAYMENT header, per the x402 spec. */
export function encodePaymentHeader(payload: X402PaymentPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/** Inverse of encodePaymentHeader — used by our own mock seller (Session 3) and by tests. */
export function decodePaymentHeader(header: string): X402PaymentPayload {
  return JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
}
