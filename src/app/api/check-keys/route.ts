import { NextResponse } from "next/server";

/**
 * GET /api/check-keys
 * Returns which API keys are configured (without exposing the actual keys).
 * Used by frontend to show "add your key" prompts.
 */
export async function GET() {
  return NextResponse.json({
    google: !!process.env.GOOGLE_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    claude: !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
    fireworks: !!process.env.FIREWORKS_API_KEY,
    brave: !!(process.env.BRAVE_SEARCH_API_KEY || process.env.BRAVE_API_KEY),
    heygen: !!process.env.HEYGEN_API_KEY,
  });
}
