import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * POST /api/produce
 * Orchestrates the full video production pipeline:
 * 1. Generate voiceover (ElevenLabs or HeyGen)
 * 2. Generate video (HeyGen avatar or Veo 3)
 * 3. Assemble final render
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { script, videoType, config } = body;

  if (!script || typeof script !== "string") {
    return NextResponse.json({ error: "Script required (string)" }, { status: 400 });
  }
  if (script.length > 10000) {
    return NextResponse.json({ error: "Script too long (max 10000 characters)" }, { status: 400 });
  }

  const safeConfig = config || {};

  try {
    let voiceUrl: string | null = null;
    let videoUrl: string | null = null;
    let remoteVideoUrl: string | null = null;
    let jobId: string | null = null;

    // Step 1: Generate Voice
    if (videoType === "ugc") {
      voiceUrl = await generateElevenLabsVoice(script);
    }

    // Step 2: Generate Video
    if (videoType === "ai-clone") {
      // ── Use new provider system (Day 4) ──
      const { routeJob } = await import("@/lib/video/provider-router");
      const job = await routeJob({
        source: "app_script_to_video",
        owner: safeConfig.owner || "internal",
        script,
        avatarId: safeConfig.avatarId || process.env.HEYGEN_DEFAULT_AVATAR_ID || "",
        config: safeConfig,
      });

      return NextResponse.json({
        success: true,
        jobId: job.id,
        providerMode: job.providerMode,
        status: job.status,
        message: "Video job created. Poll /api/video/status?jobId=" + job.id + " for updates.",
      });
    } else {
      const operationName = await generateVeo3Video(script, safeConfig, voiceUrl);
      // Step 3: Poll for completion and save video
      if (operationName && !operationName.startsWith("https://")) {
        const result = await pollVeo3Operation(operationName);
        videoUrl = result.localUrl;
        remoteVideoUrl = result.remoteUrl;
      } else {
        videoUrl = operationName;
      }
    }

    return NextResponse.json({
      success: true,
      voiceUrl,
      videoUrl,
      remoteVideoUrl,
      jobId,
      status: "complete",
    });
  } catch (error) {
    console.error("[produce] Error:", error);
    return NextResponse.json(
      { error: "Video production failed. Please try again.", status: "error" },
      { status: 500 }
    );
  }
}

/* ───── ElevenLabs Voice Generation ───── */
async function generateElevenLabsVoice(script: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "Pyxfro0Wuu0Eid6hUK5p"; // Default: Manny

  if (!apiKey) {
    console.log("[ElevenLabs] No API key — returning demo URL");
    return "https://demo.elevenlabs.io/sample.mp3";
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: cleanScriptForVoice(script),
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error: ${err}`);
  }

  // In production: upload to R2/GDrive and return URL
  // For now: return a placeholder indicating success
  return "elevenlabs://voice-generated";
}

/* ───── HeyGen Avatar Video ───── */
async function generateHeyGenVideo(
  script: string,
  config: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    console.log("[HeyGen] No API key — returning demo URL");
    return "https://demo.heygen.com/sample.mp4";
  }

  // Create video
  const res = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: config.avatarId || "default",
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: cleanScriptForVoice(script),
            voice_id: config.voiceId || "en-US-JennyNeural",
          },
          background: {
            type: "color",
            value: config.background === "studio" ? "#0d0d1a" : "#1a1a2e",
          },
        },
      ],
      dimension: { width: 1080, height: 1920 },
      aspect_ratio: "9:16",
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HeyGen error: ${err}`);
  }

  const data = await res.json();
  return data.data?.video_id || "heygen://video-queued";
}

/* ───── Google Veo 3 Video Generation ───── */
async function generateVeo3Video(
  script: string,
  config: Record<string, unknown>,
  voiceUrl: string | null
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.log("[Veo 3] No API key — returning demo URL");
    return "https://demo.google.com/veo3-sample.mp4";
  }

  // Build cinematic scene description with professional standards
  const genderDesc = config.gender || "person";
  const ageDesc = config.ageRange || "adult";
  const backgroundDesc = config.background || "studio";

  // Map background to cinematic setting
  const settingMap: Record<string, string> = {
    studio: "dark, moody studio with deep black background, subtle rim lighting from behind, professional 3-point Rembrandt lighting setup",
    office: "sleek modern office with floor-to-ceiling windows, soft natural daylight, shallow depth of field blurring the cityscape behind",
    outdoor: "golden hour outdoor location, warm backlit sun creating a natural halo, bokeh background with soft green foliage",
    minimal: "clean white cyclorama studio, soft diffused lighting, high-key commercial look with no harsh shadows",
  };
  const setting = settingMap[String(backgroundDesc)] || settingMap.studio;

  // Build B-roll instructions
  const bRollInstruction = config.bRoll
    ? `Cut to ${config.bRollStyle || "lifestyle"} B-roll between main shots — cinematic slow-motion detail shots, smooth gimbal movements, 24fps for filmic look.`
    : "Single continuous shot, no cuts. Use subtle camera movement — slow push-in or gentle parallax to keep it dynamic.";

  const prompt = `Cinematic ${config.videoFormat || "talking-head"} video, shot on Sony FX3 with 35mm f/1.4 lens.

SUBJECT: A confident ${ageDesc} ${genderDesc}, well-groomed, wearing premium business attire. Speaking directly to camera with conviction and energy. Natural hand gestures for emphasis. Eye contact with lens.

SETTING: ${setting}

CAMERA: Medium close-up framed at rule-of-thirds. Shallow depth of field (f/1.4). Subtle slow push-in over the 8-second duration. 24fps cinematic cadence. No camera shake.

LIGHTING: Professional 3-point lighting — key light at 45 degrees with soft modifier, fill at 1:3 ratio, hair/rim light from behind at 2 stops above key. Warm skin tones (3200K key, 5600K rim for teal-orange separation).

COLOR: Cinematic color grade — slightly desaturated midtones, rich shadows with subtle teal push, warm highlights. Crushed blacks for that premium look. Film-like grain.

${bRollInstruction}

CRITICAL: Do NOT add any text, titles, captions, or overlays to the video. No watermarks. No lower thirds. No motion graphics. Just clean cinematic footage. Text overlays will be added in post-production.

AUDIO: The subject speaks with a confident, measured cadence. Clear audio, no background music. Speaking topic: "${script.substring(0, 150).replace(/"/g, "'")}"

MOOD: Premium, aspirational, authoritative — like a high-end business masterclass or Apple keynote. This should look like it cost $10,000 to produce.`;

  console.log("[Veo 3] Generating video with prompt:", prompt.substring(0, 100) + "...");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio: String(config.aspectRatio || "9:16"),
          personGeneration: "allow_all",
          durationSeconds: 8,
        },
      }),
      signal: AbortSignal.timeout(120000),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) {
      throw new Error("Veo 3 quota exceeded — check your Google AI billing plan at ai.google.dev");
    }
    throw new Error(`Veo 3 error (${res.status}): ${errText.substring(0, 200)}`);
  }

  const data = await res.json();
  console.log("[Veo 3] Response:", JSON.stringify(data).substring(0, 200));
  return data.name || "veo3://video-queued";
}

/* ───── Veo 3 Operation Polling ───── */
async function pollVeo3Operation(operationName: string): Promise<{ localUrl: string; remoteUrl: string | null }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("No Google API key for polling");

  const maxAttempts = 60; // 60 * 5s = 5 minutes max (standard model takes ~2-3 min)
  const pollInterval = 5000; // 5 seconds

  console.log(`[Veo 3] Polling operation: ${operationName}`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`,
      { signal: AbortSignal.timeout(30000) }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Veo 3] Poll error (attempt ${attempt + 1}):`, errText.substring(0, 200));
      if (res.status === 429) {
        // Wait longer on rate limit
        await new Promise((resolve) => setTimeout(resolve, 30000));
        continue;
      }
      throw new Error(`Veo 3 poll error: ${errText.substring(0, 200)}`);
    }

    const data = await res.json();
    console.log(`[Veo 3] Poll attempt ${attempt + 1}: done=${data.done}`);

    if (data.done) {
      // Extract video from response
      const videos = data.response?.generateVideoResponse?.generatedSamples
        || data.response?.videos
        || [];

      if (videos.length === 0) {
        console.log("[Veo 3] Operation done but no videos found:", JSON.stringify(data).substring(0, 500));
        throw new Error("Video generation completed but no video data returned");
      }

      // Get video data from sample
      const video = videos[0];
      const videoUri = video?.video?.uri || video?.uri || "";
      const videoBase64 = video?.video?.bytesBase64Encoded || video?.bytesBase64Encoded || null;

      console.log("[Veo 3] Video URI:", videoUri ? videoUri.substring(0, 100) : "none");
      console.log("[Veo 3] Has base64:", !!videoBase64);

      const filename = `veo3-${Date.now()}.mp4`;
      const videosDir = path.join(process.cwd(), "public", "videos");
      await mkdir(videosDir, { recursive: true });
      const filePath = path.join(videosDir, filename);

      // Case 1: Download URL (most common with Veo 3)
      if (videoUri && videoUri.startsWith("http")) {
        console.log("[Veo 3] Downloading video from URL...");
        const downloadUrl = videoUri.includes("?")
          ? `${videoUri}&key=${apiKey}`
          : `${videoUri}?key=${apiKey}`;

        const dlRes = await fetch(downloadUrl, {
          signal: AbortSignal.timeout(60000),
        });
        if (!dlRes.ok) {
          throw new Error(`Failed to download video: ${dlRes.status} ${dlRes.statusText}`);
        }
        const buffer = Buffer.from(await dlRes.arrayBuffer());
        await writeFile(filePath, buffer);
        console.log(`[Veo 3] Video saved: ${filePath} (${buffer.length} bytes)`);
        return { localUrl: `/videos/${filename}`, remoteUrl: downloadUrl };
      }

      // Case 2: Base64 encoded data
      if (videoBase64) {
        const base64Data = videoBase64.replace(/^data:video\/mp4;base64,/, "");
        await writeFile(filePath, Buffer.from(base64Data, "base64"));
        console.log(`[Veo 3] Video saved from base64: ${filePath}`);
        return { localUrl: `/videos/${filename}`, remoteUrl: null };
      }

      console.log("[Veo 3] Video data structure:", JSON.stringify(video).substring(0, 300));
      return { localUrl: `veo3://completed-${operationName.split("/").pop()}`, remoteUrl: null };
    }
  }

  throw new Error("Video generation timed out after 5 minutes — try again");
}
/* ───── Utilities ───── */
function cleanScriptForVoice(script: string): string {
  return script
    .replace(/═+/g, "")
    .replace(/─+/g, "")
    .replace(/HOOK \([\d.-]+s\):/g, "")
    .replace(/SCRIPT:/g, "")
    .replace(/TEXT OVERLAYS:[\s\S]*/g, "")
    .replace(/CAPTION:[\s\S]*/g, "")
    .replace(/\[[\d.-]+s\].*\n/g, "")
    .replace(/Modifiers:[\s\S]*/g, "")
    .replace(/\(Demo mode[\s\S]*/g, "")
    .trim();
}
