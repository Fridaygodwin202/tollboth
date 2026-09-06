import type { FastifyInstance } from "fastify";
import type { X402PaymentRequirements, X402PaymentPayload } from "@tollbooth/types";
import { usdToAtomicAmount, decodePaymentHeader } from "../lib/x402-client.js";
import { verifyPayment } from "../lib/mock-facilitator.js";

const NETWORK = process.env.X402_PREFERRED_NETWORK ?? "bsc-testnet";
const ASSET_DECIMALS = Number(process.env.X402_ASSET_DECIMALS ?? 6);
const PRICE_USD = Number(process.env.MOCK_SELLER_PRICE_USD ?? 0.5);

function buildRequirements(): X402PaymentRequirements {
  const payTo = process.env.MOCK_SELLER_PAYOUT_ADDRESS;
  const asset = process.env.X402_MOCK_ASSET_ADDRESS;
  if (!payTo || !asset) {
    throw new Error(
      "MOCK_SELLER_PAYOUT_ADDRESS and X402_MOCK_ASSET_ADDRESS must be set in " +
        "apps/api/.env — refusing to invent placeholder addresses, since a " +
        "wrong domain/verifyingContract would make every signature check fail " +
        "silently for the wrong reason."
    );
  }

  return {
    scheme: "exact",
    network: NETWORK,
    maxAmountRequired: usdToAtomicAmount(PRICE_USD, ASSET_DECIMALS),
    resource: "/mock-seller/premium-data",
    description:
      "SIMULATED premium market signal — MOCK SELLER, not a real Binance-verified merchant. No real settlement occurs.",
    mimeType: "application/json",
    payTo,
    maxTimeoutSeconds: 300,
    asset,
    extra: {
      name: "TollBoothMockUSD",
      version: "1",
      mock: true
    }
  };
}

export async function mockSellerRoutes(app: FastifyInstance) {
  app.get("/mock-seller/premium-data", async (request, reply) => {
    const paymentHeader = request.headers["x-payment"];

    if (!paymentHeader || typeof paymentHeader !== "string") {
      reply.code(402);
      return {
        x402Version: 1,
        accepts: [buildRequirements()],
        error: "Payment required. This is a MOCK seller — no real funds move."
      };
    }

    let payload: X402PaymentPayload;
    try {
      payload = decodePaymentHeader(paymentHeader);
    } catch {
      reply.code(400);
      return { error: "X-PAYMENT header was not valid base64 JSON." };
    }

    const requirements = buildRequirements();
    const result = await verifyPayment(requirements, payload);

    if (!result.valid) {
      reply.code(402);
      return {
        x402Version: 1,
        accepts: [requirements],
        error: `Payment verification failed (mock): ${result.reason}`
      };
    }

    reply.code(200);
    return {
      mock: true,
      disclaimer:
        "SIMULATED settlement — signature was cryptographically verified, " +
        "but no real B402 /settle call was made and no funds actually moved.",
      verifiedFrom: result.recoveredAddress,
      data: {
        signal: "BTC/USDT 4h momentum: mildly bullish (mock data)",
        generatedAt: new Date().toISOString()
      }
    };
  });
}
