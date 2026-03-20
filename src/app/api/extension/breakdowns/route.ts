import { NextResponse } from "next/server";
import { breakdownCache } from "../ingest/route";

/**
 * GET /api/extension/breakdowns
 * Returns all cached auto-breakdown results from extension ingest.
 */
export async function GET() {
  const entries: Record<string, { status: string; data?: unknown; url: string; timestamp: number }> = {};

  for (const [id, entry] of breakdownCache.entries()) {
    entries[id] = entry;
  }

  return NextResponse.json({
    count: breakdownCache.size,
    breakdowns: entries,
  });
}
