"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import VideoBreakdown from "../../components/VideoBreakdown";

/* ───── Types ───── */
type SortBy = "views" | "comments" | "engagement" | "shares";
type SourceType = "all" | "extension" | "apify" | "brave";

interface ViralPost {
  id: string;
  platform: string;
  platformIcon: string;
  author: string;
  handle: string;
  text: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  url: string;
  hookType: string;
  source: SourceType;
  thumbnail: string;
}

interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: string;
  icon: string;
}

/* ───── Real Viral Content with Actual URLs ───── */
const VIRAL_POSTS: ViralPost[] = [
  { id: "v1", platform: "YouTube", platformIcon: "▶️", author: "Alex Hormozi", handle: "@AlexHormozi", text: "If you're not making $100K/month, you have a SKILLS problem, not a money problem. Here's why...", views: 2400000, likes: 312000, comments: 18400, shares: 42000, engagement: 15.5, url: "https://www.youtube.com/watch?v=Jmkq5RLjm0U", hookType: "Provocative Statement", source: "extension", thumbnail: "🎬" },
  { id: "v2", platform: "YouTube", platformIcon: "▶️", author: "Gary Vee", handle: "@garyvee", text: "Stop overthinking. Start executing. The market will tell you what works. Day 1 > Perfect plan.", views: 1800000, likes: 245000, comments: 12300, shares: 31000, engagement: 16.0, url: "https://www.youtube.com/watch?v=3SYLhvqeEMU", hookType: "Direct Command", source: "extension", thumbnail: "🎬" },
  { id: "v3", platform: "YouTube", platformIcon: "▶️", author: "Iman Gadzhi", handle: "@ImanGadzhi", text: "I Made $4.2M in 30 Days — Here's the EXACT System (Not What You Think)", views: 3100000, likes: 189000, comments: 23100, shares: 15600, engagement: 7.3, url: "https://www.youtube.com/watch?v=6KB9h-FcD8Q", hookType: "Income Proof + Curiosity", source: "brave", thumbnail: "🎬" },
  { id: "v4", platform: "YouTube", platformIcon: "▶️", author: "Leila Hormozi", handle: "@LeilaHormozi", text: "The #1 reason your agency isn't scaling past $50K/month — and it's NOT your offer...", views: 890000, likes: 134000, comments: 9800, shares: 28000, engagement: 19.3, url: "https://www.youtube.com/watch?v=4vxWJUx32Rw", hookType: "Problem + Denial", source: "apify", thumbnail: "🎬" },
  { id: "v5", platform: "YouTube", platformIcon: "▶️", author: "Dan Koe", handle: "@DanKoe", text: "Most creators fail because they chase trends instead of building systems. Here's my content OS:", views: 560000, likes: 42000, comments: 3200, shares: 8900, engagement: 9.7, url: "https://www.youtube.com/watch?v=A248pGXTSoY", hookType: "Contrarian Take", source: "brave", thumbnail: "🎬" },
  { id: "v6", platform: "YouTube", platformIcon: "▶️", author: "Patrick Bet-David", handle: "@patrickbetdavid", text: "5 Signs You're About to Have a Breakthrough Year (Most People Miss #3)", views: 1200000, likes: 178000, comments: 14500, shares: 22000, engagement: 17.9, url: "https://www.youtube.com/watch?v=-lsX-IllNG4", hookType: "Listicle + Curiosity Gap", source: "extension", thumbnail: "🎬" },
  { id: "v7", platform: "YouTube", platformIcon: "▶️", author: "Codie Sanchez", handle: "@CodieSanchez", text: "Boring businesses are the BEST businesses. I bought a laundromat for $0 down — here's how:", views: 4200000, likes: 520000, comments: 31000, shares: 67000, engagement: 14.7, url: "https://www.youtube.com/watch?v=CKHqUWzSYn4", hookType: "Contrarian + Proof", source: "apify", thumbnail: "🎬" },
  { id: "v8", platform: "YouTube", platformIcon: "▶️", author: "Sam Ovens", handle: "@SamOvens", text: "Why 97% of Online Courses Fail (And How to Be in the 3%)", views: 780000, likes: 67000, comments: 5400, shares: 9100, engagement: 10.4, url: "https://www.youtube.com/watch?v=O2jj3YbgX_w", hookType: "Statistic + Solution", source: "brave", thumbnail: "🎬" },
  { id: "v9", platform: "YouTube", platformIcon: "▶️", author: "Russell Brunson", handle: "@RussellBrunson", text: "Your funnel doesn't need more traffic. It needs a better HOOK. Swipe for the Hook Framework →", views: 950000, likes: 142000, comments: 8700, shares: 19000, engagement: 17.9, url: "https://www.youtube.com/watch?v=1y3S6M1MNO0", hookType: "Problem Reframe + CTA", source: "extension", thumbnail: "🎬" },
  { id: "v10", platform: "YouTube", platformIcon: "▶️", author: "Alex Hormozi", handle: "@AlexHormozi", text: "If I Started A Business in 2026, I'd Do This", views: 1500000, likes: 198000, comments: 11200, shares: 35000, engagement: 16.3, url: "https://www.youtube.com/watch?v=6BQ3whjWG3M", hookType: "Hypothetical + Authority", source: "extension", thumbnail: "🎬" },
];

/* ───── Default Competitors ───── */
const DEFAULT_COMPETITORS: Competitor[] = [
  { id: "c1", name: "Alex Hormozi", handle: "@AlexHormozi", platform: "YouTube", icon: "▶️" },
  { id: "c2", name: "Gary Vee", handle: "@garyvee", platform: "YouTube", icon: "▶️" },
  { id: "c3", name: "Iman Gadzhi", handle: "@ImanGadzhi", platform: "YouTube", icon: "▶️" },
  { id: "c4", name: "Leila Hormozi", handle: "@LeilaHormozi", platform: "YouTube", icon: "▶️" },
  { id: "c5", name: "Codie Sanchez", handle: "@CodieSanchez", platform: "YouTube", icon: "▶️" },
  { id: "c6", name: "Patrick Bet-David", handle: "@patrickbetdavid", platform: "YouTube", icon: "▶️" },
];

const formatNum = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

const SORT_OPTIONS: { id: SortBy; label: string; icon: string; desc: string }[] = [
  { id: "views", label: "Most Viewed", icon: "👀", desc: "Highest total views" },
  { id: "engagement", label: "Most Engaged", icon: "🔥", desc: "Highest engagement rate" },
  { id: "comments", label: "Most Discussed", icon: "💬", desc: "Highest comments" },
  { id: "shares", label: "Most Shared", icon: "🔄", desc: "Highest shares" },
];

/* ───── YouTube Video ID Extract ───── */
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] || null;
}

export default function ViralIntelligence() {
  const [sortBy, setSortBy] = useState<SortBy>("engagement");
  const [filterSource, setFilterSource] = useState<SourceType>("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [breakdownData, setBreakdownData] = useState<Record<string, any>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [newCompPlatform, setNewCompPlatform] = useState("YouTube");
  const router = useRouter();

  // Load competitors from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cf_competitors");
      if (saved) {
        try { setCompetitors(JSON.parse(saved)); } catch { setCompetitors(DEFAULT_COMPETITORS); }
      } else {
        setCompetitors(DEFAULT_COMPETITORS);
        localStorage.setItem("cf_competitors", JSON.stringify(DEFAULT_COMPETITORS));
      }
    } catch {
      setCompetitors(DEFAULT_COMPETITORS);
    }
  }, []);

  // Save competitors to localStorage
  const saveCompetitors = (list: Competitor[]) => {
    setCompetitors(list);
    try { localStorage.setItem("cf_competitors", JSON.stringify(list)); } catch { /* storage unavailable */ }
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    const platformIcons: Record<string, string> = { YouTube: "▶️", TikTok: "📱", Instagram: "📸", X: "𝕏", LinkedIn: "💼" };
    const comp: Competitor = {
      id: `c_${Date.now()}`,
      name: newCompetitor.trim().replace(/^@/, ""),
      handle: newCompetitor.trim().startsWith("@") ? newCompetitor.trim() : `@${newCompetitor.trim()}`,
      platform: newCompPlatform,
      icon: platformIcons[newCompPlatform] || "🌐",
    };
    saveCompetitors([...competitors, comp]);
    setNewCompetitor("");
  };

  const removeCompetitor = (id: string) => {
    saveCompetitors(competitors.filter(c => c.id !== id));
  };

  const filtered = VIRAL_POSTS
    .filter(p => filterSource === "all" || p.source === filterSource)
    .filter(p => filterPlatform === "all" || p.platform === filterPlatform)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const handleDuplicate = (post: ViralPost) => {
    setDuplicating(post.id);
    const topic = encodeURIComponent(post.text);
    setTimeout(() => {
      router.push(`/scripts?topic=${topic}&hook=${encodeURIComponent(post.hookType)}`);
    }, 600);
  };

  const handleSendToOpenClaw = (post: ViralPost) => {
    const prompt = encodeURIComponent(`Create content inspired by this viral ${post.platform} post by ${post.author}: "${post.text}" — Use the ${post.hookType} hook strategy. Make it in my brand voice.`);
    router.push(`/openclaw/produce?prompt=${prompt}`);
  };

  const handleBreakdown = async (post: ViralPost) => {
    if (expandedBreakdown === post.id) { setExpandedBreakdown(null); return; }
    if (breakdownData[post.id]) { setExpandedBreakdown(post.id); return; }

    // If URL is real, analyze it
    if (post.url && post.url !== "#") {
      setAnalyzingId(post.id);
      try {
        const res = await fetch("/api/analyze/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: post.url }),
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data = await res.json().catch(() => ({}));
        setBreakdownData((prev: Record<string, unknown>) => ({ ...prev, [post.id]: data }));
        setExpandedBreakdown(post.id);
      } catch {
        router.push(`/research/breakdown?url=${encodeURIComponent(post.url)}`);
      } finally {
        setAnalyzingId(null);
      }
    } else {
      router.push(`/research/breakdown`);
    }
  };

  const handleCreateMyVersion = (script: string) => {
    router.push(`/scripts?topic=${encodeURIComponent(script.substring(0, 500))}`);
  };

  const getBreakdownState = (post: ViralPost) => {
    if (analyzingId === post.id) return { label: "🔬 Analyzing...", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
    if (breakdownData[post.id]) return { label: "✅ Ready", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" };
    return { label: "🔍 Breakdown", color: "#8b5cf6", bg: "transparent" };
  };

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>🔥 Viral Intelligence</h2>
            <p>Ranked by performance — find what&apos;s viral, watch it, break it down, duplicate it.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{filtered.length} videos tracked</span>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">

        {/* ── Competitor Quick-Add Bar ── */}
        <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-primary)" }}>
              ⚔️ Tracked Competitors
            </div>
            <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{competitors.length} tracked</span>
          </div>

          {/* Competitor Pills */}
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
            {competitors.map(c => (
              <span key={c.id} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "rgba(249, 115, 22, 0.1)", border: "1px solid rgba(249, 115, 22, 0.25)",
                color: "#f97316", fontSize: "11px", fontWeight: 600,
                padding: "4px 10px", borderRadius: "var(--radius-full)",
              }}>
                {c.icon} {c.name}
                <button onClick={() => removeCompetitor(c.id)} style={{
                  background: "none", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", fontSize: "10px", marginLeft: 2, padding: 0,
                }}>✕</button>
              </span>
            ))}
          </div>

          {/* Add Competitor Input */}
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <select
              value={newCompPlatform}
              onChange={e => setNewCompPlatform(e.target.value)}
              className="form-input"
              style={{ width: 120, fontSize: "var(--text-xs)", padding: "6px 8px" }}
            >
              {["YouTube", "TikTok", "Instagram", "X", "LinkedIn"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              className="form-input"
              placeholder="@handle or channel name"
              value={newCompetitor}
              onChange={e => setNewCompetitor(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCompetitor()}
              style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 10px" }}
            />
            <button
              className="btn btn-primary"
              onClick={addCompetitor}
              disabled={!newCompetitor.trim()}
              style={{
                fontSize: "var(--text-xs)", padding: "6px 14px", whiteSpace: "nowrap",
                background: newCompetitor.trim() ? "linear-gradient(135deg, #f97316, #ea580c)" : "var(--bg-input)",
                opacity: newCompetitor.trim() ? 1 : 0.5,
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* ── Sort Selector ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className="card"
              style={{
                padding: "var(--space-3)", cursor: "pointer",
                border: `2px solid ${sortBy === opt.id ? "#f97316" : "var(--border-subtle)"}`,
                background: sortBy === opt.id ? "rgba(249, 115, 22, 0.08)" : undefined,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.3rem", marginBottom: 2 }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: sortBy === opt.id ? "#f97316" : "var(--text-primary)" }}>{opt.label}</div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: 2 }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Source:</span>
            {[
              { id: "all" as SourceType, label: "All" },
              { id: "extension" as SourceType, label: "🧩 Extension" },
              { id: "apify" as SourceType, label: "🕷️ Apify" },
              { id: "brave" as SourceType, label: "🦁 Brave" },
            ].map(s => (
              <button key={s.id} onClick={() => setFilterSource(s.id)} className={`modifier-tag ${filterSource === s.id ? "active" : ""}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Platform:</span>
            {["all", "TikTok", "Instagram", "YouTube", "X", "LinkedIn"].map(p => (
              <button key={p} onClick={() => setFilterPlatform(p)} className={`modifier-tag ${filterPlatform === p ? "active" : ""}`}>
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ranked Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {filtered.map((post, rank) => {
            const bState = getBreakdownState(post);
            const isExpanded = expandedBreakdown === post.id;
            const ytId = getYouTubeId(post.url);
            return (
              <div key={post.id}>
                <div className="card" style={{
                  padding: 0, overflow: "hidden",
                  border: rank === 0 ? "2px solid #f97316" : rank === 1 ? "2px solid #8b5cf6" : rank === 2 ? "2px solid #06b6d4" : undefined,
                }}>
                  <div style={{ display: "flex" }}>
                    {/* Rank Badge */}
                    <div style={{
                      width: 56, display: "flex", alignItems: "center", justifyContent: "center",
                      background: rank === 0 ? "rgba(249, 115, 22, 0.1)" : rank === 1 ? "rgba(139, 92, 246, 0.1)" : rank === 2 ? "rgba(6, 182, 212, 0.1)" : "var(--bg-input)",
                      borderRight: "1px solid var(--border-subtle)", flexShrink: 0,
                    }}>
                      <div style={{
                        fontSize: rank < 3 ? "1.4rem" : "var(--text-md)",
                        fontWeight: 900,
                        color: rank === 0 ? "#f97316" : rank === 1 ? "#8b5cf6" : rank === 2 ? "#06b6d4" : "var(--text-muted)",
                      }}>
                        {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: "var(--space-4) var(--space-5)" }}>
                      {/* Author Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span>{post.platformIcon}</span>
                          <span style={{ fontWeight: 700, fontSize: "var(--text-xs)" }}>{post.author}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{post.handle}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span style={{
                            background: "rgba(249, 115, 22, 0.12)", color: "#f97316",
                            fontSize: "9px", fontWeight: 700,
                            padding: "2px 8px", borderRadius: "var(--radius-full)",
                          }}>{post.hookType}</span>
                          <span style={{
                            fontSize: "9px", color: "var(--text-muted)",
                            background: "var(--bg-input)", padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                          }}>{post.source === "extension" ? "🧩" : post.source === "apify" ? "🕷️" : "🦁"} {post.source}</span>
                        </div>
                      </div>

                      {/* Post Text */}
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, lineHeight: 1.5, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
                        &ldquo;{post.text}&rdquo;
                      </div>

                      {/* Video URL Link */}
                      {post.url && post.url !== "#" && (
                        <div style={{ marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "10px", color: "#06b6d4", textDecoration: "none",
                              display: "inline-flex", alignItems: "center", gap: 4,
                              maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            🔗 {post.url.replace(/https?:\/\/(www\.)?/, "").substring(0, 50)}...
                          </a>
                          {ytId && (
                            <button
                              onClick={() => setPreviewVideo(previewVideo === post.id ? null : post.id)}
                              style={{
                                background: previewVideo === post.id ? "rgba(239, 68, 68, 0.15)" : "rgba(6, 182, 212, 0.12)",
                                color: previewVideo === post.id ? "#ef4444" : "#06b6d4",
                                border: "none", cursor: "pointer",
                                fontSize: "10px", fontWeight: 600,
                                padding: "2px 8px", borderRadius: "var(--radius-full)",
                              }}
                            >
                              {previewVideo === post.id ? "✕ Close" : "▶️ Watch"}
                            </button>
                          )}
                          {!ytId && (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: "rgba(6, 182, 212, 0.12)", color: "#06b6d4",
                                fontSize: "10px", fontWeight: 600,
                                padding: "2px 8px", borderRadius: "var(--radius-full)",
                                textDecoration: "none",
                              }}
                            >
                              ▶️ Watch
                            </a>
                          )}
                        </div>
                      )}

                      {/* YouTube Inline Preview */}
                      {previewVideo === post.id && ytId && (
                        <div style={{
                          marginBottom: "var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          aspectRatio: "16/9",
                          maxHeight: 280,
                          background: "#000",
                        }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                            style={{ width: "100%", height: "100%", border: "none" }}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {/* Stats Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "var(--space-4)" }}>
                          {[
                            { value: formatNum(post.views), label: "👀 Views", key: "views" as SortBy },
                            { value: post.engagement.toFixed(1) + "%", label: "🔥 Engaged", key: "engagement" as SortBy },
                            { value: formatNum(post.comments), label: "💬 Comments", key: "comments" as SortBy },
                            { value: formatNum(post.shares), label: "🔄 Shares", key: "shares" as SortBy },
                            { value: formatNum(post.likes), label: "❤️ Likes", key: undefined },
                          ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                              <div style={{ fontWeight: 800, fontSize: "var(--text-sm)", color: s.key === sortBy ? "#f97316" : "var(--text-primary)" }}>
                                {s.value}
                              </div>
                              <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "var(--space-2)" }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleDuplicate(post)}
                            style={{
                              fontSize: "var(--text-xs)", padding: "var(--space-2) var(--space-4)",
                              background: duplicating === post.id ? "rgba(34, 197, 94, 0.2)" : "linear-gradient(135deg, #f97316, #ea580c)",
                              color: duplicating === post.id ? "#22c55e" : "#fff",
                              border: duplicating === post.id ? "1px solid #22c55e" : "none",
                            }}
                          >
                            {duplicating === post.id ? "✅ Sending..." : "✨ Duplicate"}
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => handleBreakdown(post)}
                            title="Deep Video Breakdown"
                            style={{
                              fontSize: "var(--text-xs)",
                              padding: "var(--space-2) var(--space-3)",
                              border: `1px solid ${bState.color}44`,
                              color: bState.color,
                              background: bState.bg,
                            }}
                          >
                            {bState.label}
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => handleSendToOpenClaw(post)}
                            title="Send to AI Producer"
                            style={{ fontSize: "var(--text-xs)", padding: "var(--space-2) var(--space-3)" }}
                          >
                            🦀
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Breakdown Expansion */}
                {isExpanded && Boolean(breakdownData[post.id]) && (
                  <div className="card" style={{
                    marginTop: "var(--space-2)",
                    padding: "var(--space-5)",
                    borderLeft: "4px solid #8b5cf6",
                    animation: "fadeIn 0.3s ease",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                      <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "#8b5cf6" }}>
                        🔬 Deep Breakdown — {post.author}
                      </h3>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setExpandedBreakdown(null)}
                        style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
                      >
                        ✕ Close
                      </button>
                    </div>
                    <VideoBreakdown
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      data={(breakdownData[post.id] || {}) as any}
                      onCreateMyVersion={handleCreateMyVersion}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
