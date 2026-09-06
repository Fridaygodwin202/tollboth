/**
 * Generic, theme-agnostic shared types.
 * Payment/agent-specific types are intentionally NOT added here yet —
 * that's Session 2+ work per the build ruleset's infra-before-theme rule.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
}
