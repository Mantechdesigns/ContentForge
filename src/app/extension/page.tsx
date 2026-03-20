"use client";

import AppShell from "../components/AppShell";

/* ───── Supported Platforms ───── */
const PLATFORMS = [
  { name: "TikTok", icon: "📱", scrapes: "Video descriptions, author, likes, comments, shares, URLs", profiles: "Name, handle, bio, followers, following, total likes" },
  { name: "Instagram", icon: "📸", scrapes: "Post captions, author, likes, post URLs", profiles: "Name, handle, bio, posts, followers, following" },
  { name: "YouTube", icon: "▶️", scrapes: "Video titles, channel name, views, video URLs", profiles: "Channel name, handle, subscribers, description" },
  { name: "X (Twitter)", icon: "𝕏", scrapes: "Tweet text, author, likes, retweets, replies, URLs", profiles: "Name, handle, bio, followers, following" },
  { name: "LinkedIn", icon: "💼", scrapes: "Post text, author, likes, post URLs", profiles: "Name, headline, location, connections" },
  { name: "Facebook", icon: "📘", scrapes: "Post text, author, reactions", profiles: "Page name, followers" },
  { name: "Reddit", icon: "🟠", scrapes: "Post titles, subreddit, upvotes, comments", profiles: "Username, karma" },
  { name: "Threads", icon: "🔗", scrapes: "Thread text, author, likes", profiles: "Name, followers" },
];

export default function ExtensionPage() {
  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>🧩 Chrome Extension</h2>
            <p>Scrape any social platform directly from your browser — PRO feature</p>
          </div>
          <span style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff", fontSize: "var(--text-xs)", fontWeight: 700,
            padding: "var(--space-1) var(--space-3)", borderRadius: "var(--radius-full)",
          }}>PRO</span>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* How It Works */}
        <div className="card" style={{
          padding: "var(--space-6)", marginBottom: "var(--space-5)",
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(234, 88, 12, 0.02))",
          border: "1px solid rgba(249, 115, 22, 0.2)",
        }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            🔥 How It Works
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
            {[
              { step: "1", icon: "📥", title: "Install Extension", desc: "Load the Chrome extension from the /chrome-extension folder" },
              { step: "2", icon: "🌐", title: "Browse Any Platform", desc: "Visit TikTok, Instagram, YouTube, X, LinkedIn, or any supported site" },
              { step: "3", icon: "🕷️", title: "Click Scrape", desc: "Extension auto-detects the platform and scrapes feed or profile data" },
              { step: "4", icon: "🔥", title: "Flows to Content Forge", desc: "Data appears in Research Automation → ready for AI analysis" },
            ].map(s => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--radius-lg)",
                  background: "rgba(249, 115, 22, 0.15)", border: "2px solid rgba(249, 115, 22, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", margin: "0 auto var(--space-3)",
                }}>{s.icon}</div>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            📦 Installation
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[
              { step: "1", text: 'Open Chrome → Settings → Extensions → Enable "Developer Mode"' },
              { step: "2", text: 'Click "Load unpacked" → select the /chrome-extension folder' },
              { step: "3", text: "Pin the 🔥 Content Forge icon to your toolbar" },
              { step: "4", text: "Navigate to any social platform and click the extension" },
            ].map(s => (
              <div key={s.step} style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                background: "var(--bg-input)", borderRadius: "var(--radius-sm)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-xs)", fontWeight: 700, color: "#f97316",
                  flexShrink: 0,
                }}>{s.step}</div>
                <span style={{ fontSize: "var(--text-xs)" }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Platforms */}
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
          🌐 Supported Platforms — What Gets Scraped
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
          {PLATFORMS.map(p => (
            <div key={p.name} className="card" style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <span style={{ fontSize: "1.3rem" }}>{p.icon}</span>
                <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{p.name}</span>
              </div>
              <div style={{ marginBottom: "var(--space-2)" }}>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "#f97316", textTransform: "uppercase" }}>Feed Scraping</span>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5 }}>{p.scrapes}</div>
              </div>
              <div>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "#06b6d4", textTransform: "uppercase" }}>Profile Scraping</span>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5 }}>{p.profiles}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Flow */}
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            🔄 Where Scraped Data Goes
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
            {[
              { icon: "🧩", label: "Extension", color: "#f97316" },
              { icon: "→", label: "", color: "var(--text-muted)" },
              { icon: "🔬", label: "Research Auto", color: "#8b5cf6" },
              { icon: "→", label: "", color: "var(--text-muted)" },
              { icon: "💡", label: "Ideas + Scripts", color: "#06b6d4" },
              { icon: "→", label: "", color: "var(--text-muted)" },
              { icon: "🎬", label: "Video Production", color: "#22c55e" },
              { icon: "→", label: "", color: "var(--text-muted)" },
              { icon: "🦀", label: "OpenClaw", color: "#06b6d4" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                {item.label === "" ? (
                  <span style={{ color: item.color, fontSize: "var(--text-lg)" }}>{item.icon}</span>
                ) : (
                  <div>
                    <div style={{
                      width: 44, height: 44, borderRadius: "var(--radius-md)",
                      background: `${item.color}15`, border: `2px solid ${item.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.2rem", margin: "0 auto var(--space-2)",
                    }}>{item.icon}</div>
                    <span style={{ fontSize: "9px", fontWeight: 600, color: item.color }}>{item.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
