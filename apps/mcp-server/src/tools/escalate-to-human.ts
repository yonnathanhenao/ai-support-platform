import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { escalateToHuman, escalateToHumanInput } from '@platform/core';

/**
 * escalate_to_human — opens a ticket and marks the conversation escalated.
 * The agent calls this when it cannot resolve the request or the customer
 * explicitly asks for a person.
 */
export function registerEscalateToHuman(server: McpServer, orgId: string): void {
  server.registerTool(
    'escalate_to_human',
    {
      title: 'Escalar a un humano',
      description:
        'Escala la conversación a un agente humano y crea un ticket. Úsala cuando no puedas resolver el problema, el cliente lo pida, o detectes frustración o un asunto sensible.',
      inputSchema: escalateToHumanInput.shape,
    },
    async (args) => {
      try {
        const ticket = escalateToHuman(orgId, args);
        return {
          content: [
            {
              type: 'text',
              text: `He escalado tu caso a nuestro equipo humano. Tu ticket es ${ticket.id}. Te contactarán pronto.`,
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `No se pudo escalar la conversación: ${(err as Error).message}` }],
        };
      }
    },
  );
}
