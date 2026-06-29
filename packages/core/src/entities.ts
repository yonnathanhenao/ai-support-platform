import { z } from "zod";

/**
 * Core domain entities for the AI Support Platform.
 *
 * Multi-tenancy: every tenant-scoped entity carries `orgId`. We run a single
 * org at runtime for now, but the schema never has to migrate to go multi-org.
 */

export const MessageRole = z.enum(["user", "assistant", "system", "tool"]);
export type MessageRole = z.infer<typeof MessageRole>;

export const TicketStatus = z.enum(["open", "pending", "resolved", "closed"]);
export type TicketStatus = z.infer<typeof TicketStatus>;

export const Organization = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
});
export type Organization = z.infer<typeof Organization>;

/**
 * Per-org/per-persona agent configuration — the "agent definition" bundle.
 * Selects from the MCP server's catalog (which prompt = tone, which tools)
 * rather than duplicating capability logic. Same shape as the industry-standard
 * agent object (model + system/persona + tools + guardrails).
 */
export const AgentConfig = z.object({
  orgId: z.string(),
  /** Anthropic model id consumed by the AI SDK provider. */
  model: z.string(),
  /** Name of the MCP prompt to load as the agent's persona/tone instructions. */
  promptName: z.string(),
  /** Allowlist of MCP tool names this agent may use; empty = all tools. */
  enabledTools: z.array(z.string()).min(1),
  /** Hard cap on agent-loop steps to bound cost. */
  maxSteps: z.number().int().positive().default(10),
});
export type AgentConfig = z.infer<typeof AgentConfig>;

/** Default agent definition for an org (used until configs are persisted in DB). */
export function defaultAgentConfig(orgId: string): AgentConfig {
  return AgentConfig.parse({
    orgId,
    model: "claude-sonnet-4-6",
    promptName: "support_agent",
    enabledTools: [
      "search_knowledge",
      "escalate_to_human",
      "get_conversation_history",
    ],
  });
}

export const Contact = z.object({
  id: z.string(),
  orgId: z.string(),
  externalId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});
export type Contact = z.infer<typeof Contact>;

export const Operator = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type Operator = z.infer<typeof Operator>;

export const Conversation = z.object({
  id: z.string(),
  orgId: z.string(),
  contactId: z.string().optional(),
  channel: z.literal("web").default("web"),
  status: z.enum(["active", "escalated", "closed"]).default("active"),
  createdAt: z.string().datetime(),
});
export type Conversation = z.infer<typeof Conversation>;

export const Message = z.object({
  id: z.string(),
  orgId: z.string(),
  conversationId: z.string(),
  role: MessageRole,
  content: z.string(),
  createdAt: z.string().datetime(),
});
export type Message = z.infer<typeof Message>;

export const Document = z.object({
  id: z.string(),
  orgId: z.string(),
  title: z.string(),
  source: z.string().optional(),
});
export type Document = z.infer<typeof Document>;

/** A retrievable chunk of a Document; `embedding` lives in pgvector. */
export const Chunk = z.object({
  id: z.string(),
  orgId: z.string(),
  documentId: z.string(),
  content: z.string(),
});
export type Chunk = z.infer<typeof Chunk>;

export const Ticket = z.object({
  id: z.string(),
  orgId: z.string(),
  conversationId: z.string(),
  reason: z.string(),
  status: TicketStatus.default("open"),
  createdAt: z.string().datetime(),
});
export type Ticket = z.infer<typeof Ticket>;
