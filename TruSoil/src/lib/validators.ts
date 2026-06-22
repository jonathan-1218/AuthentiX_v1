/**
 * Shared Zod schemas and helpers for validating path params, query strings,
 * and other inputs that appear across multiple API routes.
 */

import { z } from "zod";

// ── Path parameter schemas ───────────────────────────────────────────────────

/** batch_<uuid> — exactly the format we generate */
export const batchIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^batch_[0-9a-f-]{36}$/, "Invalid batchId format");

/** farm_<uuid> */
export const farmIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^farm_[0-9a-f-]{36}$/, "Invalid farmId format");

/** user_<uuid> */
export const userIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^user_[0-9a-f-]{36}$/, "Invalid userId format");

/** YYYY-MM month key used by the blockchain routes */
export const monthKeySchema = z
  .string()
  .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, "monthKey must be YYYY-MM");

// ── Pagination ───────────────────────────────────────────────────────────────

/** Parses and bounds the `page` query param (1 – 1000). */
export function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 1000); // prevent skip > 20M on typical PAGE_SIZE=20
}

// ── String sanitisation helpers ──────────────────────────────────────────────

/**
 * Escape characters that have special meaning in MongoDB `$regex` patterns.
 * This prevents a ReDoS attack where a malicious search term like `(a+)+b`
 * causes catastrophic backtracking in the regex engine.
 */
export function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate a YYYY-MM-DD date string.
 * Returns the Date object on success, null if the string is unparseable or
 * produces an invalid date (prevents passing garbage to `new Date()`).
 */
export function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ── Reusable Zod schema snippets ─────────────────────────────────────────────

/** Non-empty string trimmed to a max length, rejects whitespace-only input. */
export const shortString = (max = 255) =>
  z.string().trim().min(1).max(max);

/** Free-text field — trimmed, length-limited, but no character restrictions. */
export const longText = (max = 2000) =>
  z.string().trim().min(1).max(max);
