/**
 * Widget configuration.
 *
 * The widget is a browser bundle, so its config is resolved at BUILD time by
 * Vite from `VITE_*` variables (not process.env). Kept separate from the
 * server apps' env on purpose — different mechanism, no runtime validation, no
 * secrets (everything here ships to the client).
 */
export const env = {
  /** URL of the support-agent that serves POST /chat. */
  supportAgentUrl:
    import.meta.env.VITE_SUPPORT_AGENT_URL ?? "http://localhost:3001",
} as const;
