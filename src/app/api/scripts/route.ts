import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/scripts
 * Generates viral scripts using Claude (primary) → Groq (fallback) → Fireworks (fallback)
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { topic, modifiers } = body;
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Topic required (string)" }, { status: 400 });
  }
  if (topic.length > 2000) {
    return NextResponse.json({ error: "Topic too long (max 2000 characters)" }, { status: 400 });
  }

  const modifierList = Array.isArray(modifiers) ? modifiers : [];
  const modifierContext = parseModifiers(modifierList);

  const systemPrompt = `You are a world-class viral content scriptwriter. You've written scripts that generated 10M+ views.
Write viral short-form video scripts that are scroll-stopping, direct, and packed with value.

Brand: BRR (Business Resilience Revolution) by ManTech Designs / Manny Castellano
Voice: Direct, no-BS, tactical, a little street-smart, faith-embedded
Audience: Business owners doing $500K-$5M/year who want to grow and stop leaking profit

${modifierContext}

Return the script as clean, formatted text. Include:
- HOOK (first 1.5 seconds — the text overlay)
- SCRIPT (the full dialogue with timestamps)
- TEXT OVERLAYS (key text to show on screen)
- CAPTION (for posting)`;

  const userMessage = `Write a viral script about: "${topic}"`;

  // Try providers in order: Claude → Groq → Fireworks
  const providers = [
    { name: "Claude", fn: () => callClaude(systemPrompt, userMessage) },
    { name: "Groq", fn: () => callGroq(systemPrompt, userMessage) },
    { name: "Fireworks", fn: () => callFireworks(systemPrompt, userMessage) },
  ];

  for (const provider of providers) {
    try {
      const result = await provider.fn();
      if (result) {
        return NextResponse.json({ script: result, provider: provider.name });
      }
    } catch (err) {
      console.error(`[${provider.name}] Failed:`, err);
      continue;
    }
  }

  // All providers failed — return mock
  return NextResponse.json({ script: generateMockScript(topic, modifierList), provider: "demo" });
}

/* ───── Claude (Anthropic) ───── */
async function callClaude(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.8,
      system,
      messages: [{ role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || null;
}

/* ───── Groq (Ultra-fast) ───── */
async function callGroq(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

/* ───── Fireworks AI ───── */
async function callFireworks(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "accounts/fireworks/models/llama-v3p3-70b-instruct",
      temperature: 0.8,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Fireworks error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

/* ───── Modifier Parser ───── */
function parseModifiers(mods: string[]): string {
  const parts: string[] = [];

  for (const mod of mods) {
    if (mod === "--clean") parts.push("Format: Voiceover-ready. No stage directions, just clean dialogue.");
    else if (mod.startsWith("--platform=")) {
      const platform = mod.split("=")[1];
      parts.push(`Optimize for: ${platform}. Use ${platform}-specific best practices.`);
    }
    else if (mod === "--multi=3") parts.push("Generate 3 DIFFERENT scripts with different angles on the same topic.");
    else if (mod === "--viral-only") parts.push("Only output if you believe this has a viral score of 8+ out of 10.");
    else if (mod.startsWith("--style=")) {
      const style = mod.split("=")[1];
      parts.push(`Style: ${style} format.`);
    }
    else if (mod.startsWith("--tone=")) {
      const tone = mod.split("=")[1];
      parts.push(`Tone: ${tone}.`);
    }
    else if (mod.startsWith("--length=")) {
      const seconds = mod.split("=")[1];
      parts.push(`Target length: ${seconds} seconds.`);
    }
    else if (mod === "--hook-test") parts.push("Generate 10 different hooks for A/B testing. Just the hooks, not full scripts.");
    else if (mod.startsWith("--series=")) {
      const count = mod.split("=")[1];
      parts.push(`Create a ${count}-part series with cliffhangers between each part.`);
    }
    else if (mod.startsWith("--convert-to=")) {
      const goal = mod.split("=")[1];
      parts.push(`Optimize CTA for: ${goal}. End with a conversion-focused call to action.`);
    }
  }

  return parts.length > 0
    ? "MODIFIER INSTRUCTIONS:\n" + parts.map((p) => `- ${p}`).join("\n")
    : "";
}

/* ───── Mock Fallback ───── */
function generateMockScript(topic: string, modifiers: string[]): string {
  return `═══ VIRAL SCRIPT ═══

HOOK (0-1.5s):
"${topic}? Here's what nobody tells you..."

SCRIPT:
[0-1.5s] Face to camera, lean in
"${topic}? Here's what nobody tells you..."

[1.5-5s] Problem setup
"Most business owners are making this ONE mistake..."

[5-20s] Value delivery
"Here's the framework that changed everything for our clients..."

[20-30s] Close
"If that hit different, drop a 🔥 and follow for more tactical breakdowns."

TEXT OVERLAYS:
- "${topic.toUpperCase()}"
- "THE FRAMEWORK:"
- "FOLLOW FOR MORE"

CAPTION:
Most people don't talk about this...

${topic} is one of those things that can 10x your business if you get it right.

Here's the exact framework 👆

#business #entrepreneur #growth

───
Modifiers: ${modifiers.join(" ") || "none"}
(Demo mode — connect API key in Settings for real scripts)`;
}
