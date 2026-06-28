import type { Response } from "express";

// Public error contract for the /api/v1 surface: every failure is serialized as
// { error, code, hint? }. `code` is a stable machine-readable string; `hint` is an
// optional actionable suggestion. Stack traces and DB internals are NEVER exposed.
export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "internal";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  internal: 500,
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly hint?: string;

  constructor(code: ApiErrorCode, message: string, hint?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.hint = hint;
  }
}

export const badRequest = (message: string, hint?: string) => new ApiError("bad_request", message, hint);
export const unauthorized = (message = "Authentication required", hint?: string) =>
  new ApiError("unauthorized", message, hint);
export const forbidden = (message = "Access denied", hint?: string) => new ApiError("forbidden", message, hint);
export const notFound = (message = "Resource not found", hint?: string) => new ApiError("not_found", message, hint);
export const conflict = (message: string, hint?: string) => new ApiError("conflict", message, hint);
export const rateLimited = (message = "Rate limit exceeded", hint?: string) =>
  new ApiError("rate_limited", message, hint);

/** Write any error in the public { error, code, hint? } contract. Unknown errors become an opaque 500. */
export function sendApiError(res: Response, err: unknown): void {
  if (err instanceof ApiError) {
    const body: { error: string; code: ApiErrorCode; hint?: string } = { error: err.message, code: err.code };
    if (err.hint) body.hint = err.hint;
    res.status(err.status).json(body);
    return;
  }
  // Unexpected error: log server-side only, return an opaque 500 (no stack / DB internals to the client).
  console.error("[api/v1] unhandled error:", err);
  res.status(500).json({ error: "Internal server error", code: "internal" satisfies ApiErrorCode });
}

/** Wrap an async Express handler so thrown ApiErrors map cleanly to the error contract. */
export function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<unknown>,
): (req: any, res: any, next: any) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => sendApiError(res, err));
  };
}
