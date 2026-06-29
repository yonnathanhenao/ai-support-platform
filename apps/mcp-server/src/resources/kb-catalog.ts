import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { store } from '@platform/core';

/**
 * kb://catalog — a navigable listing of the org's knowledge-base documents.
 * Resources are MCP's first-class read-only context primitive; this is the
 * seed for richer resources (conversation://, ticket://) later.
 */
export function registerKbCatalog(server: McpServer, orgId: string): void {
  server.registerResource(
    'kb-catalog',
    'kb://catalog',
    {
      title: 'Catálogo de la base de conocimiento',
      description: 'Lista de documentos disponibles en la base de conocimiento de la organización.',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/plain',
          text: store
            .knowledgeFor(orgId)
            .map((doc) => `- ${doc.title} (${doc.id})`)
            .join('\n'),
        },
      ],
    }),
  );
}
