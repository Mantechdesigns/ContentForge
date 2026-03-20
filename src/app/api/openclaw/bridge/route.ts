import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/openclaw/bridge
 * Bridge endpoint for external OpenClaw (AntiMatter) to orchestrate
 * Content Forge actions. Routes commands to internal APIs.
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { action, topic, script, modifiers, videoType, voiceId, config: prodConfig } = body;

  if (!action) {
    return NextResponse.json({ error: "action required" }, { status: 400 });
  }

  const baseUrl = req.nextUrl.origin;

  try {
    switch (action) {
      case "generate_script": {
        const res = await fetch(`${baseUrl}/api/scripts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, modifiers: modifiers || ["--clean"] }),
          signal: AbortSignal.timeout(60000),
        });
        if (!res.ok) {
          const err = await res.text().catch(() => "Unknown error");
          console.error("[bridge] Script generation failed:", err);
          return NextResponse.json({ action, error: "Script generation failed" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json({ action, ...data });
      }

      case "generate_voiceover": {
        const res = await fetch(`${baseUrl}/api/generate/voiceover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: script || topic, voiceId }),
          signal: AbortSignal.timeout(60000),
        });

        if (!res.ok) {
          const err = await res.text().catch(() => "Unknown error");
          console.error("[bridge] Voiceover failed:", err);
          return NextResponse.json({ action, error: "Voiceover failed" }, { status: res.status });
        }

        if (res.headers.get("content-type")?.includes("audio")) {
          // Return audio as base64 for JSON transport
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return NextResponse.json({
            action,
            success: true,
            audio_base64: base64,
            content_type: "audio/mpeg",
            size: buffer.byteLength,
          });
        }

        const data = await res.json();
        return NextResponse.json({ action, ...data });
      }

      case "produce_video": {
        const res = await fetch(`${baseUrl}/api/produce`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script,
            videoType: videoType || "ugc",
            config: prodConfig || {},
          }),
          signal: AbortSignal.timeout(120000),
        });
        if (!res.ok) {
          const err = await res.text().catch(() => "Unknown error");
          console.error("[bridge] Production failed:", err);
          return NextResponse.json({ action, error: "Production failed" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json({ action, ...data });
      }

      case "research": {
        const res = await fetch(`${baseUrl}/api/research`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
          signal: AbortSignal.timeout(60000),
        });
        if (!res.ok) {
          const err = await res.text().catch(() => "Unknown error");
          console.error("[bridge] Research failed:", err);
          return NextResponse.json({ action, error: "Research failed" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json({ action, ...data });
      }

      case "status": {
        return NextResponse.json({
          action: "status",
          online: true,
          version: "0.1.0",
          apis: {
            scripts: "POST /api/scripts",
            voiceover: "POST /api/generate/voiceover",
            produce: "POST /api/produce",
            research: "POST /api/research",
          },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[bridge] Error:", error);
    return NextResponse.json(
      { error: "Bridge request failed. Please try again.", action },
      { status: 500 }
    );
  }
}

/**
 * GET /api/openclaw/bridge — health check
 */
export async function GET() {
  return NextResponse.json({
    status: "online",
    bridge: "Content Forge ↔ OpenClaw",
    version: "0.1.0",
  });
}
