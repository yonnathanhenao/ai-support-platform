import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { env } from './env.ts';
import { createServer } from './create-server.ts';

/**
 * Stateless Streamable-HTTP MCP server (Bun + Web Standard transport).
 *
 * - POST/GET/DELETE /mcp : the MCP endpoint, guarded by X-Internal-Token.
 *   A fresh server+transport is created per request (stateless mode), which
 *   the AI SDK MCP client consumes over `transport: { type: 'http' }`.
 * - GET /health          : liveness probe (no auth).
 */
const server = Bun.serve({
  port: env.MCP_SERVER_PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'mcp-server' });
    }

    if (url.pathname === '/mcp') {
      const token = req.headers.get('X-Internal-Token');
      if (!token || token !== env.MCP_INTERNAL_TOKEN) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const transport = new WebStandardStreamableHTTPServerTransport();
      const mcp = createServer(env.ORG_ID);
      await mcp.connect(transport);
      return transport.handleRequest(req);
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[mcp-server] listening on http://localhost:${server.port}/mcp`);
