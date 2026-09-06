/**
 * Placeholder shared primitive. Intentionally unstyled — the token system,
 * component theming, and signature element are a UI-touching session's job
 * (see AGENT_BUILD_RULESET.md Section 8), not this infra session's.
 */
import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
