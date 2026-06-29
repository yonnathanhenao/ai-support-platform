import { z } from 'zod';
import type { Message, Ticket } from './entities.ts';
import { store } from './store.ts';

/**
 * Capabilities = the platform's business logic, as pure(ish) typed functions.
 *
 * This module is the SINGLE SOURCE OF TRUTH for what the agent can do. The MCP
 * server (apps/mcp-server) wraps each of these as an MCP tool; nothing here
 * knows about MCP, Elysia, or the AI SDK, so it stays testable in isolation.
 *
 * Each capability exports its Zod input schema so the MCP adapter reuses the
 * exact same contract instead of re-declaring it.
 */

// --- searchKnowledge (RAG entry point) -------------------------------------

export const searchKnowledgeInput = z.object({
  query: z.string().min(1).describe('What the customer is asking about.'),
  limit: z.number().int().positive().max(10).default(3),
});
export type SearchKnowledgeInput = z.infer<typeof searchKnowledgeInput>;

export interface KnowledgeHit {
  documentId: string;
  title: string;
  snippet: string;
}

/**
 * Retrieve relevant knowledge-base snippets for an org.
 *
 * NOTE: in-memory keyword stub for the vertical slice. The RAG iteration
 * replaces the body with pgvector similarity search (see packages/db); the
 * signature and return shape stay the same so the MCP tool doesn't change.
 */
export function searchKnowledge(orgId: string, input: SearchKnowledgeInput): KnowledgeHit[] {
  const terms = input.query.toLowerCase().split(/\s+/).filter(Boolean);
  return store
    .knowledgeFor(orgId)
    .map((doc) => {
      const haystack = `${doc.title} ${doc.content}`.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
      return { doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, input.limit)
    .map((r) => ({ documentId: r.doc.id, title: r.doc.title, snippet: r.doc.content }));
}

// --- escalateToHuman --------------------------------------------------------

export const escalateToHumanInput = z.object({
  conversationId: z.string().describe('Conversation that needs a human.'),
  reason: z.string().min(1).describe('Why the agent is escalating.'),
});
export type EscalateToHumanInput = z.infer<typeof escalateToHumanInput>;

/** Mark a conversation as escalated and open a ticket. Terminates the loop. */
export function escalateToHuman(orgId: string, input: EscalateToHumanInput): Ticket {
  store.setConversationStatus(orgId, input.conversationId, 'escalated');
  return store.createTicket(orgId, input.conversationId, input.reason);
}

// --- createTicket -----------------------------------------------------------

export const createTicketInput = z.object({
  conversationId: z.string(),
  reason: z.string().min(1).describe('Summary of what the ticket is about.'),
});
export type CreateTicketInput = z.infer<typeof createTicketInput>;

export function createTicket(orgId: string, input: CreateTicketInput): Ticket {
  return store.createTicket(orgId, input.conversationId, input.reason);
}

// --- getConversationHistory -------------------------------------------------

export const getConversationHistoryInput = z.object({
  conversationId: z.string(),
});
export type GetConversationHistoryInput = z.infer<typeof getConversationHistoryInput>;

export function getConversationHistory(
  orgId: string,
  input: GetConversationHistoryInput,
): Message[] {
  return store.messagesFor(orgId, input.conversationId);
}
