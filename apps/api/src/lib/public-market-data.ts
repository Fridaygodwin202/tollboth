/**
 * Fallback market data source: Binance's standard public Spot REST API
 * (api.binance.com), not the Agent OS MCP server specifically. This is
 * NOT "Agent OS" — it's Binance's long-standing public market-data API —
 * but it is a real, live call to Binance, with zero auth and no
 * uncertainty about headless access. Used when the Agent OS MCP attempt
 * (binance-agent-os.ts) fails, so the demo still has genuine live data
 * driving the agent's decision either way.
 */

export interface PublicMarketCheckResult {
  source: "binance-public-rest";
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
}

export async function checkMarketViaPublicRest(symbol: string): Promise<PublicMarketCheckResult> {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`
  );

  if (!res.ok) {
    throw new Error(`Binance public REST API returned ${res.status} for ${symbol}.`);
  }

  const body = (await res.json()) as { lastPrice?: unknown; priceChangePercent?: unknown };

  if (body.lastPrice === undefined || body.priceChangePercent === undefined) {
    throw new Error(
      `Binance public REST API response for ${symbol} didn't include lastPrice/priceChangePercent - ` +
        "response shape may have changed."
    );
  }

  return {
    source: "binance-public-rest",
    symbol,
    lastPrice: Number(body.lastPrice),
    priceChangePercent: Number(body.priceChangePercent)
  };
}
