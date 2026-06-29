import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConversationHistory, getConversationHistoryInput } from '@platform/core';

/**
 * get_conversation_history — lets the agent re-read prior turns of a
 * conversation (useful after escalation handoffs or long threads).
 */
export function registerGetConversationHistory(server: McpServer, orgId: string): void {
  server.registerTool(
    'get_conversation_history',
    {
      title: 'Obtener historial de la conversación',
      description:
        'Devuelve los turnos anteriores de una conversación. Úsala cuando necesites contexto previo que no esté en el mensaje actual.',
      inputSchema: getConversationHistoryInput.shape,
    },
    async (args) => {
      try {
        const history = getConversationHistory(orgId, args);
        const text =
          history.length === 0
            ? 'Sin historial previo para esta conversación.'
            : history.map((m) => `[${m.role}] ${m.content}`).join('\n');
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `No se pudo obtener el historial: ${(err as Error).message}` }],
        };
      }
    },
  );
}
