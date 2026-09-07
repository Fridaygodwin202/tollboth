/**
 * Shared UI primitives. Styled per the toll-plaza design system defined in
 * apps/web/app/globals.css (design tokens as CSS variables) — this package
 * has no CSS of its own, it relies on the host app's globals being loaded,
 * since there's no shared stylesheet mechanism set up for the monorepo yet.
 */
import type { ButtonHTMLAttributes, CSSProperties } from "react";

type ButtonVariant = "primary" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseStyle: CSSProperties = {
  fontFamily: "var(--font-body, system-ui, sans-serif)",
  fontWeight: 500,
  fontSize: "0.95rem",
  padding: "0.55rem 1.1rem",
  border: "none",
  cursor: "pointer"
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--toll-amber, #f2a93b)",
    color: "var(--ink, #1c1a16)"
  },
  quiet: {
    background: "transparent",
    color: "var(--paper, #f3f0e8)",
    border: "1px solid var(--paper-shadow, #e4e0d4)"
  }
};

export function Button({ variant = "primary", style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        opacity: props.disabled ? 0.6 : 1,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...style
      }}
    />
  );
}
