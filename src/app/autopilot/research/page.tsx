"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../../components/AppShell";

/* ───── Types ───── */
type ResearchType = "topic" | "competitor" | "brand" | "trending";

interface ResearchJob {
  id: string;
  type: ResearchType;
  query: string;
  status: "running" | "completed" | "queued";
  ideas: number;
  scripts: number;
  sources: string[];
  addedToClaw: boolean;
  createdAt: string;
}

interface TrackedProfile {
  id: string;
  platform: string;
  handle: string;
  icon: string;
}

/* ───── Source Definitions ───── */
const DATA_SOURCES = [
  { id: "brave", name: "Brave Search", icon: "🦁", free: "$5/mo credit ≈ 1000 searches", desc: "Web search backbone — searches blogs, articles, forums", color: "#f97316" },
  { id: "serpapi", name: "SerpAPI", icon: "📈", free: "250 free/mo", desc: "Google Trends, YouTube search, trending queries", color: "#22c55e" },
  { id: "jina", name: "Jina AI Reader", icon: "📖", free: "10M free tokens, no key needed", desc: "Extracts clean text from any URL — competitor pages, articles", color: "#06b6d4" },
  { id: "apify", name: "Apify", icon: "🕷️", free: "$5/mo free credit", desc: "TikTok & Instagram profile scraping — posts, engagement, hooks", color: "#8b5cf6" },
];

/* ───── Which sources power which research type ───── */
const typeSourceMap: Record<ResearchType, string[]> = {
  topic: ["brave", "serpapi", "jina"],
  competitor: ["brave", "jina", "apify"],
  brand: ["brave", "jina"],
  trending: ["serpapi", "apify", "brave"],
};

const typeConfig: Record<ResearchType, { icon: string; label: string; color: string; bg: string; desc: string }> = {
  topic: { icon: "🔍", label: "Topic Research", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", desc: "Search the web for any topic, extract trends and content angles" },
  competitor: { icon: "⚔️", label: "Competitor Analysis", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", desc: "Analyze competitor profiles, content strategy, and top-performing posts" },
  brand: { icon: "👤", label: "Brand Deep-Dive", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)", desc: "Mine your brand assets, offers, and messaging for content ideas" },
  trending: { icon: "📈", label: "Trending Now", color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", desc: "Auto-scan Google Trends, TikTok, and Instagram for what's hot" },
};

/* ───── Mock Data ───── */
const MOCK_JOBS: ResearchJob[] = [
  { id: "1", type: "competitor", query: "Top agency coaching programs 2026", status: "completed", ideas: 34, scripts: 8, sources: ["brave", "jina", "apify"], addedToClaw: true, createdAt: "20 min ago" },
  { id: "2", type: "topic", query: "Profit leaks in service businesses", status: "completed", ideas: 28, scripts: 5, sources: ["brave", "serpapi", "jina"], addedToClaw: false, createdAt: "1 hour ago" },
  { id: "3", type: "brand", query: "BRR Accelerator — unique selling points", status: "completed", ideas: 22, scripts: 4, sources: ["brave", "jina"], addedToClaw: true, createdAt: "3 hours ago" },
  { id: "4", type: "trending", query: "Auto-scan: Google Trends + TikTok + Instagram", status: "running", ideas: 12, scripts: 0, sources: ["serpapi", "apify", "brave"], addedToClaw: false, createdAt: "5 min ago" },
];

export default function ResearchAutomation() {
  const [researchType, setResearchType] = useState<ResearchType>("topic");
  const [query, setQuery] = useState("");
  const [autoContent, setAutoContent] = useState(true);
  const [autoProduce, setAutoProduce] = useState(false);
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly">("once");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobs, setJobs] = useState<ResearchJob[]>(MOCK_JOBS);
  const [profiles, setProfiles] = useState<TrackedProfile[]>([
    { id: "p1", platform: "TikTok", handle: "@gaborhoney", icon: "📱" },
    { id: "p2", platform: "Instagram", handle: "@alexhormozi", icon: "📸" },
    { id: "p3", platform: "YouTube", handle: "@patrickbetdavid", icon: "▶️" },
  ]);
  const [newHandle, setNewHandle] = useState("");
  const [newPlatform, setNewPlatform] = useState("TikTok");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const activeSources = typeSourceMap[researchType];

  const startResearch = () => {
    if (!query.trim() && researchType !== "trending") return;
    setRunning(true);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          const newJob: ResearchJob = {
            id: `j-${Date.now()}`, type: researchType,
            query: query || "Auto-trending scan",
            status: "completed", ideas: Math.floor(Math.random() * 20) + 15,
            scripts: autoContent ? Math.floor(Math.random() * 8) + 3 : 0,
            sources: activeSources, addedToClaw: false, createdAt: "Just now",
          };
          setJobs(prev => [newJob, ...prev]);
          setTimeout(() => { setRunning(false); setQuery(""); }, 500);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 600);
  };

  const toggleClaw = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, addedToClaw: !j.addedToClaw } : j));
  };

  const addProfile = () => {
    if (!newHandle.trim()) return;
    setProfiles(prev => [...prev, { id: `p-${Date.now()}`, platform: newPlatform, handle: newHandle.startsWith("@") ? newHandle : `@${newHandle}`, icon: newPlatform === "TikTok" ? "📱" : newPlatform === "Instagram" ? "📸" : newPlatform === "YouTube" ? "▶️" : newPlatform === "X" ? "𝕏" : "💼" }]);
    setNewHandle("");
  };

  const removeProfile = (id: string) => setProfiles(prev => prev.filter(p => p.id !== id));

  return (
    <AppShell>
      <div className="page-header">
        <h2>🔬 Research Automation</h2>
        <p>Auto-research topics, competitors, and trends — generate ideas and content on autopilot.</p>
      </div>

      <div className="page-body fade-in">

        {/* ── Data Sources — How It Works ── */}
        <div className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>🔗 Data Sources — How Research Works</h3>
            <a href="/settings" style={{ fontSize: "var(--text-xs)", color: "#06b6d4", textDecoration: "none" }}>Configure API keys →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
            {DATA_SOURCES.map(src => {
              const isActive = activeSources.includes(src.id);
              return (
                <div key={src.id} style={{
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-sm)",
                  border: `2px solid ${isActive ? src.color : "var(--border-subtle)"}`,
                  background: isActive ? `${src.color}10` : "var(--bg-input)",
                  opacity: isActive ? 1 : 0.4,
                  transition: "all var(--transition-fast)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 4 }}>
                    <span style={{ fontSize: "1.1rem" }}>{src.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: isActive ? src.color : "var(--text-muted)" }}>{src.name}</span>
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)", lineHeight: 1.4 }}>{src.desc}</div>
                  <div style={{ fontSize: "9px", color: isActive ? src.color : "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>
                    {isActive ? "✅ Active for this type" : "—"} · {src.free}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Research Type Picker ── */}
        <div className="card" style={{
          padding: "var(--space-6)", marginBottom: "var(--space-5)",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(99, 102, 241, 0.02))",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}>
          <label className="form-label" style={{ marginBottom: "var(--space-3)" }}>What do you want to research?</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            {(Object.entries(typeConfig) as [ResearchType, typeof typeConfig.topic][]).map(([id, cfg]) => (
              <button
                key={id}
                onClick={() => setResearchType(id)}
                style={{
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${researchType === id ? cfg.color : "var(--border-default)"}`,
                  background: researchType === id ? cfg.bg : "var(--bg-input)",
                  color: "var(--text-primary)", cursor: "pointer", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{cfg.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "var(--text-xs)" }}>{cfg.label}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: 2 }}>{cfg.desc}</div>
              </button>
            ))}
          </div>

          {/* Query Input — Topic & Brand */}
          {(researchType === "topic" || researchType === "brand") && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label">
                {researchType === "topic" ? "Topic or keyword" : "Your brand or offer"}
              </label>
              <input
                className="form-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={
                  researchType === "topic" ? "e.g. profit leaks in service businesses, cold outreach for agencies" :
                  "e.g. BRR Accelerator, ManTech brand messaging"
                }
                style={{ width: "100%" }}
              />
            </div>
          )}

          {/* Competitor — Profile Tracker */}
          {researchType === "competitor" && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label">Competitor Profiles to Analyze</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                {profiles.map(p => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: "var(--space-2)",
                    padding: "var(--space-1) var(--space-3)",
                    background: "var(--bg-input)", borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-default)", fontSize: "var(--text-xs)",
                  }}>
                    <span>{p.icon}</span>
                    <span style={{ fontWeight: 600 }}>{p.handle}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>{p.platform}</span>
                    <button onClick={() => removeProfile(p.id)} style={{
                      background: "none", border: "none", color: "var(--text-muted)",
                      cursor: "pointer", fontSize: "10px", padding: 0,
                    }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <select
                  value={newPlatform}
                  onChange={e => setNewPlatform(e.target.value)}
                  className="form-input"
                  style={{ width: 130 }}
                >
                  <option>TikTok</option>
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>X</option>
                  <option>LinkedIn</option>
                </select>
                <input
                  className="form-input"
                  placeholder="@handle or profile URL..."
                  value={newHandle}
                  onChange={e => setNewHandle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addProfile()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={addProfile}>+ Add</button>
              </div>
              <div style={{ marginTop: "var(--space-3)" }}>
                <label className="form-label">Additional search query (optional)</label>
                <input
                  className="form-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. agency coaching, business mentorship niche..."
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}

          {/* Trending — Auto explanation */}
          {researchType === "trending" && (
            <div style={{
              padding: "var(--space-4)", background: "rgba(34, 197, 94, 0.08)",
              borderRadius: "var(--radius-sm)", border: "1px solid rgba(34, 197, 94, 0.2)",
              marginBottom: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)",
            }}>
              📈 AI will automatically:
              <ul style={{ margin: "var(--space-2) 0 0 var(--space-4)", lineHeight: 1.8 }}>
                <li><strong>SerpAPI</strong> → Scan Google Trends for rising queries in your niche</li>
                <li><strong>Apify</strong> → Scrape top-performing TikTok & Instagram posts this week</li>
                <li><strong>Brave Search</strong> → Cross-reference with current news and blogs</li>
              </ul>
            </div>
          )}

          {/* Automation Toggles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
            <div style={{
              padding: "var(--space-4)", background: "var(--bg-input)",
              borderRadius: "var(--radius-sm)", border: `1px solid ${autoContent ? "#8b5cf6" : "var(--border-default)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>📝 Auto-Generate Scripts</span>
                <button onClick={() => setAutoContent(!autoContent)} style={{
                  width: 40, height: 22, borderRadius: 11, border: "none",
                  background: autoContent ? "#8b5cf6" : "var(--border-default)",
                  cursor: "pointer", position: "relative",
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: autoContent ? 21 : 3, transition: "left var(--transition-fast)" }} />
                </button>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Turn ideas into voiceover-ready scripts</div>
            </div>

            <div style={{
              padding: "var(--space-4)", background: "var(--bg-input)",
              borderRadius: "var(--radius-sm)", border: `1px solid ${autoProduce ? "#06b6d4" : "var(--border-default)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>🎬 Auto-Produce Videos</span>
                <button onClick={() => setAutoProduce(!autoProduce)} style={{
                  width: 40, height: 22, borderRadius: 11, border: "none",
                  background: autoProduce ? "#06b6d4" : "var(--border-default)",
                  cursor: "pointer", position: "relative",
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: autoProduce ? 21 : 3, transition: "left var(--transition-fast)" }} />
                </button>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Scripts → videos → production queue</div>
            </div>

            <div style={{
              padding: "var(--space-4)", background: "var(--bg-input)",
              borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)",
            }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: "var(--space-2)" }}>🔄 Frequency</div>
              <div style={{ display: "flex", gap: "var(--space-1)" }}>
                {(["once", "daily", "weekly"] as const).map(f => (
                  <button key={f} onClick={() => setFrequency(f)} style={{
                    flex: 1, padding: "var(--space-1)", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${frequency === f ? "#8b5cf6" : "var(--border-default)"}`,
                    background: frequency === f ? "rgba(139, 92, 246, 0.15)" : "transparent",
                    color: frequency === f ? "#8b5cf6" : "var(--text-primary)",
                    fontSize: "10px", fontWeight: 600, cursor: "pointer",
                  }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <button className="btn btn-secondary" onClick={startResearch} disabled={running}>
              🧠 Let AI Pick Topic
            </button>
            <button className="btn btn-primary" onClick={startResearch} disabled={running} style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
              🔬 Start Research{frequency !== "once" ? ` (${frequency})` : ""}
            </button>
          </div>
        </div>

        {/* Progress */}
        {running && (
          <div className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#8b5cf6", marginBottom: 6 }}>
              <span>🔬 Researching...</span>
              <span>{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(100, progress)}%`,
                background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
                borderRadius: "var(--radius-full)", transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{ marginTop: "var(--space-3)", display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {activeSources.map(srcId => {
                const src = DATA_SOURCES.find(s => s.id === srcId)!;
                const done = progress > (activeSources.indexOf(srcId) + 1) * (100 / activeSources.length);
                return (
                  <span key={srcId} style={{ color: done ? "#22c55e" : "var(--text-muted)" }}>
                    {done ? "✅" : "⏳"} {src.icon} {src.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Research History ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>📋 Research History</h3>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{jobs.length} runs</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {jobs.map(job => {
            const cfg = typeConfig[job.type];
            return (
              <div key={job.id} className="card" style={{ padding: "var(--space-5)", borderLeft: `3px solid ${cfg.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: "var(--text-xs)", fontWeight: 700, padding: "2px 10px", borderRadius: "var(--radius-full)" }}>{cfg.icon} {cfg.label}</span>
                    {job.status === "running" && (
                      <span style={{ background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-full)" }}>⚡ Running</span>
                    )}
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{job.createdAt}</span>
                </div>

                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>{job.query}</div>

                {/* Sources Used */}
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  {job.sources.map(srcId => {
                    const src = DATA_SOURCES.find(s => s.id === srcId);
                    return src ? (
                      <span key={srcId} style={{ fontSize: "10px", color: "var(--text-muted)", background: "var(--bg-input)", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
                        {src.icon} {src.name}
                      </span>
                    ) : null;
                  })}
                </div>

                {/* Stats + Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <span style={{ padding: "var(--space-2) var(--space-3)", background: "rgba(249, 115, 22, 0.1)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", color: "#f97316" }}>💡 {job.ideas} ideas</span>
                    <span style={{ padding: "var(--space-2) var(--space-3)", background: "rgba(139, 92, 246, 0.1)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", color: "#8b5cf6" }}>📝 {job.scripts} scripts</span>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-3)" }}>👁️ View</button>
                    <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-3)" }}>🔄 Re-run</button>
                    <button
                      onClick={() => toggleClaw(job.id)}
                      className={`btn ${job.addedToClaw ? "btn-ghost" : "btn-primary"}`}
                      style={{
                        fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-3)",
                        ...(job.addedToClaw ? { border: "1px solid #06b6d4", color: "#06b6d4" } : { background: "linear-gradient(135deg, #06b6d4, #0891b2)" }),
                      }}
                    >
                      {job.addedToClaw ? "🦀 In OpenClaw" : "🦀 Add to OpenClaw"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
