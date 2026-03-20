import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { getBrandSystemPrompt, BRAND } from "@/lib/brand-defaults";

/**
 * POST /api/analyze/video
 * Deep video breakdown: extract transcript + Gemini analysis.
 *
 * Accepts: { url: string }
 * Returns: Full VideoBreakdown object with hook, story, CTA, visual hooks,
 *          framework, pacing, transcript, and script suggestion.
 */

interface TranscriptSegment {
  text: string;
  offset: number;   // ms
  duration: number;  // ms
}

export async function POST(req: NextRequest) {
  const googleKey = process.env.GOOGLE_API_KEY;
  if (!googleKey) {
    return NextResponse.json({ error: "GOOGLE_API_KEY not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { url } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  if (url.length > 2000) {
    return NextResponse.json({ error: "URL too long" }, { status: 400 });
  }
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    // Step 1: Extract transcript
    const { transcript, platform, videoId } = await extractTranscript(url);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "Could not extract transcript from this video. Try a YouTube URL with captions enabled." }, { status: 422 });
    }

    // Step 2: Build full text from segments
    const fullText = transcript.map((s: TranscriptSegment) => s.text).join(" ");
    const totalDuration = transcript.length > 0
      ? Math.round((transcript[transcript.length - 1].offset + transcript[transcript.length - 1].duration) / 1000)
      : 0;

    // Step 3: Deep analysis with Gemini
    const analysis = await analyzeWithGemini(googleKey, fullText, totalDuration, url, platform);

    return NextResponse.json({
      success: true,
      platform,
      videoId,
      totalDuration,
      wordCount: fullText.split(/\s+/).length,
      transcript: transcript.map((s: TranscriptSegment) => ({
        text: s.text,
        start: Math.round(s.offset / 1000),
        duration: Math.round(s.duration / 1000),
      })),
      analysis,
    });
  } catch (error) {
    console.error("[analyze/video] Error:", error);
    return NextResponse.json({ error: "Video analysis failed. Please try again." }, { status: 500 });
  }
}

/* ───── Transcript Extraction ───── */
async function extractTranscript(url: string): Promise<{
  transcript: TranscriptSegment[];
  platform: string;
  videoId: string;
}> {
  // Detect platform
  const isYouTube = /youtube\.com|youtu\.be/i.test(url);
  const isTikTok = /tiktok\.com/i.test(url);
  const isInstagram = /instagram\.com/i.test(url);

  if (isYouTube) {
    return extractYouTubeTranscript(url);
  }

  // For TikTok/Instagram/other — try page scrape for captions
  if (isTikTok || isInstagram) {
    return extractFromPageMeta(url, isTikTok ? "tiktok" : "instagram");
  }

  // Fallback: try YouTube extraction in case it's a shortened link
  try {
    return await extractYouTubeTranscript(url);
  } catch {
    throw new Error("Unsupported platform. Currently supporting: YouTube (with captions), TikTok, and Instagram.");
  }
}

/* YouTube transcript via youtube-transcript npm */
async function extractYouTubeTranscript(url: string): Promise<{
  transcript: TranscriptSegment[];
  platform: string;
  videoId: string;
}> {
  // Extract video ID
  const match = url.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match?.[1] || url;

  const raw = await YoutubeTranscript.fetchTranscript(videoId);

  const transcript: TranscriptSegment[] = raw.map((item: { text: string; offset: number; duration: number }) => ({
    text: item.text,
    offset: item.offset,
    duration: item.duration,
  }));

  return { transcript, platform: "youtube", videoId };
}

/* TikTok/Instagram — scrape page for description + available captions */
async function extractFromPageMeta(url: string, platform: string): Promise<{
  transcript: TranscriptSegment[];
  platform: string;
  videoId: string;
}> {
  try {
    // SSRF protection: only allow http(s) and block private/internal IPs
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP/HTTPS URLs are allowed");
    }
    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [
      /^localhost$/, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./, /^169\.254\./, /^0\./, /^\[::1\]$/, /\.internal$/, /\.local$/,
    ];
    if (blockedPatterns.some(p => p.test(hostname))) {
      throw new Error("URL points to a private/internal address");
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch page (${res.status})`);
    }
    const html = await res.text();

    // Try to extract description/caption from meta tags
    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i)
      || html.match(/"desc":"([^"]+)"/i)
      || html.match(/"description":"([^"]+)"/i);

    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);

    const description = descMatch?.[1] || "";
    const title = titleMatch?.[1] || "";

    // For TikTok/IG, the caption IS the content (short-form)
    // We create a pseudo-transcript from the caption + title
    const fullCaption = [title, description].filter(Boolean).join(" ").trim();

    if (!fullCaption) {
      throw new Error(`Could not extract content from ${platform} URL. The video may be private or require login.`);
    }

    // Create transcript segments from caption
    const words = fullCaption.split(/\s+/);
    const segments: TranscriptSegment[] = [];
    const wordsPerSegment = 10;
    for (let i = 0; i < words.length; i += wordsPerSegment) {
      segments.push({
        text: words.slice(i, i + wordsPerSegment).join(" "),
        offset: (i / wordsPerSegment) * 3000,
        duration: 3000,
      });
    }

    const idMatch = url.match(/\/video\/(\d+)/i) || url.match(/\/reel\/([^/?]+)/i) || url.match(/\/p\/([^/?]+)/i);
    const videoId = idMatch?.[1] || url;

    return { transcript: segments, platform, videoId };
  } catch (error) {
    throw new Error(`Could not extract from ${platform}: ${(error as Error).message}`);
  }
}

/* ───── Gemini Deep Analysis ───── */
async function analyzeWithGemini(
  apiKey: string,
  fullText: string,
  durationSeconds: number,
  url: string,
  platform: string,
) {
  const prompt = `${getBrandSystemPrompt("viral content analyst and reverse-engineering expert")}

You are analyzing a viral ${platform} video to reverse-engineer its success.

VIDEO URL: ${url}
TOTAL DURATION: ${durationSeconds} seconds
WORD COUNT: ${fullText.split(/\s+/).length}

FULL TRANSCRIPT:
"${fullText.substring(0, 8000)}"

Analyze this video deeply and return a JSON object with EXACTLY these fields:

{
  "hook": {
    "text": "The exact opening hook text (first 1-2 sentences)",
    "type": "Hook type classification (e.g. Provocative Statement, Question, Statistic, Controversy, Pain Point, Bold Claim, Story Open, Pattern Interrupt)",
    "why_it_works": "Explain psychologically why this hook grabs attention",
    "grade": "A/B/C/D/F grade for hook effectiveness",
    "visual_hook": "Describe the likely visual hook used (text overlay, face close-up, shock image, etc.)"
  },
  "story_structure": {
    "framework": "Identified framework (PAS, AIDA, Before/After, Hero's Journey, Problem-Agitation-Solution, etc.)",
    "setup": "The setup/problem establishment",
    "conflict": "The tension/agitation/challenge presented",
    "resolution": "The solution/payoff/transformation",
    "arc_type": "Emotional arc type (inspirational, educational, fear-to-hope, problem-to-solution, etc.)"
  },
  "cta": {
    "text": "The exact call-to-action text",
    "type": "CTA type (follow, comment, share, link-in-bio, DM, subscribe, etc.)",
    "placement": "Where in the video (beginning, middle, end, multiple)",
    "effectiveness": "Rating 1-10 and why"
  },
  "visual_hooks": [
    "List of visual techniques used (text overlays, B-roll transitions, zoom effects, color grading, split screen, etc.)"
  ],
  "pacing": {
    "hook_duration": "How many seconds the hook lasts",
    "body_duration": "How many seconds the body/content lasts",
    "cta_duration": "How many seconds the CTA/closing lasts",
    "words_per_minute": ${durationSeconds > 0 ? Math.round(fullText.split(/\s+/).length / (durationSeconds / 60)) : 0},
    "energy_level": "Low/Medium/High/Very High",
    "pacing_style": "Fast cuts, slow build, constant energy, escalating, etc."
  },
  "key_phrases": ["List of 5-8 power phrases or quotable lines from the transcript"],
  "emotional_triggers": ["List of emotional triggers used (fear of missing out, social proof, authority, scarcity, curiosity gap, etc.)"],
  "why_it_went_viral": "2-3 sentence explanation of why this specific content went viral",
  "script_suggestion": {
    "title": "Suggested title for YOUR version in ${BRAND.name} brand voice",
    "hook": "YOUR version of the opening hook, rewritten for ${BRAND.audience.primary}",
    "body": "YOUR version of the body content, using ${BRAND.framework.label} framework",
    "cta": "YOUR version of the CTA, driving toward ${BRAND.offer.label}",
    "full_script": "Complete ready-to-record script (${durationSeconds > 60 ? '60' : String(durationSeconds)} seconds) in ${BRAND.founder}'s voice: ${BRAND.voice.tone}"
  }
}

Return ONLY valid JSON, no markdown fences, no explanatory text.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!res.ok) throw new Error(`Gemini analysis failed: ${await res.text()}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return { raw_analysis: text, error: "Could not parse structured analysis" };
  }
}
