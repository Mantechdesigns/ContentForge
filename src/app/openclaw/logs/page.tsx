"use client";

import { useState } from "react";
import AppShell from "../../components/AppShell";

/* ───── Types ───── */
interface LogEntry {
  id: string;
  action: string;
  detail: string;
  type: "produce" | "export" | "research" | "decision" | "error" | "system";
  timestamp: string;
  metric?: string;
}

const LOGS: LogEntry[] = [
  { id: "1", action: "Produced Video", detail: "Profit Leak Audit — Talking Head for TikTok", type: "produce", timestamp: "2 min ago", metric: "45s video" },
  { id: "2", action: "Exported", detail: "5 Revenue Leaks Carousel → Instagram via GHL", type: "export", timestamp: "15 min ago", metric: "5 slides" },
  { id: "3", action: "Auto-Decision", detail: "Selected BRR Framework for agency owner audience based on engagement data", type: "decision", timestamp: "16 min ago", metric: "+18% CTR" },
  { id: "4", action: "Research", detail: "Analyzed top 50 TikTok videos in business niche — identified 3 trending hooks", type: "research", timestamp: "20 min ago", metric: "50 videos" },
  { id: "5", action: "Produced Image", detail: "BRR Accelerator Promo Banner for LinkedIn", type: "produce", timestamp: "30 min ago", metric: "1080×1080" },
  { id: "6", action: "Exported", detail: "Agency Owner Testimonial → TikTok + Instagram scheduled for 6 PM", type: "export", timestamp: "45 min ago", metric: "2 platforms" },
  { id: "7", action: "Auto-Decision", detail: "Swapped B-Roll style → Cinematic based on platform engagement trends", type: "decision", timestamp: "50 min ago", metric: "+12% views" },
  { id: "8", action: "Script Written", detail: "$500K Scaling Framework script — 45 seconds for YouTube Shorts", type: "produce", timestamp: "1 hour ago", metric: "148 words" },
  { id: "9", action: "Notion Synced", detail: "Pushed 3 new content items to Content Library workspace", type: "system", timestamp: "1 hour ago", metric: "3 items" },
  { id: "10", action: "Engine Started", detail: "OpenClaw agent came online — loaded brand context and 6 indexed assets", type: "system", timestamp: "1.5 hours ago", metric: "6 assets" },
  { id: "11", action: "Research", detail: "Scanned Google Trends for 'agency scaling' — found 5 content angles", type: "research", timestamp: "2 hours ago", metric: "5 angles" },
  { id: "12", action: "Produced Carousel", detail: "3 C's of Business Framework — 5-slide carousel for Instagram", type: "produce", timestamp: "3 hours ago", metric: "5 slides" },
];

const typeConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  produce: { color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", icon: "🎬", label: "Production" },
  export: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", icon: "📤", label: "Export" },
  research: { color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", icon: "🔍", label: "Research" },
  decision: { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)", icon: "🧠", label: "AI Decision" },
  error: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", icon: "❌", label: "Error" },
  system: { color: "#64748b", bg: "rgba(100, 116, 139, 0.12)", icon: "⚙️", label: "System" },
};

export default function ActivityLog() {
  const [view, setView] = useState<"cards" | "list">("cards");
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? LOGS : LOGS.filter(l => l.type === filter);

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📜 Activity Log</h2>
            <p>Every action your OpenClaw agent has taken — full transparency.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{filtered.length} entries</span>
            <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "var(--radius-sm)", padding: 2 }}>
              {(["cards", "list"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "var(--space-1) var(--space-2)", border: "none", borderRadius: "var(--radius-sm)",
                  background: view === v ? "#06b6d4" : "transparent",
                  color: view === v ? "#fff" : "var(--text-muted)",
                  cursor: "pointer", fontSize: "var(--text-xs)",
                }}>{v === "cards" ? "▦" : "☰"}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Filters */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)", flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} className={`modifier-tag ${filter === "all" ? "active" : ""}`}>📁 All</button>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)} className={`modifier-tag ${filter === key ? "active" : ""}`}>
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>

        {/* Card View */}
        {view === "cards" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
            {filtered.map(log => {
              const cfg = typeConfig[log.type];
              return (
                <div key={log.id} className="card" style={{
                  padding: "var(--space-5)",
                  borderLeft: `3px solid ${cfg.color}`,
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                    <span style={{
                      background: cfg.bg, color: cfg.color,
                      fontSize: "10px", fontWeight: 700,
                      padding: "2px 8px", borderRadius: "var(--radius-full)",
                    }}>{cfg.icon} {cfg.label}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{log.timestamp}</span>
                  </div>

                  {/* Action */}
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                    {log.action}
                  </div>

                  {/* Detail */}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "var(--space-3)" }}>
                    {log.detail}
                  </div>

                  {/* Metric */}
                  {log.metric && (
                    <div style={{
                      background: cfg.bg,
                      borderRadius: "var(--radius-sm)",
                      padding: "var(--space-2) var(--space-3)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: cfg.color,
                      textAlign: "center",
                    }}>
                      {log.metric}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {filtered.map((log, i) => {
              const cfg = typeConfig[log.type];
              return (
                <div key={log.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "var(--space-4)",
                  padding: "var(--space-4) var(--space-6)",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: cfg.color,
                    boxShadow: `0 0 8px ${cfg.color}40`,
                    flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 2 }}>{cfg.icon} {log.action}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5 }}>{log.detail}</div>
                  </div>
                  {log.metric && (
                    <span style={{
                      background: cfg.bg, color: cfg.color,
                      fontSize: "10px", fontWeight: 600,
                      padding: "2px 8px", borderRadius: "var(--radius-full)",
                      whiteSpace: "nowrap",
                    }}>{log.metric}</span>
                  )}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {log.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
