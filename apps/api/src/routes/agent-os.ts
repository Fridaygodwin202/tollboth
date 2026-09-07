import type { FastifyInstance } from "fastify";
import { checkMarketTrigger } from "../lib/purchase-trigger.js";

const DEFAULT_SYMBOL = process.env.AGENT_OS_CHECK_SYMBOL ?? "BTCUSDT";
const DEFAULT_THRESHOLD = Number(process.env.AGENT_OS_VOLATILITY_THRESHOLD_PCT ?? 1);

export async function agentOsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { symbol?: string; threshold?: string } }>(
    "/agent-os/check",
    async (request, reply) => {
      const symbol = request.query.symbol ?? DEFAULT_SYMBOL;
      const threshold = request.query.threshold
        ? Number(request.query.threshold)
        : DEFAULT_THRESHOLD;

      try {
        const result = await checkMarketTrigger(symbol, threshold);
        return result;
      } catch (err) {
        app.log.error(err);
        reply.code(502);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Both Agent OS MCP and the public REST fallback failed."
        };
      }
    }
  );
}
