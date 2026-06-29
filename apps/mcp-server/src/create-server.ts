import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './register-tools.ts';
import { registerResources } from './register-resources.ts';
import { registerPrompts } from './register-prompts.ts';

/**
 * Build a fully-registered MCP server. Stateless: a fresh server is created
 * per request (see index.ts), so registration must be cheap and idempotent.
 *
 * `orgId` binds the tenant server-side — the model never selects the org.
 */
export function createServer(orgId: string): McpServer {
  const server = new McpServer({
    name: 'ai-support-platform-mcp',
    version: '0.1.0',
  });

  registerTools(server, orgId);
  registerResources(server, orgId);
  registerPrompts(server);

  return server;
}
