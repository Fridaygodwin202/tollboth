import Link from "next/link";
import { Button } from "@tollbooth/ui";
import { HealthCheck } from "./health-check";

export default function HomePage() {
  return (
    <main>
      <h1>An agent that pays its own way through the gate.</h1>
      <p>
        When this agent decides it needs a premium data source mid-analysis,
        it doesn&apos;t stop and ask for an API key. It pays for it — via
        Binance x402 — on the spot, and it can never spend past the budget
        it was given, because that limit is enforced in code, not in a
        prompt.
      </p>
      <p>
        No sign-up needed — the ledger below is open to anyone.
      </p>
      <p>
        <Link href="/dashboard">
          <Button>See the ledger</Button>
        </Link>
      </p>
      <HealthCheck />
    </main>
  );
}
