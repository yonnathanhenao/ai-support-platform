/** Pure helpers for the AI Engine — kept out of agent.ts so that file stays
 * focused on the agent's lifecycle (connect → build → serve → close). */

/** Flatten an MCP prompt message's content into plain text. */
export function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(extractText).join("");
  if (
    content &&
    typeof content === "object" &&
    "type" in content &&
    (content as { type?: unknown }).type === "text"
  ) {
    return String((content as { text?: unknown }).text ?? "");
  }
  return "";
}

/**
 * Build the agent's system instructions (a string) from an MCP prompt's
 * messages. The MCP `support_agent` prompt is the source of truth for the
 * persona; we flatten its text parts into one block.
 */
export function promptMessagesToInstructions(
  messages: ReadonlyArray<{ content: unknown }>,
): string {
  return messages
    .map((m) => extractText(m.content))
    .join("\n\n")
    .trim();
}
