import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchKnowledge, searchKnowledgeInput } from '@platform/core';

/**
 * search_knowledge — the RAG entry point. Thin adapter over the core
 * capability; the org is bound server-side (never chosen by the model).
 */
export function registerSearchKnowledge(server: McpServer, orgId: string): void {
  server.registerTool(
    'search_knowledge',
    {
      title: 'Buscar en la base de conocimiento',
      description:
        'Busca en la base de conocimiento de la organización. Úsala cuando el cliente pregunte algo que probablemente esté documentado (cómo hacer X, políticas, precios, horarios).',
      inputSchema: searchKnowledgeInput.shape,
    },
    async (args) => {
      try {
        const hits = searchKnowledge(orgId, args);
        if (hits.length === 0) {
          return { content: [{ type: 'text', text: 'Sin resultados en la base de conocimiento.' }] };
        }
        const text = hits.map((h) => `## ${h.title}\n${h.snippet}`).join('\n\n');
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Error al buscar en la base de conocimiento: ${(err as Error).message}` }],
        };
      }
    },
  );
}
