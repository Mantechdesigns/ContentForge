"use client";

import Link from "next/link";
import AppShell from "./components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h2>⚡ Dashboard</h2>
        <p>Your content generation command center</p>
      </div>

      <div className="page-body fade-in">
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          {[
            { label: "Videos Generated", value: "0", color: "var(--accent-primary)", sub: "Ready to start 🚀" },
            { label: "Scripts Created", value: "0", color: "var(--accent-blue)", sub: "Start with research" },
            { label: "Viral Ideas", value: "0", color: "var(--accent-green)", sub: "Research first" },
            { label: "Published", value: "0", color: "#8b5cf6", sub: "Connect platforms" },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-change positive">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions — All Functional */}
        <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", fontWeight: 600 }}>
          Quick Actions
        </h3>
        <div className="card-grid" style={{ marginBottom: "var(--space-6)" }}>
          <Link href="/research" className="action-card" style={{ textDecoration: "none" }}>
            <div className="action-icon">🔍</div>
            <h3>New Research</h3>
            <p>Generate 30 viral content ideas from any topic</p>
          </Link>
          <Link href="/scripts" className="action-card" style={{ textDecoration: "none" }}>
            <div className="action-icon">📝</div>
            <h3>Generate Script</h3>
            <p>Create voiceover-ready scripts with modifiers</p>
          </Link>
          <Link href="/production" className="action-card" style={{ textDecoration: "none" }}>
            <div className="action-icon">🎬</div>
            <h3>Produce Video</h3>
            <p>AI voiceover + video generation with full controls</p>
          </Link>
          <Link href="/autopilot" className="action-card" style={{ textDecoration: "none" }}>
            <div className="action-icon">🚀</div>
            <h3>AutoPilot</h3>
            <p>Automate content production at scale</p>
          </Link>
        </div>

        {/* Content Pipeline — All Active */}
        <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", fontWeight: 600 }}>
          Content Pipeline
        </h3>
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "var(--space-4)", flexWrap: "wrap",
          }}>
            {[
              { label: "Research", icon: "🔍", href: "/research", color: "var(--accent-primary)" },
              { label: "Script", icon: "📝", href: "/scripts", color: "var(--accent-blue)" },
              { label: "Voiceover", icon: "🎙️", href: "/production", color: "#f97316" },
              { label: "Video", icon: "🎬", href: "/production", color: "#8b5cf6" },
              { label: "Assets", icon: "📦", href: "/assets", color: "#06b6d4" },
              { label: "Publish", icon: "📡", href: "/autopilot", color: "#22c55e" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <Link href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "var(--space-2)", cursor: "pointer",
                  }}>
                    <div style={{
                      width: 48, height: 48,
                      borderRadius: "var(--radius-lg)",
                      background: `${item.color}15`,
                      border: `2px solid ${item.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.2rem",
                      transition: "transform var(--transition-fast)",
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
                {i < 5 && (
                  <div style={{
                    width: 40, height: 2,
                    background: item.color,
                    borderRadius: "var(--radius-full)",
                    marginBottom: 20,
                    opacity: 0.4,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Engines */}
        <h3 style={{ fontSize: "var(--text-lg)", marginTop: "var(--space-6)", marginBottom: "var(--space-4)", fontWeight: 600 }}>
          AI Engines
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
          {[
            { name: "GPT-4o", provider: "OpenAI", badge: "Scripts", color: "badge-green" },
            { name: "OpenRouter", provider: "100+ Models", badge: "Multi", color: "badge-blue" },
            { name: "Gemini 2.5 Pro", provider: "Google", badge: "Scripts", color: "badge-purple" },
            { name: "Veo 3", provider: "Google", badge: "Video", color: "badge-orange" },
            { name: "ElevenLabs", provider: "ElevenLabs", badge: "Voice", color: "badge-green" },
            { name: "HeyGen", provider: "HeyGen", badge: "Avatar", color: "badge-purple" },
            { name: "Claude", provider: "Anthropic", badge: "Writing", color: "badge-blue" },
            { name: "Ollama", provider: "Local / Private", badge: "Self-Host", color: "badge-orange" },
          ].map((engine, i) => (
            <div key={i} className="card" style={{ padding: "var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{engine.name}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{engine.provider}</div>
              </div>
              <span className={`badge ${engine.color}`}>{engine.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
