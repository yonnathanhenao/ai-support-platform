import { z } from "zod";

/**
 * Environment for the MCP server. It owns the catalog of tools/resources/
 * prompts and never calls the LLM, so it does NOT require ANTHROPIC_API_KEY.
 *
 * Self-contained: schema + validation live here. Validated once at import time
 * so a missing/invalid variable fails fast at startup.
 */
const envSchema = z.object({
  /** Port the Streamable-HTTP MCP endpoint listens on. */
  MCP_SERVER_PORT: z.coerce.number().int().positive().default(8787),
  /** Shared secret required on every /mcp request (X-Internal-Token). */
  MCP_INTERNAL_TOKEN: z.string().min(1),
  /** Org whose catalog this server exposes (single-org runtime). */
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
