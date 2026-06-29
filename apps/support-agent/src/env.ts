import { z } from "zod";

/**
 * Environment for the support-agent service: the AI Engine (calls the LLM) and
 * the chat API. It consumes the MCP server as a client, so it needs the MCP
 * URL + token, but NOT the MCP server's listen port.
 *
 * Self-contained: schema + validation live here. Validated once at import time
 * so a missing/invalid variable fails fast at startup.
 */
const envSchema = z.object({
  /** Anthropic API key for the AI SDK provider. */
  ANTHROPIC_API_KEY: z.string().min(1),
  /** URL of the MCP server (source of truth for tools/resources/prompts). */
  MCP_SERVER_URL: z.string().url().default("http://localhost:8787/mcp"),
  /** Shared secret sent on MCP requests (X-Internal-Token). */
  MCP_INTERNAL_TOKEN: z.string().min(1),
  /** Port the chat API (Elysia) listens on. */
  SUPPORT_AGENT_PORT: z.coerce.number().int().positive().default(3001),
  /** Org this agent serves (single-org runtime). */
  ORG_ID: z.string().min(5),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
