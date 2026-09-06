import { createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";

/**
 * Loads the agent's own wallet — the BUYER's wallet, used to sign x402
 * payment authorizations. This is intentionally separate from any Binance
 * account credentials; it's a plain EOA private key.
 *
 * Hard-gated to testnet: refuses to start if AGENT_OS_MODE isn't "testnet",
 * per ruleset Section 9.2. There is no mainnet path in this session at all.
 */
export function loadAgentWallet() {
  const mode = process.env.AGENT_OS_MODE;
  if (mode !== "testnet") {
    throw new Error(
      `AGENT_OS_MODE is "${mode}", expected "testnet". This session only ` +
        "implements the testnet buyer flow — refusing to load a wallet " +
        "outside that scope rather than silently proceeding."
    );
  }

  const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "AGENT_WALLET_PRIVATE_KEY is not set in apps/api/.env. Generate a " +
        "fresh testnet-only key (never reuse a real-funds key), fund it " +
        "from a BNB Smart Chain testnet faucet, and set it there."
    );
  }

  const account = privateKeyToAccount(privateKey as Hex);

  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http()
  });

  return { account, walletClient };
}
