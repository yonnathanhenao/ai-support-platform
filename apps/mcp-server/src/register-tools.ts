import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchKnowledge } from "./tools/search-knowledge.ts";
import { registerEscalateToHuman } from "./tools/escalate-to-human.ts";
import { registerGetConversationHistory } from "./tools/get-conversation-history.ts";

export function registerTools(server: McpServer, orgId: string): void {
  registerSearchKnowledge(server, orgId);
  registerEscalateToHuman(server, orgId);
  registerGetConversationHistory(server, orgId);
}
