import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/research
 * Research engine: Brave Search (web results) + Perplexity (AI analysis) + Claude (idea generation)
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { topic } = body;
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Topic required (string)" }, { status: 400 });
  }
  if (topic.length > 1000) {
    return NextResponse.json({ error: "Topic too long (max 1000 characters)" }, { status: 400 });
  }

  try {
    // Step 1: Search the web with Brave
    const webResults = await searchBrave(topic);

    // Step 2: Get AI analysis from Perplexity or Claude
    const ideas = await generateIdeas(topic, webResults);

    return NextResponse.json({
      ideas,
      webResults: webResults.slice(0, 10),
      source: webResults.length > 0 ? "brave+ai" : "ai-only",
    });
  } catch (error) {
    console.error("[Research] Error:", error);
    return NextResponse.json(
      { ideas: generateMockIdeas(topic), webResults: [], source: "demo" }
    );
  }
}

/* ───── Brave Search ───── */
interface BraveResult {
  title: string;
  url: string;
  description: string;
}

async function searchBrave(query: string): Promise<BraveResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY || process.env.BRAVE_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query + " viral content strategy")}&count=10`,
    {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!res.ok) {
    console.error("[Brave] Error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return (data.web?.results || []).map((r: { title: string; url: string; description: string }) => ({
    title: r.title,
    url: r.url,
    description: r.description,
  }));
}

/* ───── Generate Ideas (Claude → Groq → Perplexity fallback) ───── */
async function generateIdeas(topic: string, webResults: BraveResult[]): Promise<IdeaResult[]> {
  const webContext = webResults.length > 0
    ? `\n\nHere are current web results about this topic to inform your ideas:\n${webResults.map((r, i) => `${i + 1}. ${r.title}: ${r.description}`).join("\n")}`
    : "";

  const systemPrompt = `You are a viral content strategist who has generated 100M+ views across platforms. 
You research trends, analyze competition, and generate viral content ideas.
Return ONLY valid JSON — an array of 30 objects with this structure:
[{"title":"...","hook":"...","angle":"contrarian|story|results|pov|fact|question","viralScore":8,"category":"short-form|carousel|reel|thread|story"}]
viralScore: 1-10 (10 = most viral potential). Be honest with scores.
Focus on scroll-stopping hooks that make people NEED to watch.`;

  const userMessage = `Generate 30 viral content ideas for the topic: "${topic}"
Target: Business owners doing $500K-$5M/year.
Brand voice: Direct, tactical, bold, premium, faith-aware.${webContext}`;

  // Try Claude first, then Groq
  const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  let content: string | null = null;

  if (claudeKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          temperature: 0.9,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json();
        content = data.content?.[0]?.text || null;
      }
    } catch (err) {
      console.error("[Claude] Failed for research:", err);
    }
  }

  if (!content && groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.9,
          max_tokens: 4096,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json();
        content = data.choices?.[0]?.message?.content || null;
      }
    } catch (err) {
      console.error("[Groq] Failed for research:", err);
    }
  }

  if (!content) {
    return generateMockIdeas(topic);
  }

  // Parse JSON from AI response
  try {
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return generateMockIdeas(topic);
  }
}

/* ───── Types ───── */
interface IdeaResult {
  title: string;
  hook: string;
  angle: string;
  viralScore: number;
  category: string;
}

/* ───── Mock Fallback ───── */
function generateMockIdeas(topic: string): IdeaResult[] {
  const angles = ["contrarian", "story", "results", "pov", "fact", "question"];
  const categories = ["short-form", "carousel", "reel", "thread"];

  return Array.from({ length: 30 }, (_, i) => ({
    title: `Viral Idea ${i + 1}: ${topic}`,
    hook: `Most people don't realize this about ${topic}...`,
    angle: angles[i % angles.length],
    viralScore: Math.floor(Math.random() * 4) + 6,
    category: categories[i % categories.length],
  }));
}
