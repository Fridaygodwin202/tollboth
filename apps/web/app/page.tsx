import Link from "next/link";
import { HealthCheck } from "./health-check";

export default function HomePage() {
  return (
    <main>
      <h1>TollBooth</h1>
      <p>
        Core infrastructure scaffold — Session 1. The agent&apos;s payment
        skill, mock seller, and decision log land in later sessions per{" "}
        <code>BUILD_ROADMAP.md</code>.
      </p>
      <p>
        <Link href="/sign-up">Sign up</Link> ·{" "}
        <Link href="/sign-in">Sign in</Link>
      </p>
      <HealthCheck />
    </main>
  );
}
