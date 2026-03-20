import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate/voiceover
 * Generates voiceover audio using ElevenLabs with Manny's voice
 * Returns audio as a downloadable blob
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { text, voiceId } = body;

  if (!text) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }
  if (text.length > 5000) {
    return NextResponse.json({ error: "Text too long (max 5000 characters)" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to your .env.local" },
      { status: 500 }
    );
  }

  // Use provided voiceId, or env default (Manny: Pyxfro0Wuu0Eid6hUK5p)
  // Validate voiceId to prevent path traversal - must be alphanumeric
  const selectedVoice = (/^[a-zA-Z0-9_-]+$/.test(voiceId || "") ? voiceId : null)
    || process.env.ELEVENLABS_VOICE_ID || "Pyxfro0Wuu0Eid6hUK5p";

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: cleanTextForVoice(text),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[voiceover] ElevenLabs error:", err);
      return NextResponse.json({ error: "Voiceover service error. Please try again." }, { status: 500 });
    }

    // Return audio as binary response
    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="voiceover-${Date.now()}.mp3"`,
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("[voiceover] Error:", error);
    return NextResponse.json(
      { error: "Voiceover generation failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/voiceover
 * Returns available voices from ElevenLabs
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ voices: getDefaultVoices() });
  }

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({ voices: getDefaultVoices() });
    }

    const data = await res.json();
    const voices = data.voices?.map((v: { voice_id: string; name: string; labels?: Record<string, string> }) => ({
      id: v.voice_id,
      name: v.name,
      accent: v.labels?.accent || "unknown",
      gender: v.labels?.gender || "unknown",
    })) || [];

    return NextResponse.json({ voices });
  } catch {
    return NextResponse.json({ voices: getDefaultVoices() });
  }
}

/* ───── Clean text for voiceover ───── */
function cleanTextForVoice(text: string): string {
  return text
    .replace(/═+/g, "")
    .replace(/─+/g, "")
    .replace(/HOOK \([\d.-]+s\):/g, "")
    .replace(/SCRIPT:/g, "")
    .replace(/TEXT OVERLAYS:[\s\S]*/g, "")
    .replace(/CAPTION:[\s\S]*/g, "")
    .replace(/\[[\d.-]+s\].*\n/g, "")
    .replace(/Modifiers:[\s\S]*/g, "")
    .replace(/\(Demo mode[\s\S]*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*{1,2}/g, "")
    .trim();
}

/* ───── Default voice list ───── */
function getDefaultVoices() {
  return [
    { id: "Pyxfro0Wuu0Eid6hUK5p", name: "Manny (Custom Clone)", accent: "american", gender: "male" },
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", accent: "american", gender: "female" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni", accent: "american", gender: "male" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", accent: "american", gender: "female" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", accent: "american", gender: "female" },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", accent: "american", gender: "male" },
  ];
}
