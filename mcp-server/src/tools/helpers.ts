import { CHARACTER_LIMIT } from "../constants.js";
import { ApiError } from "../services/apiClient.js";

interface ToolResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

/** Build a successful tool result with JSON text + structured content. */
export function successResult(data: unknown): ToolResult {
  let text = JSON.stringify(data, null, 2);
  if (text.length > CHARACTER_LIMIT) {
    text =
      text.slice(0, CHARACTER_LIMIT) +
      `\n… [response truncated at ${CHARACTER_LIMIT} characters — use pagination (limit/cursor) or narrow your request to see more]`;
  }

  const result: ToolResult = { content: [{ type: "text", text }] };
  if (data && typeof data === "object" && !Array.isArray(data)) {
    result.structuredContent = data as Record<string, unknown>;
  }
  return result;
}

/** Convert any thrown error into an actionable tool error result. */
export function errorResult(err: unknown): ToolResult {
  let text: string;
  if (err instanceof ApiError) {
    const where = err.status ? `, HTTP ${err.status}` : "";
    text = `Error (${err.code}${where}): ${err.message}`;
    if (err.hint) text += `\nHint: ${err.hint}`;
  } else {
    text = `Unexpected error: ${err instanceof Error ? err.message : String(err)}`;
  }
  return { content: [{ type: "text", text }], isError: true };
}
