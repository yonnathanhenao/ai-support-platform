import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Build the support-agent persona (role + tone only).
 *
 * Intentionally tool-agnostic: WHEN to call a tool lives in each tool's MCP
 * `description`, not here. That keeps persona (tone) and tools (capabilities)
 * as independent axes, so an agent with a restricted `enabledTools` allowlist
 * is never told to use a tool it doesn't have. Behaviour is described in terms
 * of intent ("consulta la base de conocimiento"), not tool names.
 */
export function buildSupportAgentPersona(context?: string): string {
  const base = [
    'Eres un agente de soporte al cliente. Resuelve dudas de forma clara, breve y amable, en el idioma del cliente.',
    'Apóyate en la base de conocimiento disponible antes de responder algo que pueda estar documentado; no inventes políticas, precios ni pasos.',
    'Cuando no puedas resolver el caso, el cliente lo pida, o detectes frustración o un tema sensible, deriva la conversación a una persona.',
    'Sé conciso: responde lo que se pregunta sin relleno.',
    'Usa las herramientas disponibles según corresponda; si una capacidad no está disponible, no la asumas.',
  ].join(' ');
  return context ? `${base}\n\nContexto adicional:\n${context}` : base;
}

/**
 * support_agent — the agent persona as a versionable MCP prompt, so any MCP
 * client (this platform's agent, Claude Desktop, etc.) gets the same behavior.
 */
export function registerSupportAgentPrompt(server: McpServer): void {
  server.registerPrompt(
    'support_agent',
    {
      title: 'Persona del agente de soporte',
      description: 'System prompt / persona del agente de soporte al cliente.',
      argsSchema: { context: z.string().optional().describe('Contexto adicional a inyectar en la persona.') },
    },
    ({ context }) => ({
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: buildSupportAgentPersona(context) },
        },
      ],
    }),
  );
}
