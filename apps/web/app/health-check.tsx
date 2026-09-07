"use client";

import { useEffect, useState } from "react";
import { Button } from "@tollbooth/ui";
import type { HealthStatus } from "@tollbooth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Exercises the full Session 1 wiring on purpose: apps/web calling apps/api,
 * typed with the shared @tollbooth/types package, styled with the shared
 * @tollbooth/ui package. This is the concrete, checkable proof that the
 * monorepo links up — not just four packages that happen to sit near each
 * other.
 */
export function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkHealth() {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/health`);
      const data: HealthStatus = await res.json();
      setHealth(data);
    } catch (err) {
      setError(
        `Could not reach apps/api at ${API_URL}. Is it running? (${
          err instanceof Error ? err.message : String(err)
        })`
      );
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <section>
      <h2>apps/api connectivity</h2>
      {health && (
        <p>
          Status: <strong>{health.status}</strong> as of {health.timestamp}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <Button variant="quiet" onClick={checkHealth}>
        Re-check
      </Button>
    </section>
  );
}
