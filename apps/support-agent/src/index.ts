import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createAgentUIStreamResponse } from "ai";
import { env } from "./env.ts";
import { initAgent, getAgent, closeAgent } from "./ai/agent.ts";
import { type AgentConfig, defaultAgentConfig } from "@platform/core";

const config: AgentConfig = defaultAgentConfig(env.ORG_ID);
// Connect to the MCP server and build the agent before accepting traffic.
await initAgent(config);

const app = new Elysia()
  // The widget is embedded cross-origin, so allow browser calls to /chat.
  .use(cors())
  .get("/health", () => ({ status: "ok", service: "support-agent" }))
  // POST /chat — streams the agent's UI message response to the widget.
  // Body: { messages: UIMessage[] } (the AI SDK `useChat` contract).
  .post("/chat", ({ body }) =>
    createAgentUIStreamResponse({
      agent: getAgent(),
      uiMessages: (body as { messages: unknown[] }).messages,
    }),
  )
  .listen(env.SUPPORT_AGENT_PORT);

console.log(
  `[support-agent] listening on http://localhost:${env.SUPPORT_AGENT_PORT}`,
);

// Clean shutdown of the MCP connection.
process.on("SIGINT", async () => {
  await closeAgent();
  await app.stop();
  process.exit(0);
});
