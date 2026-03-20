"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";

interface ApiKeyConfig {
  id: string;
  provider: string;
  label: string;
  icon: string;
  placeholder: string;
  envVar: string;
  capabilities: string[];
  category: "ai" | "video" | "voice" | "publishing" | "agent";
}

const API_CONFIGS: ApiKeyConfig[] = [
  /* ── AI Models ── */
  { id: "openai", provider: "OpenAI", label: "OpenAI API Key", icon: "🤖", placeholder: "sk-proj-...", envVar: "OPENAI_API_KEY", capabilities: ["GPT-4o (Scripts)", "DALL-E 3 (Images)"], category: "ai" },
  { id: "openrouter", provider: "OpenRouter", label: "OpenRouter API Key", icon: "🌐", placeholder: "sk-or-...", envVar: "OPENROUTER_API_KEY", capabilities: ["100+ Models", "Llama 3.1", "Mixtral", "Claude"], category: "ai" },
  { id: "google", provider: "Google", label: "Google Ultra API Key", icon: "🔷", placeholder: "AIza...", envVar: "GOOGLE_API_KEY", capabilities: ["Gemini 2.5 Pro", "Imagen 3", "Veo 3"], category: "ai" },
  { id: "claude", provider: "Anthropic", label: "Claude API Key", icon: "📝", placeholder: "sk-ant-...", envVar: "CLAUDE_API_KEY", capabilities: ["Claude 3.5 Sonnet", "Long-form Copy"], category: "ai" },
  { id: "ollama", provider: "Ollama", label: "Ollama Local Endpoint", icon: "🦙", placeholder: "http://localhost:11434", envVar: "OLLAMA_ENDPOINT", capabilities: ["Local & Private Models", "Self-Hosted", "No Data Leaves Your Machine"], category: "ai" },
  /* ── Research & Data ── */
  { id: "brave", provider: "Brave Search", label: "Brave Search API Key", icon: "🦁", placeholder: "BSA...", envVar: "BRAVE_SEARCH_API_KEY", capabilities: ["Web Search", "News", "$5/mo Free Credit"], category: "ai" },
  { id: "serpapi", provider: "SerpAPI", label: "SerpAPI Key", icon: "📈", placeholder: "...", envVar: "SERPAPI_KEY", capabilities: ["Google Trends", "YouTube Search", "250 Free/mo"], category: "ai" },
  { id: "jina", provider: "Jina AI", label: "Jina Reader API Key", icon: "📖", placeholder: "jina_...", envVar: "JINA_API_KEY", capabilities: ["Web Page Reader", "10M Free Tokens", "No Key Needed"], category: "ai" },
  { id: "apify", provider: "Apify", label: "Apify API Token", icon: "🕷️", placeholder: "apify_api_...", envVar: "APIFY_API_TOKEN", capabilities: ["TikTok Scraper", "Instagram Scraper", "$5/mo Free"], category: "ai" },
  /* ── Video & Voice ── */
  { id: "heygen", provider: "HeyGen", label: "HeyGen API Key", icon: "🎬", placeholder: "hg-...", envVar: "HEYGEN_API_KEY", capabilities: ["Avatar Videos", "Video Cloning"], category: "video" },
  { id: "elevenlabs", provider: "ElevenLabs", label: "ElevenLabs API Key", icon: "🎙️", placeholder: "xi-...", envVar: "ELEVENLABS_API_KEY", capabilities: ["AI Voiceover", "Voice Cloning"], category: "voice" },
  /* ── Publishing ── */
  { id: "ghl", provider: "GoHighLevel", label: "GHL API Key", icon: "📡", placeholder: "ghl-...", envVar: "GHL_API_KEY", capabilities: ["Social Scheduling", "Multi-platform Posting"], category: "publishing" },
  { id: "airtable", provider: "Airtable", label: "Airtable API Key", icon: "📊", placeholder: "pat...", envVar: "AIRTABLE_API_KEY", capabilities: ["Content Database", "Asset Tracking"], category: "publishing" },
  { id: "notion", provider: "Notion", label: "Notion Integration Token", icon: "📓", placeholder: "secret_...", envVar: "NOTION_API_KEY", capabilities: ["Content Library", "Knowledge Base"], category: "publishing" },
  { id: "postiz", provider: "Postiz", label: "Postiz API Key", icon: "📤", placeholder: "pz-...", envVar: "POSTIZ_API_KEY", capabilities: ["Multi-Platform Posting", "Social Scheduling"], category: "publishing" },
];

interface StorageConfig {
  id: string;
  name: string;
  icon: string;
  desc: string;
  badge: string;
  badgeColor: string;
}

interface CustomIntegration {
  id: string;
  name: string;
  type: string;
  endpoint: string;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [storageList, setStorageList] = useState<StorageConfig[]>([
    { id: "r2", name: "Cloudflare R2", icon: "☁️", desc: "Video & image storage • 10GB free", badge: "Ready", badgeColor: "green" },
    { id: "gdrive", name: "Google Drive", icon: "📁", desc: "Backup & sharing", badge: "Ready", badgeColor: "green" },
    { id: "s3", name: "AWS S3", icon: "🪣", desc: "Scalable object storage", badge: "Phase 2", badgeColor: "blue" },
  ]);
  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegration[]>([]);
  const [showAddStorage, setShowAddStorage] = useState(false);
  const [showAddPublishing, setShowAddPublishing] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("");
  const [openClawMode, setOpenClawMode] = useState<"api" | "webhook" | "mcp">("api");
  const [openClawEndpoint, setOpenClawEndpoint] = useState("");
  const [openClawSaved, setOpenClawSaved] = useState(false);
  const [agentPerms, setAgentPerms] = useState({ research: true, scripting: true, production: false, scheduling: false });
  const togglePerm = (key: keyof typeof agentPerms) => setAgentPerms(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = (id: string) => {
    setSaved(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2000);
  };

  const addStorage = () => {
    if (!newName.trim()) return;
    setStorageList(prev => [...prev, { id: `custom-${Date.now()}`, name: newName.trim(), icon: "💽", desc: "Custom storage", badge: "Custom", badgeColor: "orange" }]);
    setNewName("");
    setShowAddStorage(false);
  };

  const addCustomIntegration = () => {
    if (!newName.trim()) return;
    setCustomIntegrations(prev => [...prev, { id: `ci-${Date.now()}`, name: newName.trim(), type: "webhook", endpoint: newEndpoint }]);
    setNewName("");
    setNewEndpoint("");
    setShowAddCustom(false);
  };

  const aiConfigs = API_CONFIGS.filter(c => c.category === "ai");
  const mediaConfigs = API_CONFIGS.filter(c => c.category === "video" || c.category === "voice");
  const pubConfigs = API_CONFIGS.filter(c => c.category === "publishing");

  const renderApiCard = (config: ApiKeyConfig) => (
    <div key={config.id} style={{
      padding: "var(--space-5)",
      background: "var(--bg-input)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-subtle)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ fontSize: "1.3rem" }}>{config.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{config.provider}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {config.capabilities.join(" • ")}
            </div>
          </div>
        </div>
        <span className={`api-status ${keys[config.id] ? "connected" : "disconnected"}`}>
          {keys[config.id] ? "● Connected" : "○ Not set"}
        </span>
      </div>
      <div className="api-key-input">
        <div className="form-group">
          <input
            id={`api-key-${config.id}`}
            className="form-input"
            type={showKey[config.id] ? "text" : "password"}
            placeholder={config.placeholder}
            value={keys[config.id] || ""}
            onChange={e => setKeys(prev => ({ ...prev, [config.id]: e.target.value }))}
            style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
          />
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => setShowKey(prev => ({ ...prev, [config.id]: !prev[config.id] }))} title={showKey[config.id] ? "Hide" : "Show"}>
          {showKey[config.id] ? "🙈" : "👁️"}
        </button>
        <button className="btn btn-primary" onClick={() => handleSave(config.id)} style={{ minWidth: 80 }}>
          {saved[config.id] ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="page-header">
        <h2>⚙️ Settings</h2>
        <p>Connect your AI engines, agents, storage, and publishing integrations</p>
      </div>

      <div className="page-body fade-in">

        {/* ═══ OpenClaw / Agent Integration ═══ */}
        <div className="settings-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <h3>🦀 OpenClaw — Agent Integration</h3>
            <span className={`api-status ${openClawEndpoint ? "connected" : "disconnected"}`}>
              {openClawEndpoint ? "● Connected" : "○ Not set"}
            </span>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-5)", marginTop: "-var(--space-2)" }}>
            Install your OpenClaw agent to let AI control and produce this entire content engine for you — research, scripting, video production, and scheduling, hands-free. Toggle which sections the agent can access.
          </p>

          <div style={{
            padding: "var(--space-5)",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.03))",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
          }}>
            {/* Connection Mode */}
            <div style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label" style={{ marginBottom: "var(--space-2)" }}>Connection Mode</label>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                {[
                  { id: "api" as const, label: "🔑 API Key", desc: "Direct API auth" },
                  { id: "webhook" as const, label: "🔗 Webhook", desc: "Event-driven" },
                  { id: "mcp" as const, label: "🧠 MCP", desc: "Model Context Protocol" },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setOpenClawMode(mode.id)}
                    style={{
                      flex: 1, padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-sm)",
                      border: `2px solid ${openClawMode === mode.id ? "#8b5cf6" : "var(--border-default)"}`,
                      background: openClawMode === mode.id ? "rgba(139, 92, 246, 0.15)" : "var(--bg-input)",
                      color: "var(--text-primary)", cursor: "pointer", textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{mode.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 2 }}>{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Input */}
            <div style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label">
                {openClawMode === "api" ? "API Endpoint & Key" : openClawMode === "webhook" ? "Webhook URL" : "MCP Server URL"}
              </label>
              <div className="api-key-input">
                <div className="form-group">
                  <input
                    className="form-input"
                    placeholder={
                      openClawMode === "api" ? "https://your-openclaw.com/api/v1" :
                      openClawMode === "webhook" ? "https://your-openclaw.com/webhook/content-forge" :
                      "mcp://your-openclaw.com/agent"
                    }
                    value={openClawEndpoint}
                    onChange={e => setOpenClawEndpoint(e.target.value)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
                  />
                </div>
                <button className="btn btn-primary" onClick={() => { setOpenClawSaved(true); setTimeout(() => setOpenClawSaved(false), 2000); }} style={{ minWidth: 100 }}>
                  {openClawSaved ? "✓ Connected" : "Connect"}
                </button>
              </div>
            </div>

            {/* Access Permissions — Toggleable */}
            <label className="form-label" style={{ marginBottom: "var(--space-2)" }}>Agent Access Permissions</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-2)" }}>
              {[
                { key: "research" as const, label: "Research", icon: "🔍" },
                { key: "scripting" as const, label: "Scripting", icon: "📝" },
                { key: "production" as const, label: "Production", icon: "🎬" },
                { key: "scheduling" as const, label: "Scheduling", icon: "📅" },
              ].map(cap => {
                const on = agentPerms[cap.key];
                return (
                  <button
                    key={cap.key}
                    onClick={() => togglePerm(cap.key)}
                    style={{
                      padding: "var(--space-3) var(--space-2)",
                      borderRadius: "var(--radius-sm)",
                      background: on ? "rgba(34, 197, 94, 0.12)" : "var(--bg-input)",
                      border: `2px solid ${on ? "#22c55e" : "var(--border-default)"}`,
                      textAlign: "center",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <div>{cap.icon}</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{cap.label}</div>
                    <div style={{ fontSize: "9px", color: on ? "#22c55e" : "var(--text-muted)", marginTop: 2 }}>
                      {on ? "● Enabled" : "○ Disabled"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ AI Models ═══ */}
        <div className="settings-section">
          <h3>🧠 AI Models</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-6)", marginTop: "-var(--space-3)" }}>
            Connect language models for script generation, research, and content intelligence.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {aiConfigs.map(renderApiCard)}
          </div>
        </div>

        {/* ═══ Video & Voice ═══ */}
        <div className="settings-section">
          <h3>🎬 Video & Voice</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-6)", marginTop: "-var(--space-3)" }}>
            Power video production and voiceover generation.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {mediaConfigs.map(renderApiCard)}
          </div>
        </div>

        {/* ═══ Publishing ═══ */}
        <div className="settings-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>📡 Publishing & Export</h3>
            <button className="btn btn-ghost" onClick={() => setShowAddPublishing(!showAddPublishing)} style={{ fontSize: "var(--text-xs)" }}>
              + Add Custom
            </button>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-6)", marginTop: "-var(--space-3)" }}>
            Connect platforms to auto-post and schedule content.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {pubConfigs.map(renderApiCard)}
          </div>
          {showAddPublishing && (
            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)", alignItems: "center" }}>
              <input className="form-input" placeholder="Platform name..." value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1 }} />
              <input className="form-input" placeholder="API endpoint or webhook..." value={newEndpoint} onChange={e => setNewEndpoint(e.target.value)} style={{ flex: 2 }} />
              <button className="btn btn-primary" onClick={() => { if (newName.trim()) { addCustomIntegration(); setShowAddPublishing(false); } }}>Add</button>
            </div>
          )}
        </div>

        {/* ═══ Storage ═══ */}
        <div className="settings-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>💾 Storage</h3>
            <button className="btn btn-ghost" onClick={() => setShowAddStorage(!showAddStorage)} style={{ fontSize: "var(--text-xs)" }}>
              + Add Storage
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
            {storageList.map(s => (
              <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{s.name}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.desc}</div>
                </div>
                <span className={`badge badge-${s.badgeColor}`} style={{ marginLeft: "auto" }}>{s.badge}</span>
              </div>
            ))}
          </div>
          {showAddStorage && (
            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)", alignItems: "center" }}>
              <input className="form-input" placeholder="Storage name (e.g. Backblaze B2)..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addStorage()} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={addStorage}>Add</button>
              <button className="btn btn-ghost" onClick={() => setShowAddStorage(false)}>✕</button>
            </div>
          )}
        </div>

        {/* ═══ Custom Integrations ═══ */}
        <div className="settings-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>🔌 Custom Integrations</h3>
            <button className="btn btn-ghost" onClick={() => setShowAddCustom(!showAddCustom)} style={{ fontSize: "var(--text-xs)" }}>
              + Add Integration
            </button>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)", marginTop: "-var(--space-3)" }}>
            Connect any API, webhook, or service not listed above.
          </p>

          {customIntegrations.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              {customIntegrations.map(ci => (
                <div key={ci.id} className="card" style={{ textAlign: "center", padding: "var(--space-5)" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-2)" }}>🔌</div>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{ci.name}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ci.type}</div>
                  <span className="badge badge-orange" style={{ marginTop: "var(--space-2)" }}>Custom</span>
                </div>
              ))}
            </div>
          )}

          {showAddCustom && (
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <input className="form-input" placeholder="Integration name..." value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1 }} />
                <input className="form-input" placeholder="API endpoint or webhook URL..." value={newEndpoint} onChange={e => setNewEndpoint(e.target.value)} style={{ flex: 2 }} />
                <button className="btn btn-primary" onClick={addCustomIntegration}>Add</button>
                <button className="btn btn-ghost" onClick={() => setShowAddCustom(false)}>✕</button>
              </div>
            </div>
          )}

          {customIntegrations.length === 0 && !showAddCustom && (
            <div style={{
              padding: "var(--space-6)",
              border: "1px dashed var(--border-default)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              color: "var(--text-muted)",
            }}>
              <p style={{ fontSize: "var(--text-sm)" }}>No custom integrations yet</p>
              <p style={{ fontSize: "var(--text-xs)" }}>Click &quot;+ Add Integration&quot; to connect any API or webhook</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
