import { createMCPClient } from "@ai-sdk/mcp";
import { env } from "../env.ts";
import { promptMessagesToInstructions } from "./agent.utils";

export type MCPClient = Awaited<ReturnType<typeof createMCPClient>>;

/**
 * Single shared MCP connection for the process.
 *
 * This is a long-running service, so one persistent connection to the MCP
 * server is reused across requests (the AI SDK's "close per request" advice is
 * for short-lived/serverless usage). Connection is lazy and awaitable — never
 * created in a constructor — so callers always get a ready client.
 *
 * Owning connect/close here keeps the MCP transport + auth in one place; the
 * agent, RAG ingestion, resource reads, and future channels all share it.
 */
let client: MCPClient | undefined;

/** Lazily connect (idempotent) and return the shared MCP client. */
export async function getMcpClient(): Promise<MCPClient> {
  if (!client) {
    client = await createMCPClient({
      transport: {
        type: "http",
        url: env.MCP_SERVER_URL,
        headers: { "X-Internal-Token": env.MCP_INTERNAL_TOKEN },
      },
    });
  }
  return client;
}

/** Close the shared connection (call on shutdown). */
export async function closeMcpClient(): Promise<void> {
  await client?.close();
  client = undefined;
}

/**
 * Get the MCP tools via the shared client, optionally restricted to an
 * allowlist of tool names (client-side scoping). Pass `undefined`/empty to
 * expose the full catalog. The agent never sees tools outside the allowlist,
 * so it cannot call them.
 */
export async function getMcpTools(
  allowed?: string[],
): Promise<Awaited<ReturnType<MCPClient["tools"]>>> {
  const mcp = await getMcpClient();
  const all = await mcp.tools();
  if (!allowed?.length) return all;
  const entries = Object.entries(all).filter(([name]) => allowed.includes(name));
  return Object.fromEntries(entries) as typeof all;
}

/** Helper to get a prompt by name via the shared client, converting to instructions. */
export async function getMcpPrompt(name: string): Promise<string> {
  const mcp = await getMcpClient();
  const prompt = await mcp.experimental_getPrompt({ name });
  return promptMessagesToInstructions(prompt.messages);
}
