import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/transcribe
 * Transcribes audio to text using Groq Whisper.
 * Accepts multipart/form-data with an 'audio' file.
 */
export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured — needed for transcription" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Limit file size to 25MB
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 25MB)" }, { status: 400 });
    }

    // Forward to Groq Whisper
    const groqForm = new FormData();
    groqForm.append("file", audioFile, audioFile.name || "recording.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("response_format", "json");
    groqForm.append("language", "en");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
      body: groqForm,
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[transcribe] Groq Whisper error:", err);
      return NextResponse.json({ error: "Transcription service error. Please try again." }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({
      text: data.text || "",
      model: "whisper-large-v3-turbo",
    });
  } catch (error) {
    console.error("[transcribe] Error:", error);
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}
