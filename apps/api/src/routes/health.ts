import type { FastifyInstance } from "fastify";
import type { HealthStatus } from "@tollbooth/types";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (): Promise<HealthStatus> => {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  });
}
