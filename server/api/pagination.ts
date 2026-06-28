import { badRequest } from "./errors";

// Cursor-based pagination contract for /api/v1 list endpoints. Clients pass
// ?limit & ?cursor; responses return { data, nextCursor }. limit is bounded so a
// single call can never return an unbounded payload to an MCP client.
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export interface PageParams {
  limit: number;
  cursor: string | null;
}

/** Parse & validate ?limit and ?cursor from a query object into bounded values. */
export function parsePagination(
  query: Record<string, unknown>,
  opts: { defaultLimit?: number; maxLimit?: number } = {},
): PageParams {
  const defaultLimit = opts.defaultLimit ?? DEFAULT_PAGE_LIMIT;
  const maxLimit = opts.maxLimit ?? MAX_PAGE_LIMIT;

  let limit = defaultLimit;
  const rawLimit = query.limit;
  if (rawLimit !== undefined && rawLimit !== "") {
    const n = Number(rawLimit);
    if (!Number.isInteger(n) || n < 1) {
      throw badRequest("`limit` must be a positive integer", `Use a value between 1 and ${maxLimit}.`);
    }
    limit = Math.min(n, maxLimit);
  }

  let cursor: string | null = null;
  const rawCursor = query.cursor;
  if (rawCursor !== undefined && rawCursor !== "") {
    if (typeof rawCursor !== "string") throw badRequest("`cursor` must be a string");
    cursor = rawCursor;
  }

  return { limit, cursor };
}

// A cursor encodes the sort position of the last returned row. We sort lists by
// (createdAt desc, id) so the pair is a stable, unique tiebreaker.
export interface Cursor {
  createdAt: string; // ISO-8601
  id: string;
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCursor(raw: string): Cursor {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (parsed && typeof parsed.createdAt === "string" && typeof parsed.id === "string") {
      return parsed as Cursor;
    }
  } catch {
    /* fall through to the validation error below */
  }
  throw badRequest("Invalid `cursor`", "Use a cursor returned by a previous page, or omit it for the first page.");
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

/**
 * Build a bounded page from rows that were fetched as `limit + 1`. If the extra row
 * is present there are more results: it is dropped and the last kept row becomes the
 * nextCursor. Otherwise nextCursor is null (last page).
 */
export function buildPage<T>(rows: T[], limit: number, toCursor: (row: T) => Cursor): Page<T> {
  if (rows.length > limit) {
    const data = rows.slice(0, limit);
    return { data, nextCursor: encodeCursor(toCursor(data[data.length - 1])) };
  }
  return { data: rows, nextCursor: null };
}
