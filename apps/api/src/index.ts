import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.js";
import { purchaseRoutes } from "./routes/purchase.js";
import { mockSellerRoutes } from "./routes/mock-seller.js";
import { agentOsRoutes } from "./routes/agent-os.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(healthRoutes);
await app.register(purchaseRoutes);
await app.register(mockSellerRoutes);
await app.register(agentOsRoutes);

const port = Number(process.env.PORT ?? 4000);

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`apps/api listening on :${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
