"use client";

import { useEffect, useState } from "react";
import { Button } from "@tollbooth/ui";

/**
 * Optional wallet connect. This is purely a "who's looking at this" identity
 * affordance for a visitor's own browser wallet — it is NOT the agent's own
 * wallet (that's a separate server-side key in apps/api, used to actually
 * sign x402 payments). Nothing in the app is gated behind this; it's fine
 * to never click it.
 */

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Best-effort check for an already-authorized connection — this does
    // NOT prompt the user, it only reads accounts already granted in a
    // past session.
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list.length > 0) setAddress(list[0]);
      })
      .catch(() => {
        // Silently ignore — this is a best-effort check, not a real error.
      });
  }, []);

  async function connect() {
    setError(null);
    if (!window.ethereum) {
      setError("No browser wallet found (optional — everything else still works).");
      return;
    }
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts"
      })) as string[];
      setAddress(accounts[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection was declined.");
    }
  }

  if (address) {
    return (
      <Button variant="quiet" onClick={() => setAddress(null)}>
        {address.slice(0, 6)}…{address.slice(-4)}
      </Button>
    );
  }

  return (
    <span>
      <Button variant="quiet" onClick={connect}>
        Connect wallet
      </Button>
      {error && <span className="mono-note"> {error}</span>}
    </span>
  );
}
