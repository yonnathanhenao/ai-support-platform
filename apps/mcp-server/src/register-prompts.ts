import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSupportAgentPrompt } from './prompts/support-agent.ts';

export function registerPrompts(server: McpServer): void {
  registerSupportAgentPrompt(server);
}
