import { NextRequest, NextResponse } from "next/server";
import { BRAND, VIDEO, getBrandSystemPrompt } from "@/lib/brand-defaults";

/**
 * POST /api/generate/cinematic
 * NotebookLM-style cinematic video generator.
 * Accepts a URL, pasted text, or uploaded document.
 * Pipeline: Content → Gemini analysis → Script → Veo 3 video generation.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_API_KEY not configured" }, { status: 500 });
  }

  const contentType = req.headers.get("content-type") || "";
  let source: string;
  let sourceType: "url" | "text" | "document";
  let duration: number;
  let style: string;

  if (contentType.includes("multipart/form-data")) {
    let formData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
    }
    const file = formData.get("document") as File | null;
    const url = formData.get("url") as string;
    const text = formData.get("text") as string;
    duration = parseInt((formData.get("duration") as string) || "30", 10);
    style = (formData.get("style") as string) || "cinematic";

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Document too large (max 10MB)" }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      source = new TextDecoder().decode(buffer);
      sourceType = "document";
    } else if (url) {
      source = url;
      sourceType = "url";
    } else if (text) {
      source = text;
      sourceType = "text";
    } else {
      return NextResponse.json({ error: "Provide url, text, or document" }, { status: 400 });
    }
  } else {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    source = body.url || body.text || "";
    sourceType = body.url ? "url" : "text";
    duration = body.duration || 30;
    style = body.style || "cinematic";
    if (!source) {
      return NextResponse.json({ error: "Provide url or text" }, { status: 400 });
    }
  }

  try {
    // Step 1: If URL, fetch content with Gemini
    let content = source;
    if (sourceType === "url") {
      content = await fetchUrlContent(source);
    }

    // Step 2: Generate cinematic script with Gemini
    const script = await generateCinematicScript(apiKey, content, duration, style);

    // Step 3: Generate video with Veo 3
    const videoResult = await generateCinematicVideo(apiKey, script.videoPrompt, duration, style);

    // Step 4: Optionally generate voiceover
    let voiceoverResult = null;
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "Pyxfro0Wuu0Eid6hUK5p";
    if (elevenlabsKey && script.narration) {
      voiceoverResult = await generateVoiceover(elevenlabsKey, voiceId, script.narration);
    }

    return NextResponse.json({
      success: true,
      sourceType,
      duration,
      style,
      script: {
        title: script.title,
        narration: script.narration,
        videoPrompt: script.videoPrompt,
        scenes: script.scenes,
      },
      video: videoResult,
      voiceover: voiceoverResult ? {
        size: voiceoverResult.size,
        generated: true,
      } : null,
      message: `Cinematic video generation started. Duration: ${duration}s. ${videoResult.status === "processing" ? "Veo 3 is rendering..." : "Complete."}`,
    });
  } catch (error) {
    console.error("[cinematic] Error:", error);
    return NextResponse.json({ error: "Cinematic generation failed. Please try again." }, { status: 500 });
  }
}

/* ───── Fetch URL Content ───── */
async function fetchUrlContent(url: string): Promise<string> {
  try {
    // SSRF protection: only allow http(s) and block private/internal IPs
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP/HTTPS URLs are allowed");
    }
    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\./,
      /^\[::1\]$/,
      /\.internal$/,
      /\.local$/,
    ];
    if (blockedPatterns.some(p => p.test(hostname))) {
      throw new Error("URL points to a private/internal address");
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "ContentForge/1.0 (cinematic-studio)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
    const html = await res.text();
    // Strip HTML tags for a rough text extraction
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 15000); // Cap at 15K chars for Gemini context
  } catch {
    return `[Content from URL: ${url} — could not be fetched directly. Generate based on the URL topic.]`;
  }
}

/* ───── Generate Cinematic Script with Gemini ───── */
async function generateCinematicScript(
  apiKey: string,
  content: string,
  duration: number,
  style: string
): Promise<{
  title: string;
  narration: string;
  videoPrompt: string;
  scenes: string[];
}> {
  const durationLabel = duration <= 8 ? "ultra-short hook" :
    duration <= 30 ? "short-form social" :
    duration <= 60 ? "standard reel" :
    duration <= 180 ? "deep-dive" : "full cinematic piece";

  const prompt = `${getBrandSystemPrompt("cinematic video producer")}

You are creating a ${durationLabel} (${duration} seconds) cinematic video.
Style: ${style}

SOURCE CONTENT:
${content.substring(0, 10000)}

Based on this content, generate a cinematic video package. Return a JSON object with:
1. "title" — compelling title for the video
2. "narration" — voiceover-ready narration script timed to ${duration} seconds (approximately ${Math.round(duration * 2.5)} words)
3. "videoPrompt" — detailed Veo 3 video generation prompt describing the visual scenes, camera movements, transitions, lighting. Style: ${style}, premium, ${VIDEO.defaults.aspectRatio} vertical.
4. "scenes" — array of scene descriptions with timecodes

Important: The narration should sound like ${BRAND.founder} speaking — ${BRAND.voice.tone}.
Target audience: ${BRAND.audience.primary}.

Return ONLY valid JSON, no markdown fences.`;

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

  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {
      title: "Cinematic Video",
      narration: text.substring(0, 500),
      videoPrompt: `Premium cinematic ${VIDEO.defaults.aspectRatio} video. ${text.substring(0, 300)}. ${VIDEO.veo3.style}`,
      scenes: ["Scene 1: Opening shot"],
    };
  }
}

/* ───── Generate Video with Veo 3 ───── */
async function generateCinematicVideo(
  apiKey: string,
  videoPrompt: string,
  duration: number,
  style: string
): Promise<{ status: string; operation: string | null; prompt: string }> {
  const veoPrompt = `${videoPrompt}. Style: ${style}, premium cinematic quality. ${VIDEO.veo3.style}`;

  // Veo 3 supports up to 8s per clip — for longer videos, note this in response
  const clipDuration = Math.min(duration, 8);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-preview:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: veoPrompt }],
        parameters: {
          aspectRatio: VIDEO.defaults.aspectRatio,
          personGeneration: VIDEO.defaults.personGeneration,
          numberOfVideos: 1,
          durationSeconds: clipDuration,
        },
      }),
      signal: AbortSignal.timeout(120000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return { status: "error", operation: null, prompt: `Veo 3 error: ${err}` };
  }

  const data = await res.json();

  return {
    status: "processing",
    operation: data.name || null,
    prompt: veoPrompt.substring(0, 500),
  };
}

/* ───── Generate Voiceover with ElevenLabs ───── */
async function generateVoiceover(
  apiKey: string,
  voiceId: string,
  text: string
): Promise<{ size: number } | null> {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true },
        }),
        signal: AbortSignal.timeout(60000),
      }
    );
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return { size: buffer.byteLength };
  } catch {
    return null;
  }
}
