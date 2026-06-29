import { anthropic } from "@ai-sdk/anthropic";
import { type AgentConfig } from "@platform/core";
import { ToolLoopAgent, stepCountIs, type InferAgentUIMessage } from "ai";
import {
  closeMcpClient,
  getMcpPrompt,
  getMcpTools,
  type MCPClient,
} from "./mcp.client.ts";

type SupportTools = Awaited<ReturnType<MCPClient["tools"]>>;

let agent: ToolLoopAgent<SupportTools> | undefined;

/**
 * Build the support agent from an agent definition (model + persona prompt +
 * tool allowlist + step cap). The config selects from the MCP server's catalog;
 * the agent only receives the tools its `enabledTools` allows. Call once at
 * startup, after the MCP server is reachable.
 *
 * @param config Agent definition. Defaults to the org's default config.
 */
export async function initAgent(
  config: AgentConfig,
): Promise<ToolLoopAgent<SupportTools>> {
  if (agent) return agent;

  const tools = await getMcpTools(config.enabledTools);
  const instructions = await getMcpPrompt(config.promptName);

  agent = new ToolLoopAgent({
    model: anthropic(config.model),
    instructions,
    tools,
    stopWhen: stepCountIs(config.maxSteps),
    onStepFinish: ({ toolCalls, usage }) => {
      // Cost/observability hook: per-step tokens + which MCP tools were called.
      const called = toolCalls?.map((c) => c.toolName).join(", ") || "—";
      console.log(
        `[agent] step done · tools=[${called}] · tokens=${usage?.totalTokens ?? "?"}`,
      );
    },
  });

  return agent;
}

export function getAgent(): ToolLoopAgent<SupportTools> {
  if (!agent)
    throw new Error("Agent not initialized — call initAgent() first.");
  return agent;
}

/** Tear down the agent and its MCP connection on shutdown. */
export async function closeAgent(): Promise<void> {
  await closeMcpClient();
  agent = undefined;
}

export type SupportAgentUIMessage = InferAgentUIMessage<
  ToolLoopAgent<SupportTools>
>;
