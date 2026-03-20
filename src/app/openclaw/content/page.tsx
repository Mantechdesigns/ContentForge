"use client";

import { useState } from "react";
import AppShell from "../../components/AppShell";

/* ───── Types ───── */
interface VaultItem {
  id: string;
  title: string;
  type: "video" | "image" | "carousel";
  platform: string;
  platformIcon: string;
  status: "ready" | "exported" | "scheduled";
  createdAt: string;
  thumbnail: string;
}

/* ───── Mock ───── */
const ITEMS: VaultItem[] = [
  { id: "1", title: "Profit Leak Audit — Talking Head", type: "video", platform: "TikTok", platformIcon: "📱", status: "ready", createdAt: "2 min ago", thumbnail: "🎬" },
  { id: "2", title: "5 Revenue Leaks Carousel", type: "carousel", platform: "Instagram", platformIcon: "📸", status: "exported", createdAt: "15 min ago", thumbnail: "📸" },
  { id: "3", title: "BRR Accelerator Promo Banner", type: "image", platform: "LinkedIn", platformIcon: "💼", status: "ready", createdAt: "30 min ago", thumbnail: "🖼️" },
  { id: "4", title: "$500K Scaling Framework", type: "video", platform: "YouTube", platformIcon: "▶️", status: "scheduled", createdAt: "1 hour ago", thumbnail: "🎬" },
  { id: "5", title: "Cold Outreach Email Template", type: "image", platform: "All", platformIcon: "🌐", status: "exported", createdAt: "2 hours ago", thumbnail: "🖼️" },
  { id: "6", title: "Agency Owner Testimonial — Sarah K.", type: "video", platform: "TikTok", platformIcon: "📱", status: "ready", createdAt: "3 hours ago", thumbnail: "🎬" },
  { id: "7", title: "3 C's of Business Framework", type: "carousel", platform: "Instagram", platformIcon: "📸", status: "scheduled", createdAt: "4 hours ago", thumbnail: "📸" },
  { id: "8", title: "Morning Routine That Made $2M", type: "video", platform: "Facebook", platformIcon: "📘", status: "exported", createdAt: "5 hours ago", thumbnail: "🎬" },
  { id: "9", title: "ManTech Logo Animated Intro", type: "video", platform: "All", platformIcon: "🌐", status: "ready", createdAt: "1 day ago", thumbnail: "🎬" },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ready: { bg: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", label: "Ready" },
  exported: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", label: "Exported" },
  scheduled: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", label: "Scheduled" },
};

export default function ContentVault() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = filter === "all" ? ITEMS : ITEMS.filter(i => i.type === filter);

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📂 Content Vault</h2>
            <p>All content produced by OpenClaw — preview, export, or schedule.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{filtered.length} items</span>
            <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "var(--radius-sm)", padding: 2 }}>
              {(["grid", "list"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "var(--space-1) var(--space-2)", border: "none", borderRadius: "var(--radius-sm)",
                  background: view === v ? "#06b6d4" : "transparent",
                  color: view === v ? "#fff" : "var(--text-muted)",
                  cursor: "pointer", fontSize: "var(--text-xs)",
                }}>{v === "grid" ? "▦" : "☰"}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Filters */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
          {[
            { id: "all", label: "All", icon: "📁" },
            { id: "video", label: "Videos", icon: "🎬" },
            { id: "image", label: "Images", icon: "🖼️" },
            { id: "carousel", label: "Carousels", icon: "📸" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`modifier-tag ${filter === f.id ? "active" : ""}`}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
            {filtered.map(item => {
              const s = STATUS_STYLES[item.status];
              return (
                <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{
                    height: 140, background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(8, 145, 178, 0.04))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "3rem", position: "relative",
                  }}>
                    {item.thumbnail}
                    <span style={{
                      position: "absolute", top: 8, right: 8,
                      background: s.bg, color: s.color,
                      fontSize: "10px", fontWeight: 700,
                      padding: "2px 8px", borderRadius: "var(--radius-full)",
                    }}>{s.label}</span>
                  </div>
                  <div style={{ padding: "var(--space-4)" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{item.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
                      <span>{item.platformIcon} {item.platform}</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button className="btn btn-ghost" style={{ flex: 1, padding: "var(--space-1)", fontSize: "var(--text-xs)" }}>👁️ Preview</button>
                      <button className="btn btn-primary" style={{ flex: 1, padding: "var(--space-1)", fontSize: "var(--text-xs)", background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>📤 Export</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {filtered.map(item => {
              const s = STATUS_STYLES[item.status];
              return (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-4)",
                  padding: "var(--space-4) var(--space-5)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}>
                  <span style={{ fontSize: "1.5rem", width: 36 }}>{item.thumbnail}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {item.platformIcon} {item.platform} • {item.createdAt}
                    </div>
                  </div>
                  <span style={{
                    padding: "var(--space-1) var(--space-3)", borderRadius: "var(--radius-full)",
                    background: s.bg, color: s.color, fontSize: "var(--text-xs)", fontWeight: 600,
                  }}>{s.label}</span>
                  <div style={{ display: "flex", gap: "var(--space-1)" }}>
                    <button className="btn btn-ghost" style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--text-xs)" }}>👁️</button>
                    <button className="btn btn-ghost" style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--text-xs)" }}>📤</button>
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
