# Content Forge — Master Roadmap

> **This is the source of truth.** Every priority, every step, every decision lives here.

---

## 🔴 Priority Order (Honest Assessment)

The product needs to **work** before we scale it. Pretty UI means nothing if clicking "Produce Video" does nothing. Here's the real order:

| # | Priority | Why This Order |
|---|----------|----------------|
| **1** | Make the product actually work | Nothing else matters if the core features don't function |
| **2** | Supabase setup (auth + DB + Pro gating) | Foundation for users, payments, and data persistence |
| **3** | Chrome Extension API endpoint | So scraped data actually flows into the app |
| **4** | Wire Research Automation to real APIs | Brave, Jina, SerpAPI need to return real data |
| **5** | Connect external OpenClaw to Micro OC | Webhook bridge between AntiMatter and Content Forge |
| **6** | Agent Swarm skill for Micro OC | Multi-agent delegation (Research → Script → Production → Schedule) |
| **7** | Telegram bridge for Micro OC | Chat interface for the embedded agent |

---

## 1. 🔧 Make the Product Actually Work

**Status:** 🔴 Not started — this is the #1 blocker

The UI exists but the backend connections are missing. Nothing generates real output yet.

### What needs to connect:

| Feature | Current State | Needs |
|---------|--------------|-------|
| **Video Production** | UI only — clicking "Produce" does nothing | HeyGen API or Creatomate API integration |
| **Script Generator** | UI only — no AI call | OpenAI / Gemini / Ollama API call to generate scripts |
| **Voiceover** | Not connected | ElevenLabs API or HeyGen voice clone |
| **Image Generation** | Not connected | Replicate (Flux) or Gemini Imagen |
| **Research Engine** | UI only | Brave Search API, Jina Reader, SerpAPI |
| **AutoPilot scheduling** | UI only | Cron jobs via Inngest/Trigger.dev + Postiz API |
| **Brand Profile** | Form exists but doesn't save | Supabase DB (depends on Priority #2) |
| **Asset Library** | Empty | Supabase Storage or Cloudflare R2 |

### Recommended approach:
1. Start with **Script Generator** — call OpenAI/Gemini to actually generate scripts
2. Then **Video Production** — integrate HeyGen or Creatomate
3. Then **Voiceover** — ElevenLabs
4. Then **Research** — Brave + Jina
5. Then **AutoPilot** — cron scheduling

### API keys needed:
- `OPENAI_API_KEY` — script generation, content AI
- `HEYGEN_API_KEY` — video production with AI avatars
- `ELEVENLABS_API_KEY` — voiceover generation
- `BRAVE_SEARCH_API_KEY` — research (free tier available)
- `JINA_API_KEY` — URL content extraction (free tier)
- `SERPAPI_KEY` — Google Trends data

---

## 2. 🗄️ Supabase Setup (Auth + Database + Pro Gating)

**Status:** 🔴 Not started

### What this unlocks:
- Real user accounts (signup, login, OAuth)
- Pro tier gating (Chrome Extension, advanced features)
- Data persistence (scripts, videos, brand profiles, settings)
- File storage (videos, assets, thumbnails)
- Realtime updates (agent status, production progress)

### Tables needed:
- `users` — account info, pro status
- `projects` — user's content projects
- `scripts` — generated scripts with metadata
- `videos` — produced videos with URLs
- `brand_profiles` — saved brand voice, ICP, frameworks
- `research_jobs` — research automation history
- `skills` — installed OpenClaw skills per user
- `api_keys` — encrypted user API keys
- `credits` — token balance and usage history (future)

### Auth flow:
- Email/password + Google OAuth
- Pro status stored in `users.is_pro`
- Middleware checks Pro status for gated features

---

## 3. 🧩 Chrome Extension API Endpoint

**Status:** 🔴 Not started

### Endpoint: `POST /api/extension/ingest`

```
Body: {
  platform: "tiktok" | "instagram" | "youtube" | ...,
  type: "feed" | "profile",
  data: { posts: [...] } | { profile: {...} },
  source: "extension",
  timestamp: ISO string
}
```

### What it does:
1. Validates the request (check Pro status via auth token)
2. Stores scraped data in Supabase `research_data` table
3. Triggers Viral Intelligence ranking recalculation
4. Returns success + data count

**Depends on:** Priority #2 (Supabase) for storage

---

## 4. 🔬 Wire Research Automation to Real APIs

**Status:** 🔴 Not started

### Connections:
- **Brave Search** → topic research, trending content
- **Jina AI Reader** → extract content from any URL
- **SerpAPI** → Google Trends data, SERP analysis
- **Apify** (optional) → deep TikTok/Instagram scraping via API

### Flow:
1. User enters topic/competitor in Research Auto page
2. Backend calls Brave → gets top results
3. Backend calls Jina → extracts content from each URL
4. Results stored in Supabase
5. Viral Intelligence page ranks by engagement metrics

---

## 5. 🦀 Connect External OpenClaw to Micro OC

**Status:** 🔴 Not started

### Architecture:
```
Your AntiMatter OpenClaw (Telegram)
        ↕ Webhook API
Content Forge Micro OC (Embedded)
        ↕ Internal
Skills Hub + Research + Production
```

### Endpoint: `POST /api/openclaw/bridge`
- Receives commands from external OpenClaw
- Routes to appropriate Micro OC function
- Returns results back via webhook

### Use cases:
- "Produce a video about X" from Telegram → Micro OC handles it inside Content Forge
- Micro OC pulls Viral Intelligence data → sends insights to external OC
- External OC sends research findings → Micro OC creates content from them

---

## 6. 🐙 Agent Swarm Skill

**Status:** 🔴 Not started

### The swarm:
| Agent | Input | Output |
|-------|-------|--------|
| 🔬 Research Agent | Topic/competitor | Trends, viral posts, insights |
| ✍️ Script Agent | Research findings | Hook + script + captions |
| 🎬 Production Agent | Script | Video render job |
| 📅 Scheduling Agent | Produced video | Scheduled post at optimal time |
| 🧠 Strategy Agent | Analytics data | Adjustments to all agents |

### Implementation:
- New skill file: `skills/agent-swarm.md`
- Each agent is a prompt chain with specific context
- Strategy Agent reviews analytics and adjusts other agents' parameters
- Runs via AutoPilot as a full pipeline

---

## 7. 📱 Telegram Bridge for Micro OC

**Status:** 🔴 Not started

### What's already built:
- Telegram config UI (Bot Token + User ID) ✅
- Config saves to localStorage ✅

### What's needed:
- `POST /api/telegram/webhook` — receives Telegram messages
- Bot registration with BotFather webhook URL
- Message routing: user message → Micro OC → response → Telegram reply
- White-label: only responds to configured User ID

**Depends on:** Priority #2 (Supabase) for persistent config storage

---

## 🏗️ Backend Stack (Decided)

| Layer | Tech | Status |
|-------|------|--------|
| Frontend | Next.js 15 (App Router) | ✅ Built |
| API | Next.js API Routes → tRPC later | 🔴 Needs real endpoints |
| Database | Supabase (PostgreSQL) | 🔴 Not set up |
| Auth | Supabase Auth | 🔴 Not set up |
| Queue/Jobs | Inngest or Trigger.dev | 🔴 Not set up |
| File Storage | Supabase Storage / Cloudflare R2 | 🔴 Not set up |
| Deployment | Vercel (web) + Railway (workers) | 🟡 Railway exists for OC |

## 📱 Multi-Platform Strategy

| Phase | Platform | Tech | Timeline |
|-------|----------|------|----------|
| Phase 1 | Web App | Next.js (current) | Now |
| Phase 2 | Mobile | Capacitor.js (wraps Next.js) | After web is stable |
| Phase 3 | Desktop | Tauri (bundles Ollama locally) | After mobile |

## 💰 Credits System (Future)

- Users buy Content Forge Credits
- All API calls proxied through our backend
- Cost + 10-15% margin per action
- Users never leave the app, never see another API key
- Example: 1 video = 50 credits, 1 voiceover = 20 credits, 1 research = 10 credits
