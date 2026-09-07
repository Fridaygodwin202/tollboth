/**
 * BEST-EFFORT real integration with Binance's actual Agent OS MCP server
 * (https://agent.binance.com/mcp/agentic) — the literal product Track A
 * is named after. This is the one piece of the whole build that makes a
 * real call to Binance-hosted infrastructure.
 *
 * Honesty flags, stated once here rather than scattered:
 * 1. Binance's own docs only document connecting via interactive AI clients
 *    (Claude Code, Claude Desktop, ChatGPT) with an OAuth consent flow —
 *    there is no documented pattern for a plain headless Node server like
 *    this one. This code is a best-effort attempt at a direct MCP client
 *    connection; it may simply not be permitted without going through that
 *    OAuth flow, in which case it will fail and the caller falls back to
 *    Binance's public REST API instead (see public-market-data.ts).
 * 2. Exact MCP tool names/schemas for the market-data scope are not
 *    published anywhere I could find — this code discovers them at
 *    runtime via tools/list rather than guessing a hardcoded tool name,
 *    and picks a tool by heuristic name/description matching. If that
 *    heuristic picks the wrong tool, the full discovered tool list is
 *    still returned so this can be corrected with real information.
 * 3. The @modelcontextprotocol/sdk import paths/method names below are
 *    written from general knowledge of the SDK's shape and have not been
 *    verified against an installed copy (no network in this build
 *    environment) — treat this as unverified until it actually runs.
 */

const AGENT_OS_MCP_URL = process.env.AGENT_OS_MCP_URL ?? "https://agent.binance.com/mcp/agentic";

/** Minimal shape we actually use from the SDK's Tool type - kept local so
 * this still type-checks even if the SDK's own types aren't resolved. */
interface DiscoveredTool {
  name: string;
  description?: string;
}

export interface AgentOsMarketCheckResult {
  source: "agent-os-mcp";
  toolsDiscovered: string[];
  toolUsed?: string;
  raw?: unknown;
  error?: string;
}

export async function checkMarketViaAgentOsMcp(
  symbol: string
): Promise<AgentOsMarketCheckResult> {
  try {
    // Dynamic import so a missing/incompatible SDK doesn't crash the whole
    // server at boot — this path is allowed to fail gracefully.
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    const { StreamableHTTPClientTransport } = await import(
      "@modelcontextprotocol/sdk/client/streamableHttp.js"
    );

    const transport = new StreamableHTTPClientTransport(new URL(AGENT_OS_MCP_URL));
    const client = new Client({ name: "tollbooth-agent", version: "0.1.0" });

    await client.connect(transport);

    const { tools } = (await client.listTools()) as { tools: DiscoveredTool[] };
    const toolsDiscovered = tools.map((t: DiscoveredTool) => t.name);

    const marketTool = tools.find((t: DiscoveredTool) =>
      /ticker|market|price|quote/i.test(`${t.name} ${t.description ?? ""}`)
    );

    if (!marketTool) {
      await client.close();
      return {
        source: "agent-os-mcp",
        toolsDiscovered,
        error:
          "Connected, but no tool name/description matched a market-data " +
          "heuristic. See toolsDiscovered for the real list and adjust the " +
          "match in binance-agent-os.ts."
      };
    }

    const result = await client.callTool({
      name: marketTool.name,
      arguments: { symbol }
    });

    await client.close();

    return {
      source: "agent-os-mcp",
      toolsDiscovered,
      toolUsed: marketTool.name,
      raw: result
    };
  } catch (err) {
    return {
      source: "agent-os-mcp",
      toolsDiscovered: [],
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
