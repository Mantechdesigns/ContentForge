"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import AppShell from "../../components/AppShell";

/* ───── Types ───── */
interface Skill {
  id: string;
  name: string;
  description: string;
  category: "marketing" | "content" | "video" | "seo" | "system";
  icon: string;
  installed: boolean;
  preInstalled: boolean;
  version: string;
  capabilities: string[];
  rawMd?: string;
}

/* ───── Pre-built Skills ───── */
const INITIAL_SKILLS: Skill[] = [
  { id: "marketing-strategy", name: "Marketing Strategy", description: "Funnel design, offer positioning, ad copy, campaign planning", category: "marketing", icon: "📈", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Value Ladder", "Hook-Story-Offer", "AIDA", "PAS", "Dream 100"], rawMd: "---\nname: marketing-strategy\ndescription: \"Use when planning marketing campaigns, funnel strategies, offer positioning, or ad copy optimization.\"\ncategory: marketing\n---\n\n# Marketing Strategy Skill\n\n## Purpose\nEquip OpenClaw with expert-level marketing strategy.\n\n## Frameworks\n- Value Ladder\n- Hook-Story-Offer\n- Dream 100\n- AIDA / PAS" },
  { id: "viral-content-creation", name: "Viral Content Creation", description: "Viral hooks, captions, carousel scripts, engagement tactics", category: "content", icon: "🔥", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Hook Formulas", "Platform Captions", "Carousel Scripts", "Content Repurposing"], rawMd: "---\nname: viral-content-creation\ndescription: \"Use when creating viral social media content, hooks, captions, and engagement-optimized posts.\"\ncategory: content\n---\n\n# Viral Content Creation Skill\n\n## Hook Formulas\n- Provocative Statement\n- Curiosity Gap\n- Contrarian Take\n- Direct Challenge\n- Shocking Statistic\n- Story Hook" },
  { id: "video-production", name: "Video Production", description: "AI video scripting, voiceover, B-roll selection, batch production", category: "video", icon: "🎬", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Script-to-Duration", "Auto B-Roll", "Platform Formatting", "Batch Produce"], rawMd: "---\nname: video-production\ndescription: \"Use when producing AI videos, scripting voiceovers, selecting B-roll.\"\ncategory: video\n---\n\n# Video Production Skill\n\n## Formats\n- Quick Hook (15s)\n- Story Reel (30s)\n- Deep Dive (45-60s)\n- Long Form (3-10min)" },
  { id: "seo-optimization", name: "SEO Optimization", description: "Keyword research, meta tags, content structuring, featured snippets", category: "seo", icon: "🔍", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Keyword Research", "Meta Optimization", "Schema Markup", "Competitor Analysis"], rawMd: "---\nname: seo-optimization\ndescription: \"Use when optimizing content for search engines.\"\ncategory: seo\n---\n\n# SEO Optimization Skill\n\n## Capabilities\n- Keyword Research\n- Meta Optimization\n- Schema Markup\n- Content Structuring" },
  { id: "vision-ai", name: "Vision AI", description: "Send images/screenshots → Gemini analyzes → Veo 3 generates videos → Imagen 3 creates variations", category: "video", icon: "👁️‍🗨️", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Image Analysis", "Image → Video (Veo 3)", "Image → Script", "Image Generation (Imagen 3)"], rawMd: "---\nname: vision-ai\ndescription: \"Use when processing images: analyze screenshots, generate videos from photos via Veo 3, create scripts from visuals via Gemini, or generate new images via Imagen 3.\"\ncategory: video\n---\n\n# Vision AI Skill\n\n## Actions\n- **Analyze Image** — Gemini vision describes the image and suggests viral content ideas\n- **Image → Video** — Gemini analyzes image, Veo 3 generates a video from it\n- **Image → Script** — Gemini creates a full viral script based on the image\n- **Image → Image** — Gemini describes, Imagen 3 generates a new variation\n\n## Usage\nSend a photo via Telegram to AntiMatter, or upload via Content Forge.\nDefault brand settings (BRR voice, audience, style) are applied automatically.\n\n## API\nPOST /api/generate/vision\n- action: analyze | analyze_and_script | generate_video | generate_image\n- image_base64: base64 encoded image\n- mime_type: image/jpeg | image/png | image/webp\n- prompt: optional custom prompt" },
  { id: "copywriting-mastery", name: "Copywriting Mastery", description: "Sales pages, email sequences, ad copy — AIDA, PAS, BAB, 4P's", category: "content", icon: "✍️", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Sales Pages", "Email Sequences", "Ad Copy", "A/B Variations"], rawMd: "---\nname: copywriting-mastery\ndescription: \"Use when writing sales copy, email sequences, landing pages, ad copy.\"\ncategory: content\n---\n\n# Copywriting Mastery Skill\n\n## Frameworks\n- AIDA\n- PAS\n- BAB\n- 4 P's\n- Star-Chain-Hook\n- HSO" },
  { id: "funnel-hacking", name: "Funnel Hacking", description: "Reverse-engineer competitor funnels, build proven templates", category: "marketing", icon: "🕵️", installed: true, preInstalled: true, version: "1.0.0", capabilities: ["Funnel Mapping", "Tripwire", "VSL", "Webinar", "Challenge"], rawMd: "---\nname: funnel-hacking\ndescription: \"Use when analyzing competitor funnels or building funnel strategies.\"\ncategory: marketing\n---\n\n# Funnel Hacking Skill\n\n## Funnel Types\n- Tripwire ($7-$47)\n- VSL ($97-$997)\n- Challenge (Community)\n- Webinar ($997-$5K)\n- Book (Authority)" },
  { id: "social-scheduling", name: "Social Scheduling", description: "Auto-post to all platforms at optimal times using engagement data", category: "marketing", icon: "📅", installed: false, preInstalled: false, version: "1.0.0", capabilities: ["Optimal Timing", "Multi-Platform", "Queue Management"] },
  { id: "brand-voice-clone", name: "Brand Voice Clone", description: "Analyze your content and match tone, vocabulary, and style perfectly", category: "content", icon: "🎭", installed: false, preInstalled: false, version: "1.0.0", capabilities: ["Voice Analysis", "Tone Matching", "Style Guide Gen"] },
  { id: "competitor-monitor", name: "Competitor Monitor", description: "Track competitor content, detect new campaigns, alert on trends", category: "marketing", icon: "👁️", installed: false, preInstalled: false, version: "1.0.0", capabilities: ["Auto-Track", "Campaign Detection", "Alerts"] },
  { id: "analytics-reader", name: "Analytics Reader", description: "Read social media analytics, identify patterns, suggest improvements", category: "seo", icon: "📊", installed: false, preInstalled: false, version: "1.0.0", capabilities: ["Pattern Detection", "CTR Analysis", "Improvement Suggestions"] },
];

const categoryColors: Record<string, { color: string; bg: string; label: string }> = {
  marketing: { color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", label: "Marketing" },
  content: { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)", label: "Content" },
  video: { color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", label: "Video" },
  seo: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", label: "SEO" },
  system: { color: "#64748b", bg: "rgba(100, 116, 139, 0.12)", label: "System" },
};

/* ───── Modal Backdrop ───── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: 560, maxHeight: "80vh", overflowY: "auto",
        background: "var(--bg-card)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-lg)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───── Parse YAML frontmatter from .md ───── */
function parseMdSkill(content: string): Partial<Skill> {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const parsed: Record<string, string> = {};
  if (fmMatch) {
    fmMatch[1].split("\n").forEach(line => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) parsed[key.trim()] = rest.join(":").trim().replace(/^["']|["']$/g, "");
    });
  }
  const tags = (parsed.tags || "").split(",").map(t => t.trim()).filter(Boolean).slice(0, 5);
  return {
    id: parsed.name || `skill-${Date.now()}`,
    name: (parsed.name || "Untitled Skill").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: parsed.description || "Custom skill",
    category: (parsed.category as Skill["category"]) || "system",
    icon: "📄",
    version: parsed.version || "1.0.0",
    capabilities: tags.length ? tags : ["Custom"],
    rawMd: content,
  };
}

export default function SkillsHub() {
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [filter, setFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Modals */
  const [viewSkill, setViewSkill] = useState<Skill | null>(null);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showTelegram, setShowTelegram] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  /* Telegram Config */
  const [tgBotToken, setTgBotToken] = useState("");
  const [tgUserId, setTgUserId] = useState("");
  const [tgSaved, setTgSaved] = useState(false);

  /* OC Config */
  const [ocModel, setOcModel] = useState("gpt-4o");
  const [ollamaModel, setOllamaModel] = useState("kimi-k2");
  const [customOllamaModel, setCustomOllamaModel] = useState("");
  const [ocAutoApprove, setOcAutoApprove] = useState(false);
  const [ocTimeout, setOcTimeout] = useState("disabled");
  const [ocPerms, setOcPerms] = useState<Record<string, boolean>>({
    "auto-approve": true,
    "access-research": true,
    "access-viral": true,
    "access-autopilot": true,
    "access-publish": false,
  });
  const [ocSaved, setOcSaved] = useState(false);

  /* ── Load saved config from localStorage on mount ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect
  useState(() => {
    // Schedule the localStorage reads for after initial render via a microtask
    if (typeof window === "undefined") return;
    queueMicrotask(() => {
      try {
        const savedToken = localStorage.getItem("cf_tg_bot_token");
        const savedUserId = localStorage.getItem("cf_tg_user_id");
        const savedModel = localStorage.getItem("cf_oc_model");
        const savedOllama = localStorage.getItem("cf_oc_ollama_model");
        const savedCustomOllama = localStorage.getItem("cf_oc_custom_ollama");
        const savedTimeout = localStorage.getItem("cf_oc_timeout");
        const savedPerms = localStorage.getItem("cf_oc_perms");
        if (savedToken) setTgBotToken(savedToken);
        if (savedUserId) setTgUserId(savedUserId);
        if (savedModel) setOcModel(savedModel);
        if (savedOllama) setOllamaModel(savedOllama);
        if (savedCustomOllama) setCustomOllamaModel(savedCustomOllama);
        if (savedTimeout) setOcTimeout(savedTimeout);
        if (savedPerms) try { setOcPerms(JSON.parse(savedPerms)); } catch { /* ignore */ }
      } catch { /* localStorage unavailable */ }
    });
  });

  const toggleInstall = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, installed: !s.installed } : s));
  };

  const togglePerm = (id: string) => {
    setOcPerms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = filter === "all" ? skills : skills.filter(s => s.category === filter);
  const installedCount = skills.filter(s => s.installed).length;

  /* ── File Upload Handler ── */
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.name.endsWith(".md")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsed = parseMdSkill(content);
        const newSkill: Skill = {
          id: parsed.id || `skill-${Date.now()}`,
          name: parsed.name || file.name.replace(".md", ""),
          description: parsed.description || "Custom uploaded skill",
          category: parsed.category || "system",
          icon: parsed.icon || "📄",
          installed: true,
          preInstalled: false,
          version: parsed.version || "1.0.0",
          capabilities: parsed.capabilities || ["Custom"],
          rawMd: content,
        };
        setSkills(prev => [newSkill, ...prev]);
      };
      reader.readAsText(file);
    });
    setShowUpload(false);
  };

  /* ── Drag & Drop ── */
  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  /* ── File Input ── */
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  /* ── URL Paste ── */
  const handleUrlPaste = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    try {
      const res = await fetch(urlInput, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`Failed to fetch skill (${res.status})`);
      const text = await res.text();
      const parsed = parseMdSkill(text);
      const newSkill: Skill = {
        id: parsed.id || `url-${Date.now()}`,
        name: parsed.name || "URL Skill",
        description: parsed.description || "Installed from URL",
        category: parsed.category || "system",
        icon: "🌐",
        installed: true,
        preInstalled: false,
        version: parsed.version || "1.0.0",
        capabilities: parsed.capabilities || ["Custom"],
        rawMd: text,
      };
      setSkills(prev => [newSkill, ...prev]);
      setUrlInput("");
      setShowUpload(false);
    } catch {
      alert("Could not fetch skill from URL. Make sure it's a raw .md file link.");
    }
    setUrlLoading(false);
  };

  /* ── Edit Save ── */
  const saveEdit = () => {
    if (!editSkill) return;
    const parsed = parseMdSkill(editContent);
    setSkills(prev => prev.map(s => s.id === editSkill.id ? {
      ...s,
      name: parsed.name || s.name,
      description: parsed.description || s.description,
      capabilities: parsed.capabilities || s.capabilities,
      rawMd: editContent,
    } : s));
    setEditSkill(null);
  };

  /* ── Telegram Save → persist + auto-close ── */
  const saveTelegram = () => {
    try {
      localStorage.setItem("cf_tg_bot_token", tgBotToken);
      localStorage.setItem("cf_tg_user_id", tgUserId);
    } catch { /* storage unavailable */ }
    setTgSaved(true);
    setTimeout(() => { setTgSaved(false); setShowTelegram(false); }, 1000);
  };

  /* ── OC Config Save → persist + auto-close ── */
  const saveOcConfig = () => {
    try {
      localStorage.setItem("cf_oc_model", ocModel);
      localStorage.setItem("cf_oc_ollama_model", ollamaModel);
      localStorage.setItem("cf_oc_custom_ollama", customOllamaModel);
      localStorage.setItem("cf_oc_timeout", ocTimeout);
      localStorage.setItem("cf_oc_perms", JSON.stringify(ocPerms));
    } catch { /* storage unavailable */ }
    setOcSaved(true);
    setTimeout(() => { setOcSaved(false); setShowConfig(false); }, 1000);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>🧠 Skills Hub</h2>
            <p>Install skills to teach your OpenClaw agent new capabilities.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "#22c55e", fontWeight: 600 }}>{installedCount} installed</span>
            <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)} style={{ fontSize: "var(--text-xs)", background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
              + Upload .md Skill
            </button>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">

        {/* ── Upload Section ── */}
        {showUpload && (
          <div
            className="card"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              padding: "var(--space-6)", marginBottom: "var(--space-5)",
              border: `2px dashed ${dragOver ? "#06b6d4" : "rgba(6, 182, 212, 0.4)"}`,
              background: dragOver ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.04)",
              transition: "all var(--transition-fast)",
            }}
          >
            <input ref={fileRef} type="file" accept=".md" multiple onChange={onFileChange} style={{ display: "none" }} />
            <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>{dragOver ? "📥" : "📂"}</div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                {dragOver ? "Drop .md file to install" : "Drag & drop a .md skill file here"}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                Skills use YAML frontmatter: name, description, category, tags
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
              <button className="btn btn-secondary" style={{ fontSize: "var(--text-xs)" }} onClick={() => fileRef.current?.click()}>
                📁 Browse Files
              </button>
            </div>
            {/* URL Paste */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--text-muted)" }}>
                Or install from a URL (raw .md link):
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <input
                  className="form-input"
                  placeholder="https://raw.githubusercontent.com/.../skill.md"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUrlPaste()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleUrlPaste} disabled={urlLoading} style={{ fontSize: "var(--text-xs)", background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
                  {urlLoading ? "⏳ Fetching..." : "📋 Install from URL"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Micro OC Banner ── */}
        <div className="card" style={{
          padding: "var(--space-5)", marginBottom: "var(--space-5)",
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(8, 145, 178, 0.03))",
          border: "1px solid rgba(6, 182, 212, 0.25)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "var(--radius-lg)",
                background: "rgba(6, 182, 212, 0.15)", border: "2px solid #06b6d4",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
              }}>🦀</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: 2 }}>Micro OC — Embedded Agent</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  Self-contained OpenClaw running inside Content Forge. Skills installed here power this agent.
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                  <span style={{ fontSize: "10px", background: "rgba(34, 197, 94, 0.12)", color: "#22c55e", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>● Engine Online</span>
                  <span style={{ fontSize: "10px", background: "rgba(6, 182, 212, 0.12)", color: "#06b6d4", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>{installedCount} skills loaded</span>
                  {tgBotToken && <span style={{ fontSize: "10px", background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>📱 Telegram linked</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button className="btn btn-secondary" onClick={() => setShowTelegram(true)} style={{ fontSize: "var(--text-xs)", padding: "var(--space-2) var(--space-3)" }}>
                📱 Connect Telegram
              </button>
              <button className="btn btn-ghost" onClick={() => setShowConfig(true)} style={{ fontSize: "var(--text-xs)", padding: "var(--space-2) var(--space-3)", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
                ⚙️ Config
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
          <button onClick={() => setFilter("all")} className={`modifier-tag ${filter === "all" ? "active" : ""}`}>📁 All</button>
          {Object.entries(categoryColors).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)} className={`modifier-tag ${filter === key ? "active" : ""}`}>{cfg.label}</button>
          ))}
        </div>

        {/* Skill Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)" }}>
          {filtered.map(skill => {
            const cat = categoryColors[skill.category] || categoryColors.system;
            return (
              <div key={skill.id} className="card" style={{ padding: "var(--space-5)", borderLeft: `3px solid ${cat.color}`, opacity: skill.installed ? 1 : 0.7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <span style={{ fontSize: "1.3rem" }}>{skill.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{skill.name}</div>
                      <div style={{ display: "flex", gap: "var(--space-1)", alignItems: "center" }}>
                        <span style={{ background: cat.bg, color: cat.color, fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-full)" }}>{cat.label}</span>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>v{skill.version}</span>
                        {skill.preInstalled && <span style={{ fontSize: "9px", color: "#06b6d4" }}>Pre-installed</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggleInstall(skill.id)} style={{
                    width: 44, height: 24, borderRadius: 12, border: "none",
                    background: skill.installed ? "#22c55e" : "var(--border-default)",
                    cursor: "pointer", position: "relative",
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: skill.installed ? 23 : 3, transition: "left var(--transition-fast)" }} />
                  </button>
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "var(--space-3)" }}>{skill.description}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
                  {skill.capabilities.map(cap => (
                    <span key={cap} style={{ fontSize: "9px", padding: "2px 6px", background: skill.installed ? cat.bg : "var(--bg-input)", color: skill.installed ? cat.color : "var(--text-muted)", borderRadius: "var(--radius-sm)", fontWeight: 600 }}>{cap}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: "var(--text-xs)", padding: "var(--space-1)" }} onClick={() => setViewSkill(skill)}>
                    📖 View .md
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: "var(--text-xs)", padding: "var(--space-1)" }} onClick={() => { setEditSkill(skill); setEditContent(skill.rawMd || `---\nname: ${skill.id}\ndescription: "${skill.description}"\ncategory: ${skill.category}\n---\n\n# ${skill.name}\n\n${skill.description}`); }}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Community Library */}
        <div className="card" style={{ padding: "var(--space-5)", marginTop: "var(--space-5)", textAlign: "center" }}>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-2)" }}>📚 Community Skills Library</h3>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>Browse 42+ skills from the OpenClaw community.</div>
          <button className="btn btn-secondary" style={{ fontSize: "var(--text-xs)" }} onClick={() => setShowUpload(true)}>Browse Library →</button>
        </div>
      </div>

      {/* ═══ VIEW .md Modal ═══ */}
      <Modal open={!!viewSkill} onClose={() => setViewSkill(null)} title={`📖 ${viewSkill?.name || "Skill"}`}>
        <pre style={{
          background: "var(--bg-input)", padding: "var(--space-4)",
          borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)",
          lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
          maxHeight: 400, overflowY: "auto", border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
        }}>
          {viewSkill?.rawMd || `---\nname: ${viewSkill?.id}\ndescription: "${viewSkill?.description}"\ncategory: ${viewSkill?.category}\n---\n\n# ${viewSkill?.name}\n\n${viewSkill?.description}`}
        </pre>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <button className="btn btn-secondary" style={{ fontSize: "var(--text-xs)" }} onClick={() => { if (viewSkill) { setEditSkill(viewSkill); setEditContent(viewSkill.rawMd || ""); setViewSkill(null); } }}>✏️ Edit</button>
          <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)" }} onClick={() => setViewSkill(null)}>Close</button>
        </div>
      </Modal>

      {/* ═══ EDIT Modal ═══ */}
      <Modal open={!!editSkill} onClose={() => setEditSkill(null)} title={`✏️ Edit: ${editSkill?.name || "Skill"}`}>
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          style={{
            width: "100%", minHeight: 300, padding: "var(--space-4)",
            background: "var(--bg-input)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
            fontSize: "var(--text-xs)", fontFamily: "monospace", lineHeight: 1.6,
            resize: "vertical",
          }}
        />
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
          Edit the YAML frontmatter (name, description, category) and skill instructions below it.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)" }} onClick={() => setEditSkill(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ fontSize: "var(--text-xs)", background: "linear-gradient(135deg, #22c55e, #16a34a)" }} onClick={saveEdit}>💾 Save Changes</button>
        </div>
      </Modal>

      {/* ═══ TELEGRAM Modal ═══ */}
      <Modal open={showTelegram} onClose={() => setShowTelegram(false)} title="📱 Connect Telegram">
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
          Link your Telegram bot so your Micro OC agent can send and receive messages privately. Only you and the agent communicate — no one else can access this channel.
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label">Bot API Token</label>
          <input
            className="form-input"
            type="password"
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v..."
            value={tgBotToken}
            onChange={e => setTgBotToken(e.target.value)}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 4 }}>
            Get this from <strong>@BotFather</strong> on Telegram → /newbot → copy the token
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label">Your Telegram User ID</label>
          <input
            className="form-input"
            placeholder="e.g. 123456789"
            value={tgUserId}
            onChange={e => setTgUserId(e.target.value)}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 4 }}>
            The bot will ONLY respond to this User ID — white-labeled to you. Get it from <strong>@userinfobot</strong>.
          </div>
        </div>

        <div style={{
          padding: "var(--space-3)", background: "rgba(139, 92, 246, 0.08)",
          borderRadius: "var(--radius-sm)", border: "1px solid rgba(139, 92, 246, 0.2)",
          marginBottom: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)",
        }}>
          🔒 <strong>Private channel:</strong> Only your User ID can interact with this bot. Group support available if you add the bot to a group and whitelist the group ID.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
          <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)" }} onClick={() => setShowTelegram(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ fontSize: "var(--text-xs)", background: tgSaved ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)" }} onClick={saveTelegram}>
            {tgSaved ? "✅ Saved!" : "💾 Save & Connect"}
          </button>
        </div>
      </Modal>

      {/* ═══ CONFIG Modal ═══ */}
      <Modal open={showConfig} onClose={() => setShowConfig(false)} title="⚙️ Micro OC Configuration">
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label">AI Model</label>
          <select className="form-input" value={ocModel} onChange={e => setOcModel(e.target.value)} style={{ width: "100%" }}>
            <option value="gpt-4o">GPT-4o (Recommended)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="ollama-local">🦙 Ollama (Local)</option>
          </select>
        </div>

        {/* ── Ollama Local Model Picker ── */}
        {ocModel === "ollama-local" && (
          <div style={{
            marginBottom: "var(--space-4)", padding: "var(--space-4)",
            background: "rgba(139, 92, 246, 0.06)", borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}>
            <label className="form-label">🦙 Select Local Model</label>
            <select className="form-input" value={ollamaModel} onChange={e => setOllamaModel(e.target.value)} style={{ width: "100%", marginBottom: "var(--space-3)" }}>
              <optgroup label="⭐ Recommended">
                <option value="kimi-k2">Kimi K2 — Best Overall (MoE, 1T params)</option>
              </optgroup>
              <optgroup label="🧠 Reasoning">
                <option value="deepseek-r1">DeepSeek R1 — Deep Reasoning</option>
                <option value="qwen3">Qwen 3 — Hybrid Thinking</option>
              </optgroup>
              <optgroup label="🔥 General">
                <option value="llama3.3">Llama 3.3 70B — Meta&apos;s Best Open</option>
                <option value="mistral-large">Mistral Large — Fast + Capable</option>
                <option value="gemma3">Gemma 3 27B — Google Open</option>
              </optgroup>
              <optgroup label="💻 Code">
                <option value="devstral">Devstral — Mistral Code Agent</option>
                <option value="qwen-coder">Qwen 2.5 Coder 32B</option>
              </optgroup>
              <optgroup label="⚡ Compact (Fast)">
                <option value="phi-4">Phi-4 14B — Microsoft Small</option>
                <option value="llama3.2-3b">Llama 3.2 3B — Ultra Fast</option>
              </optgroup>
              <optgroup label="🔧 Custom">
                <option value="custom">Custom Model Name...</option>
              </optgroup>
            </select>

            {ollamaModel === "custom" && (
              <input
                className="form-input"
                placeholder="e.g. my-finetuned-model:latest"
                value={customOllamaModel}
                onChange={e => setCustomOllamaModel(e.target.value)}
                style={{ width: "100%", marginBottom: "var(--space-2)" }}
              />
            )}

            <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {ollamaModel === "kimi-k2" && "⭐ Kimi K2 by Moonshot AI — Mixture-of-Experts with 1T parameters. Best all-round local model for content creation, research, and reasoning."}
              {ollamaModel === "deepseek-r1" && "🧠 DeepSeek R1 — Excels at complex reasoning and analysis. Great for research automation and strategy."}
              {ollamaModel === "qwen3" && "🧠 Qwen 3 by Alibaba — Hybrid thinking mode. Strong at multi-step reasoning and content generation."}
              {ollamaModel === "llama3.3" && "🔥 Llama 3.3 70B by Meta — General purpose powerhouse. Great at following instructions and creative writing."}
              {ollamaModel === "mistral-large" && "🔥 Mistral Large — Fast inference with strong capabilities. Good balance of speed and quality."}
              {ollamaModel === "gemma3" && "🔥 Gemma 3 27B by Google — Compact yet capable. Efficient for content tasks."}
              {ollamaModel === "devstral" && "💻 Devstral by Mistral — Purpose-built for coding and agent tasks. Good for automations."}
              {ollamaModel === "qwen-coder" && "💻 Qwen 2.5 Coder 32B — Top coding model. Use for skill development and automation scripts."}
              {ollamaModel === "phi-4" && "⚡ Phi-4 14B by Microsoft — Small, fast, surprisingly capable. Runs on lower-end hardware."}
              {ollamaModel === "llama3.2-3b" && "⚡ Llama 3.2 3B — Ultra-compact, instant responses. Best for simple tasks on minimal hardware."}
              {ollamaModel === "custom" && "🔧 Enter any model name available on your Ollama instance (run `ollama list` to see installed models)."}
            </div>

            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-2) var(--space-3)", background: "var(--bg-input)", borderRadius: "var(--radius-sm)", fontSize: "10px", color: "var(--text-muted)" }}>
              💡 Make sure Ollama is running locally (<code>ollama serve</code>) and the model is pulled (<code>ollama pull {ollamaModel === "custom" ? customOllamaModel || "model-name" : ollamaModel}</code>).
            </div>
          </div>
        )}

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label">Agent Permissions</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {[
              { label: "Auto-approve content under 60 seconds", id: "auto-approve" },
              { label: "Access Research Automation data", id: "access-research" },
              { label: "Access Viral Intelligence rankings", id: "access-viral" },
              { label: "Create & schedule AutoPilot batches", id: "access-autopilot" },
              { label: "Post to connected social platforms", id: "access-publish" },
            ].map(perm => (
              <label key={perm.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-xs)", cursor: "pointer", padding: "var(--space-2)", background: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                <input type="checkbox" checked={ocPerms[perm.id] ?? false} onChange={() => togglePerm(perm.id)} style={{ accentColor: "#06b6d4" }} />
                {perm.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label">Auto-Approve Timeout</label>
          <select className="form-input" value={ocTimeout} onChange={e => setOcTimeout(e.target.value)} style={{ width: "100%" }}>
            <option value="disabled">Disabled — always require approval</option>
            <option value="1h">1 hour — auto-post if not reviewed</option>
            <option value="6h">6 hours</option>
            <option value="24h">24 hours</option>
            <option value="48h">48 hours</option>
          </select>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 4 }}>
            How long to wait before the agent auto-publishes queued content
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
          <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)" }} onClick={() => setShowConfig(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ fontSize: "var(--text-xs)", background: ocSaved ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #06b6d4, #0891b2)" }} onClick={saveOcConfig}>
            {ocSaved ? "✅ Saved!" : "💾 Save Config"}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
