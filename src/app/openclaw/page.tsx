"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";

/* ───── Types ───── */
interface AgentTask {
  id: string;
  type: "video" | "image" | "carousel" | "research" | "script";
  title: string;
  status: "running" | "completed" | "queued" | "failed";
  platform: string;
  createdAt: string;
}

/* ───── Mock Data ───── */
const RECENT_TASKS: AgentTask[] = [
  { id: "1", type: "video", title: "Profit Leak Audit — Talking Head", status: "running", platform: "TikTok", createdAt: "2 min ago" },
  { id: "2", type: "carousel", title: "5 Revenue Leaks Carousel", status: "completed", platform: "Instagram", createdAt: "15 min ago" },
  { id: "3", type: "image", title: "BRR Accelerator Promo Banner", status: "completed", platform: "LinkedIn", createdAt: "30 min ago" },
  { id: "4", type: "video", title: "$500K Scaling Framework", status: "queued", platform: "YouTube", createdAt: "45 min ago" },
  { id: "5", type: "script", title: "Cold Email Outreach — Agency Pitch", status: "completed", platform: "—", createdAt: "1 hour ago" },
];

const typeIcons: Record<string, string> = { video: "🎬", image: "🖼️", carousel: "📸", research: "🔍", script: "📝" };
const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  running: { bg: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", label: "⚡ Running" },
  completed: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", label: "✅ Done" },
  queued: { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", label: "⏳ Queued" },
  failed: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", label: "❌ Failed" },
};

export default function OpenClawDashboard() {
  const [agentStatus, setAgentStatus] = useState<"online" | "offline" | "producing">("online");
  const [tasks] = useState(RECENT_TASKS);

  const completed = tasks.filter(t => t.status === "completed").length;
  const running = tasks.filter(t => t.status === "running").length;

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              🦀 OpenClaw Workspace
              <span style={{
                background: agentStatus === "online" ? "rgba(34, 197, 94, 0.15)" : agentStatus === "producing" ? "rgba(6, 182, 212, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: agentStatus === "online" ? "#22c55e" : agentStatus === "producing" ? "#06b6d4" : "#ef4444",
                fontSize: "var(--text-xs)", padding: "2px 10px",
                borderRadius: "var(--radius-full)", fontWeight: 700,
              }}>
                {agentStatus === "online" ? "● Online" : agentStatus === "producing" ? "⚡ Producing" : "○ Offline"}
              </span>
            </h2>
            <p>Your AI agent&apos;s workspace — it researches, produces, and schedules content autonomously.</p>
          </div>
          <button
            className={`btn ${agentStatus === "offline" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setAgentStatus(prev => prev === "offline" ? "online" : "offline")}
            style={agentStatus !== "offline" ? { border: "1px solid #22c55e", color: "#22c55e" } : {}}
          >
            {agentStatus === "offline" ? "🟢 Bring Online" : "⏸ Take Offline"}
          </button>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          {[
            { label: "Agent Status", value: agentStatus === "online" ? "Online" : agentStatus === "producing" ? "Producing" : "Offline", color: agentStatus === "online" ? "#22c55e" : agentStatus === "producing" ? "#06b6d4" : "#ef4444" },
            { label: "Active Tasks", value: String(running), color: "#06b6d4" },
            { label: "Completed Today", value: String(completed), color: "#22c55e" },
            { label: "Content in Vault", value: "24", color: "#8b5cf6" },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: "var(--space-4)", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>{stat.label}</div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{
          padding: "var(--space-6)", marginBottom: "var(--space-6)",
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(8, 145, 178, 0.03))",
          border: "1px solid rgba(6, 182, 212, 0.25)",
        }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            🧠 Quick Command
            <span style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>AI</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
            {[
              { icon: "🎬", label: "Produce Video", desc: "Script + render a video now" },
              { icon: "🖼️", label: "Create Image", desc: "Generate branded image" },
              { icon: "📸", label: "Build Carousel", desc: "Multi-slide carousel" },
              { icon: "🔍", label: "Research Topic", desc: "Deep trend research" },
            ].map((cmd, i) => (
              <Link key={i} href="/openclaw/produce" style={{ textDecoration: "none" }}>
                <button className="btn btn-secondary" style={{
                  width: "100%", padding: "var(--space-4)",
                  flexDirection: "column", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: "1.5rem" }}>{cmd.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{cmd.label}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{cmd.desc}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Connected Services */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)" }}>🔗 Connected Services</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {[
                { name: "Notion", icon: "📓", status: "connected", detail: "Content library synced" },
                { name: "Google Drive", icon: "📁", status: "connected", detail: "Asset backup active" },
                { name: "Telegram", icon: "✈️", status: "connected", detail: "Command channel linked" },
                { name: "GoHighLevel", icon: "📡", status: "pending", detail: "Ready to connect" },
              ].map((svc, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-2) var(--space-3)",
                  background: "var(--bg-input)", borderRadius: "var(--radius-sm)",
                }}>
                  <span style={{ fontSize: "1.1rem" }}>{svc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>{svc.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{svc.detail}</div>
                  </div>
                  <span style={{
                    fontSize: "9px", fontWeight: 600,
                    color: svc.status === "connected" ? "#22c55e" : "#fbbf24",
                  }}>
                    {svc.status === "connected" ? "● Connected" : "○ Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Intelligence */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)" }}>🧠 Agent Intelligence</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[
                { label: "Brand Context", value: "Loaded", color: "#22c55e", icon: "👤" },
                { label: "Asset Library", value: "6 indexed", color: "#22c55e", icon: "📦" },
                { label: "Framework", value: "BRR Master", color: "#8b5cf6", icon: "📚" },
                { label: "ICP Target", value: "Agency Owners", color: "#06b6d4", icon: "🎯" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "var(--space-2) var(--space-3)",
                  background: "var(--bg-input)", borderRadius: "var(--radius-sm)",
                }}>
                  <span style={{ fontSize: "var(--text-xs)" }}>{item.icon} {item.label}</span>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "var(--space-5) var(--space-6)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>📋 Recent Agent Activity</h3>
            <Link href="/openclaw/logs" className="btn btn-ghost" style={{ fontSize: "var(--text-xs)" }}>
              View All →
            </Link>
          </div>

          {tasks.map(task => {
            const s = statusStyles[task.status];
            return (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: "var(--space-4)",
                padding: "var(--space-4) var(--space-6)",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
                <span style={{ fontSize: "1.3rem", width: 32 }}>{typeIcons[task.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: 2 }}>{task.title}</div>
                  <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <span>{task.platform}</span>
                    <span>•</span>
                    <span>{task.createdAt}</span>
                  </div>
                </div>
                <span style={{
                  padding: "var(--space-1) var(--space-3)",
                  borderRadius: "var(--radius-full)",
                  background: s.bg, color: s.color,
                  fontSize: "var(--text-xs)", fontWeight: 600,
                }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
