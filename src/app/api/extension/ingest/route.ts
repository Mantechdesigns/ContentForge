import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/extension/ingest
 * Receives scraped data from the Chrome Extension.
 * For feed data containing video URLs, auto-triggers breakdown analysis.
 */

// In-memory store for breakdowns (will be replaced by Supabase later)
const breakdownCache = new Map<string, { status: string; data?: unknown; url: string; timestamp: number }>();

// Video URL patterns we can breakdown
const VIDEO_URL_PATTERNS = [
  /youtube\.com\/watch/i,
  /youtu\.be\//i,
  /tiktok\.com\/@[^/]+\/video/i,
  /instagram\.com\/reel\//i,
  /instagram\.com\/p\//i,
];

function isVideoUrl(url: string): boolean {
  return VIDEO_URL_PATTERNS.some(p => p.test(url));
}

function extractVideoId(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `yt_${ytMatch[1]}`;
  // TikTok
  const ttMatch = url.match(/\/video\/(\d+)/);
  if (ttMatch) return `tt_${ttMatch[1]}`;
  // Instagram
  const igMatch = url.match(/\/(?:reel|p)\/([^/?]+)/);
  if (igMatch) return `ig_${igMatch[1]}`;
  // Fallback — hash the URL
  return `url_${Buffer.from(url).toString("base64url").substring(0, 20)}`;
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data, timestamp } = body;
  if (!type || !data) {
    return NextResponse.json({ error: "type and data are required" }, { status: 400 });
  }

  const result: { received: number; breakdownsTriggered: string[] } = {
    received: Array.isArray(data) ? data.length : 1,
    breakdownsTriggered: [],
  };

  // For feed scrapes, find video URLs and auto-trigger breakdowns
  if (type === "feed" && Array.isArray(data)) {
    for (const post of data) {
      const url = post.url || "";
      if (url && isVideoUrl(url)) {
        const videoId = extractVideoId(url);

        // Skip if already analyzed or in progress
        if (breakdownCache.has(videoId)) continue;

        // Mark as pending
        breakdownCache.set(videoId, {
          status: "analyzing",
          url,
          timestamp: Date.now(),
        });

        result.breakdownsTriggered.push(url);

        // Fire breakdown async (non-blocking)
        triggerBreakdown(videoId, url).catch((err) => {
          console.error(`Auto-breakdown failed for ${url}:`, err.message);
          breakdownCache.set(videoId, {
            status: "error",
            data: { error: "Auto-breakdown failed" },
            url,
            timestamp: Date.now(),
          });
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    type,
    ...result,
    timestamp: timestamp || Date.now(),
  });
}

/** Trigger a video breakdown via internal API call */
async function triggerBreakdown(videoId: string, url: string) {
  const baseUrl = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/analyze/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(90000), // 90s timeout
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ingest] Breakdown failed:", text);
    throw new Error("Breakdown failed");
  }

  const data = await res.json();

  breakdownCache.set(videoId, {
    status: "complete",
    data,
    url,
    timestamp: Date.now(),
  });
}

/** Export cache for the breakdowns GET endpoint */
export { breakdownCache };
