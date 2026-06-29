import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerKbCatalog } from './resources/kb-catalog.ts';

export function registerResources(server: McpServer, orgId: string): void {
  registerKbCatalog(server, orgId);
}
