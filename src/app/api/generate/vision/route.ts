import { NextRequest, NextResponse } from "next/server";
import { BRAND, VIDEO, getBrandSystemPrompt } from "@/lib/brand-defaults";
/**
 * POST /api/generate/vision
 * Analyze an image with Gemini (Nano Banana) and optionally generate
 * a video from it using Veo 3 or a new image using Imagen.
 *
 * Accepts: multipart/form-data with 'image' file
 *   OR JSON with 'image_base64' + 'mime_type'
 *
 * Query params:
 *   action = 'analyze' | 'generate_video' | 'generate_image' | 'analyze_and_script'
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_API_KEY not configured" },
      { status: 500 }
    );
  }

  let imageBase64: string;
  let mimeType: string;
  let action: string;
  let prompt: string;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    let formData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
    }
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }
    // Limit file size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file too large (max 20MB)" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    imageBase64 = buffer.toString("base64");
    mimeType = file.type || "image/jpeg";
    action = (formData.get("action") as string) || "analyze";
    prompt = (formData.get("prompt") as string) || "";
  } else {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    imageBase64 = body.image_base64;
    mimeType = body.mime_type || "image/jpeg";
    action = body.action || "analyze";
    prompt = body.prompt || "";
    if (!imageBase64) {
      return NextResponse.json({ error: "image_base64 required" }, { status: 400 });
    }
    // Validate base64 size (~1.37x original; 20MB file ≈ 27MB base64)
    if (imageBase64.length > 27 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 20MB)" }, { status: 400 });
    }
  }

  try {
    switch (action) {
      case "analyze":
        return NextResponse.json(await analyzeImage(apiKey, imageBase64, mimeType, prompt));

      case "analyze_and_script":
        return NextResponse.json(await analyzeAndScript(apiKey, imageBase64, mimeType, prompt));

      case "generate_video":
        return NextResponse.json(await generateVideoFromImage(apiKey, imageBase64, mimeType, prompt));

      case "generate_image":
        return NextResponse.json(await generateImageVariation(apiKey, imageBase64, mimeType, prompt));

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[vision] Error:", error);
    return NextResponse.json(
      { error: "Vision processing failed. Please try again." },
      { status: 500 }
    );
  }
}

/* ───── Analyze Image with Gemini ───── */
async function analyzeImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  userPrompt: string
) {
  const prompt = userPrompt || 
    `Analyze this image in detail. Describe what you see, the composition, colors, mood, and any text. ` +
    `Then suggest 3 viral content ideas based on this image for ${BRAND.audience.primary}. ` +
    `Brand: ${BRAND.fullName}. Voice: ${BRAND.voice.tone}.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        }],
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini vision error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated";

  return {
    action: "analyze",
    analysis,
    model: "gemini-2.5-flash",
  };
}

/* ───── Analyze + Generate Video Script ───── */
async function analyzeAndScript(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  userPrompt: string
) {
  const prompt = userPrompt ||
    `${getBrandSystemPrompt("viral content strategist")}

Analyze this image and create a complete viral video script based on it.

Return your response in this exact format:

**ANALYSIS:**
[describe what you see in the image]

**HOOK (0-1.5s):**
[scroll-stopping opening line inspired by the image]

**SCRIPT:**
[full ${VIDEO.defaults.durationSeconds}-second voiceover-ready script]

**TEXT OVERLAYS:**
[list of text to show on screen]

**VIDEO DIRECTION:**
[describe the video: how to film, transitions, B-roll ideas, how to use the original image]

**CAPTION:**
[social media caption with hashtags]`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        }],
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini vision error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const script = data.candidates?.[0]?.content?.parts?.[0]?.text || "No script generated";

  return {
    action: "analyze_and_script",
    script,
    model: "gemini-2.5-flash",
  };
}

/* ───── Generate Video from Image (Veo 3) ───── */
async function generateVideoFromImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  userPrompt: string
) {
  // Step 1: Analyze image with Gemini to create a video prompt
  const analysisPrompt = 
    "Describe this image in one detailed paragraph for use as a video generation prompt. " +
    "Focus on the scene, subjects, lighting, mood, and movement that should happen. " +
    "Write it as a video direction prompt, e.g. 'A person standing in a modern office, " +
    "camera slowly zooms in as they turn to face the camera with confident expression...'";

  const analysisRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: analysisPrompt },
          ],
        }],
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!analysisRes.ok) {
    const err = await analysisRes.text();
    throw new Error(`Gemini analysis error: ${err}`);
  }

  const analysisData = await analysisRes.json();
  const imageDescription = analysisData.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Step 2: Generate video with Veo 3
  const videoPrompt = userPrompt
    ? `${userPrompt}. Based on this scene: ${imageDescription}`
    : `Create a premium, cinematic ${VIDEO.defaults.aspectRatio} vertical video. ${imageDescription} ${VIDEO.veo3.style}`;

  const videoRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-preview:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: videoPrompt }],
        parameters: {
          aspectRatio: "9:16",
          personGeneration: "allow_all",
          numberOfVideos: 1,
          durationSeconds: 8,
        },
      }),
      signal: AbortSignal.timeout(120000),
    }
  );

  if (!videoRes.ok) {
    const err = await videoRes.text();
    throw new Error(`Veo 3 error: ${err}`);
  }

  const videoData = await videoRes.json();

  return {
    action: "generate_video",
    image_description: imageDescription,
    video_prompt: videoPrompt,
    video_operation: videoData.name || null,
    model: "veo-3.0-generate-preview",
    status: "processing",
    message: "Video generation started. Veo 3 is processing — this may take 1-3 minutes.",
  };
}

/* ───── Generate Image Variation (Imagen 3) ───── */
async function generateImageVariation(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  userPrompt: string
) {
  // Analyze the original image first
  const analysisRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: "Describe this image in detail for image generation. Include style, colors, composition, subjects, mood, and lighting." },
          ],
        }],
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!analysisRes.ok) {
    throw new Error(`Gemini analysis error: ${await analysisRes.text()}`);
  }

  const desc = (await analysisRes.json()).candidates?.[0]?.content?.parts?.[0]?.text || "";

  const imagePrompt = userPrompt
    ? `${userPrompt}. Inspired by: ${desc}`
    : `Create a premium social media image for ${BRAND.fullName}. ${VIDEO.imagen.style} ${desc}`;

  // Generate with Imagen 3
  const genRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: imagePrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "9:16",
          personGeneration: "allow_all",
        },
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!genRes.ok) {
    const err = await genRes.text();
    throw new Error(`Imagen 3 error: ${err}`);
  }

  const genData = await genRes.json();
  const generatedBase64 = genData.predictions?.[0]?.bytesBase64Encoded || null;

  return {
    action: "generate_image",
    original_description: desc,
    prompt_used: imagePrompt,
    image_base64: generatedBase64,
    model: "imagen-3.0-generate-002",
    message: generatedBase64 ? "Image generated successfully" : "No image returned",
  };
}
