/**
 * Content Forge — Brand Defaults
 * Default settings for all content generation.
 * These are used when no custom settings are provided.
 */

export const BRAND = {
  name: "BRR",
  fullName: "Business Resilience Revolution",
  company: "ManTech Designs",
  founder: "Manny Castellano",

  voice: {
    tone: "Direct, no-BS, tactical, street-smart, faith-embedded",
    style: "Confident, premium, energetic, value-packed",
    avoid: "Corporate jargon, fluff, empty promises",
  },

  audience: {
    primary: "Business owners doing $500K-$5M/year",
    pain: "Profit leaks, scaling challenges, lack of systems",
    desire: "Grow revenue, build resilience, automate operations",
  },

  avatar: {
    id: "brr-founder",
    name: "Manny — BRR Founder",
  },

  icp: {
    id: "brr-icp",
    label: "$500K-$5M Business Owner",
  },

  framework: {
    id: "mantech-master",
    label: "ManTech Master Copy",
  },

  offer: {
    id: "profit-audit",
    label: "Profit Leak Audit",
  },
} as const;

export const VOICE = {
  elevenlabs: {
    voiceId: process.env.ELEVENLABS_VOICE_ID || "Pyxfro0Wuu0Eid6hUK5p",
    name: "Manny",
    model: "eleven_multilingual_v2",
    settings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true,
    },
  },
} as const;

export const VIDEO = {
  defaults: {
    aspectRatio: "9:16" as const,
    format: "talking-head",
    background: "studio",
    bRoll: true,
    bRollStyle: "lifestyle",
    durationSeconds: 15,
    personGeneration: "allow_all",
  },

  heygen: {
    avatars: [
      { id: "621197646d5f45d39591236679ab2df6", name: "Manny (Founder)" },
      { id: "bf1fc026218042e9800795b8907c1bbe", name: "Manny Alt" },
    ],
    defaultAvatarId: "621197646d5f45d39591236679ab2df6",
    defaultVoiceId: "en-US-JennyNeural",
  },

  veo3: {
    model: "veo-3.0-generate-preview",
    style: "Premium, cinematic, high-production value, social media vertical. " +
           "Brand: BRR by ManTech Designs. Professional, confident energy.",
  },

  imagen: {
    model: "imagen-3.0-generate-002",
    style: "Premium brand aesthetic. Dark backgrounds with gold/cyan accents. " +
           "Bold typography. Professional, high-end social media design.",
  },
} as const;

export const RESEARCH = {
  defaults: {
    targetAudience: "Business owners doing $500K-$5M/year",
    brandVoice: "Direct, tactical, bold, premium, faith-aware",
    ideaCount: 30,
  },
} as const;

/** Build a consistent system prompt with brand context */
export function getBrandSystemPrompt(role: string = "content creator"): string {
  return `You are a world-class ${role} for ${BRAND.fullName} (${BRAND.name}) by ${BRAND.company}, founded by ${BRAND.founder}.

Brand Voice: ${BRAND.voice.tone}
Style: ${BRAND.voice.style}
Avoid: ${BRAND.voice.avoid}

Target Audience: ${BRAND.audience.primary}
Pain Points: ${BRAND.audience.pain}
Desires: ${BRAND.audience.desire}

Framework: ${BRAND.framework.label}
Primary Offer: ${BRAND.offer.label}`;
}
