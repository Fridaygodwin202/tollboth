# Deploy pipeline (stub — not connected to a live deployment yet)

Per the build ruleset's default stack:

- **apps/web** → Vercel. `apps/web/vercel.json` points the build at the
  monorepo root so Turborepo can resolve workspace packages. Not yet linked
  to a Vercel project.
- **apps/api** → Railway / Render / Fly (pick one; not yet decided or
  provisioned). Needs a `Dockerfile` or platform-native build config once a
  target is chosen — deferred until it's actually needed for the demo.

No live deployment exists yet. This is intentionally deferred past Session 1;
wiring it up for real is a candidate for a later session once there's
something worth deploying.
