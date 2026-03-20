import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * POST /api/produce/scene
 * Generates video for a single scene with professional cinematography direction.
 * Returns up to 4 video variations for the user to hand-pick.
 */

interface SceneInput {
  description: string;
  emotion: string;
  dialogue: string;
  camera: string;
  setting: string;
  referenceImage: string | null; // base64
}

const EMOTION_MAP: Record<string, string> = {
  confident: "speaks with rock-solid confidence, steady eye contact, measured powerful gestures. Controlled energy, alpha presence.",
  intense: "delivers with raw intensity, leaning slightly forward, eyes locked on lens. Passionate urgency. Veins-in-neck energy.",
  bold: "bold, unapologetic delivery. Strong declarative statements. Chin slightly raised, owning every word.",
  calm: "composed and centered. Slow, deliberate cadence. Slight pauses for emphasis. Serene authority.",
  excited: "infectious enthusiasm, animated gestures, genuine smile. High energy without being manic. Motivational speaker vibes.",
  sad: "vulnerable, authentic emotion. Slower pace, reflective pauses. Genuine empathy. Storytelling intimacy.",
  urgent: "time-sensitive urgency. Quick cuts, forward lean, raised vocal energy. Creating FOMO. 'You NEED to hear this' energy.",
  inspirational: "uplifting, visionary delivery. Crescendo build. Eyes bright with possibility. TED-talk quality inspiration.",
};

const CAMERA_MAP: Record<string, string> = {
  "close-up": "Tight close-up: face fills 70% of frame. Shot on 85mm f/1.2 for extreme shallow DOF. Intimate, powerful.",
  medium: "Medium close-up: chest/shoulders to head. Shot on 50mm f/1.4. Professional talking-head framing, rule of thirds.",
  wide: "Medium-wide: waist up with environment visible. Shot on 35mm f/1.4. Establishes context and setting clearly.",
  "over-shoulder": "Over-the-shoulder angle: camera slightly behind and to the side. Creates voyeuristic intimacy. 35mm lens.",
  broll: "Pure B-roll: NO person in frame. Cinematic detail shots — product, environment, abstract visuals. Slow motion. 24fps.",
};

const SETTING_MAP: Record<string, string> = {
  studio: "Deep black void studio. Single dramatic rim light from behind creating a halo silhouette. Rembrandt key light at 45°. Hollywood interview setup. Moody, premium, like a Netflix documentary.",
  office: "Sleek corner office, floor-to-ceiling windows. Golden hour light streaming in. Modern minimalist décor. Shallow DOF blurs the cityscape. CEO-energy setting.",
  outdoor: "Golden hour exterior. Warm backlight creating sun flare and golden rim. Bokeh foliage background. Natural, aspirational. Shot looks like a travel commercial.",
  minimal: "Pure white cyclorama studio. Soft, even lighting from both sides. High-key commercial look. Clean, Apple-product-launch aesthetic. No shadows.",
  custom: "Professional studio environment with cinematic lighting.",
};

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { scene, sampleCount = 1 } = body as { scene: SceneInput; sampleCount: number };

  if (!scene || (!scene.description && !scene.dialogue)) {
    return NextResponse.json({ error: "Scene description or dialogue required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_API_KEY required — add it in Settings" }, { status: 500 });
  }

  try {
    const prompt = buildScenePrompt(scene);
    console.log("[Scene] Prompt:", prompt.substring(0, 200) + "...");

    // Generate video(s)
    const videos: string[] = [];
    // Veo 3 doesn't support sampleCount, so we make sequential calls
    const callCount = Math.min(sampleCount, 4);

    for (let i = 0; i < callCount; i++) {
      console.log(`[Scene] Generating variation ${i + 1}/${callCount}...`);
      try {
        const videoUrl = await generateSceneVideo(apiKey, prompt, scene.referenceImage);
        if (videoUrl) videos.push(videoUrl);
      } catch (err) {
        console.error(`[Scene] Variation ${i + 1} failed:`, (err as Error).message);
      }
    }

    return NextResponse.json({ success: true, videos });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

function buildScenePrompt(scene: SceneInput): string {
  const emotion = EMOTION_MAP[scene.emotion] || EMOTION_MAP.confident;
  const camera = CAMERA_MAP[scene.camera] || CAMERA_MAP.medium;
  const setting = SETTING_MAP[scene.setting] || SETTING_MAP.studio;

  const parts: string[] = [];

  parts.push(`CINEMATIC SCENE — 8 seconds. Shot on RED V-RAPTOR with Cooke Anamorphic lenses. 24fps. Cinema-grade production value.`);

  // Visual description
  if (scene.description) {
    parts.push(`\nVISUAL DIRECTION: ${scene.description}`);
  }

  // Setting
  parts.push(`\nSETTING: ${setting}`);

  // Camera
  parts.push(`\nCAMERA: ${camera} Subtle slow push-in throughout the 8 seconds. Smooth dolly movement. No camera shake.`);

  // Lighting
  parts.push(`\nLIGHTING: Professional 3-point setup. Key light through large softbox at 45°. Fill side at 1:3 ratio. Strong backlight/rim creating hair separation. Warm skin tones (4000K). Color temperature split — warm key, cool rim for teal-orange separation.`);

  // Color
  parts.push(`\nCOLOR GRADE: Cinematic LUT applied — slight teal in shadows, warm golden highlights. Crushed blacks. Subtle film grain (ISO 800 look). Desaturated midtones for that premium editorial feel.`);

  // Performance/emotion
  if (scene.camera !== "broll") {
    parts.push(`\nPERFORMANCE: Subject ${emotion}`);
  }

  // Dialogue
  if (scene.dialogue) {
    parts.push(`\nDIALOGUE: The subject speaks these exact words with ${scene.emotion} energy: "${scene.dialogue.substring(0, 200).replace(/"/g, "'")}"`);
    parts.push(`\nAUDIO: Crystal clear voice recording. No background music. No ambient noise. Studio-quality vocal capture.`);
  }

  // Critical no-text rule
  parts.push(`\nCRITICAL RULES:
- Do NOT add ANY text, titles, captions, subtitles, or overlays to the video.
- Do NOT add watermarks, logos, or lower thirds.
- Do NOT add motion graphics or animated text.
- Just clean, raw, premium cinematic footage.
- This should look like it was produced by a Hollywood cinematographer.
- Think: Apple keynote + Netflix documentary + high-end brand commercial.`);

  return parts.join("");
}

async function generateSceneVideo(apiKey: string, prompt: string, referenceImage: string | null): Promise<string | null> {
  // Build request body
  const instance: Record<string, unknown> = { prompt };
  if (referenceImage) {
    instance.image = {
      bytesBase64Encoded: referenceImage,
      mimeType: "image/jpeg",
    };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [instance],
        parameters: {
          aspectRatio: "9:16",
          personGeneration: "allow_all",
          durationSeconds: 8,
        },
      }),
      signal: AbortSignal.timeout(120000),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) throw new Error("Quota exceeded — try again later");
    throw new Error(`Veo 3 error (${res.status}): ${errText.substring(0, 200)}`);
  }

  const data = await res.json();
  const operationName = data.name;
  if (!operationName) throw new Error("No operation returned");

  // Poll for completion
  const maxAttempts = 60;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 5000));

    const pollRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`,
      { signal: AbortSignal.timeout(30000) }
    );

    if (!pollRes.ok) {
      if (pollRes.status === 429) {
        await new Promise((r) => setTimeout(r, 30000));
        continue;
      }
      throw new Error(`Poll error: ${pollRes.status}`);
    }

    const pollData = await pollRes.json();
    if (pollData.done) {
      const videos = pollData.response?.generateVideoResponse?.generatedSamples
        || pollData.response?.videos
        || [];

      if (videos.length === 0) throw new Error("No video data returned");

      const video = videos[0];
      const videoUri = video?.video?.uri || video?.uri || "";
      const videoBase64 = video?.video?.bytesBase64Encoded || video?.bytesBase64Encoded || null;

      const filename = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 5)}.mp4`;
      const videosDir = path.join(process.cwd(), "public", "videos");
      await mkdir(videosDir, { recursive: true });
      const filePath = path.join(videosDir, filename);

      if (videoUri && videoUri.startsWith("http")) {
        const downloadUrl = videoUri.includes("?") ? `${videoUri}&key=${apiKey}` : `${videoUri}?key=${apiKey}`;
        const dlRes = await fetch(downloadUrl, { signal: AbortSignal.timeout(60000) });
        if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);
        await writeFile(filePath, Buffer.from(await dlRes.arrayBuffer()));
        console.log(`[Scene] Saved: ${filePath}`);
        return `/videos/${filename}`;
      }

      if (videoBase64) {
        const base64Data = videoBase64.replace(/^data:video\/mp4;base64,/, "");
        await writeFile(filePath, Buffer.from(base64Data, "base64"));
        return `/videos/${filename}`;
      }

      throw new Error("Unknown video format");
    }
  }

  throw new Error("Generation timed out");
}
