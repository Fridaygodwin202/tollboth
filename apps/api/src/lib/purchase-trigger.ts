import { checkMarketViaAgentOsMcp } from "./binance-agent-os.js";
import { checkMarketViaPublicRest } from "./public-market-data.js";

export interface MarketTriggerResult {
  source: "agent-os-mcp" | "binance-public-rest";
  shouldBuy: boolean;
  reason: string;
  detail: unknown;
}

/**
 * Tries the real Binance Agent OS MCP server first (the literal Track A
 * product). If that fails for any reason — untested headless auth,
 * network issue, wrong tool heuristic — falls back to Binance's public
 * REST API so there's still real, live Binance data behind the decision
 * either way. Never silently returns fabricated data: if both sources
 * fail, this throws rather than inventing a number.
 */
export async function checkMarketTrigger(
  symbol: string,
  thresholdPct: number
): Promise<MarketTriggerResult> {
  const mcpResult = await checkMarketViaAgentOsMcp(symbol);

  if (!mcpResult.error && mcpResult.raw) {
    // MCP succeeded, but we don't know the real response shape yet (see
    // binance-agent-os.ts's honesty notes) — surface it raw rather than
    // guessing a field name, and let a human confirm the shape once seen.
    return {
      source: "agent-os-mcp",
      shouldBuy: false,
      reason:
        `Connected to Binance Agent OS MCP and called "${mcpResult.toolUsed}", ` +
        "but this code doesn't yet know how to parse its response shape " +
        "(see raw detail). Once you've seen a real response, tell me the " +
        "shape and I'll wire up the actual threshold check.",
      detail: mcpResult
    };
  }

  // Fall back to the guaranteed-working public REST API.
  const restResult = await checkMarketViaPublicRest(symbol);
  const movedPct = Math.abs(restResult.priceChangePercent);
  const shouldBuy = movedPct >= thresholdPct;

  return {
    source: "binance-public-rest",
    shouldBuy,
    reason: shouldBuy
      ? `${symbol} moved ${movedPct.toFixed(2)}% in 24h (>= ${thresholdPct}% threshold) — ` +
        `checking the premium signal. (Agent OS MCP attempt: ${mcpResult.error})`
      : `${symbol} only moved ${movedPct.toFixed(2)}% in 24h (< ${thresholdPct}% threshold) — ` +
        `not worth paying for the premium signal right now. (Agent OS MCP attempt: ${mcpResult.error})`,
    detail: restResult
  };
}
