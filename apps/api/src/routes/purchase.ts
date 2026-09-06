import type { FastifyInstance } from "fastify";
import { purchaseResource } from "../lib/payment-skill.js";
import { listDecisions } from "../lib/decision-log.js";
import { SpendLimitTracker, loadSpendLimitConfigFromEnv } from "../lib/spend-limit.js";

// One tracker per server process, shared across requests, so the session
// spend cap actually accumulates across multiple purchases — not reset
// per-request, which would make the "session limit" meaningless.
const spendLimitTracker = new SpendLimitTracker(loadSpendLimitConfigFromEnv());

interface PurchaseBody {
  resourceUrl?: string;
  reason?: string;
}

export async function purchaseRoutes(app: FastifyInstance) {
  app.post<{ Body: PurchaseBody }>("/purchase", async (request, reply) => {
    const { resourceUrl, reason } = request.body ?? {};

    if (!resourceUrl || !reason) {
      reply.code(400);
      return { error: "Both resourceUrl and reason are required." };
    }

    try {
      const result = await purchaseResource(resourceUrl, reason, spendLimitTracker);
      return result;
    } catch (err) {
      app.log.error(err);
      reply.code(502);
      return {
        error: err instanceof Error ? err.message : "Unknown error during purchase."
      };
    }
  });

  app.get("/decisions", async () => {
    return listDecisions();
  });

  app.get("/spend-limit", async () => {
    return {
      config: spendLimitTracker.getConfig(),
      sessionSpentUsd: spendLimitTracker.getSessionSpentUsd()
    };
  });
}
