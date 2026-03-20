"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";

/* ───── Types ───── */
interface AutomationConfig {
  dailyVolume: number;
  platforms: string[];
  videoTypes: string[];
  autoApprove: boolean;
  approvalTimeout: string;
  timeoutAction: "send" | "notify" | "hold";
  scheduleWindow: { start: string; end: string };
  bRoll: boolean;
  framework: string;
}

interface QueuedVideo {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "auto-sent" | "producing";
  platform: string;
  videoType: string;
  scheduledFor: string;
  createdAt: string;
}

/* ───── Constants ───── */
const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "📱", color: "#00f2ea" },
  { id: "instagram", label: "Instagram Reels", icon: "📸", color: "#e4405f" },
  { id: "youtube", label: "YouTube Shorts", icon: "▶️", color: "#ff0000" },
  { id: "facebook", label: "Facebook Reels", icon: "📘", color: "#1877f2" },
  { id: "linkedin", label: "LinkedIn Video", icon: "💼", color: "#0a66c2" },
];

const VIDEO_TYPES = [
  { id: "talking-head", label: "Talking Head", icon: "🗣️" },
  { id: "broll", label: "B-Roll Overlay", icon: "🎞️" },
  { id: "cinematic", label: "Cinematic UGC", icon: "🎬" },
  { id: "split", label: "Split Screen", icon: "📱" },
];

const APPROVAL_TIMEOUTS = [
  { id: "1h", label: "1 Hour" },
  { id: "6h", label: "6 Hours" },
  { id: "24h", label: "24 Hours" },
  { id: "48h", label: "48 Hours" },
  { id: "1w", label: "1 Week" },
];

const TIMEOUT_ACTIONS = [
  { id: "send", label: "Auto-Send", icon: "🚀", desc: "Automatically post if not reviewed" },
  { id: "notify", label: "Notify Only", icon: "🔔", desc: "Send reminder, keep in queue" },
  { id: "hold", label: "Hold", icon: "⏸️", desc: "Keep waiting until manual review" },
];

/* ───── Mock Queue Data ───── */
const MOCK_QUEUE: QueuedVideo[] = [
  { id: "1", title: "Why 90% of businesses leak profit without knowing", status: "pending", platform: "tiktok", videoType: "talking-head", scheduledFor: "Today 2:00 PM", createdAt: "10 min ago" },
  { id: "2", title: "The 3-step system to scale past $500K", status: "pending", platform: "instagram", videoType: "broll", scheduledFor: "Today 4:00 PM", createdAt: "10 min ago" },
  { id: "3", title: "Your competitors know this and you don't", status: "approved", platform: "youtube", videoType: "cinematic", scheduledFor: "Today 6:00 PM", createdAt: "25 min ago" },
  { id: "4", title: "Stop trading hours for dollars — here's how", status: "producing", platform: "tiktok", videoType: "talking-head", scheduledFor: "Tomorrow 10:00 AM", createdAt: "30 min ago" },
  { id: "5", title: "I audited a $2M business and found $300K in leaks", status: "auto-sent", platform: "instagram", videoType: "broll", scheduledFor: "Yesterday 3:00 PM", createdAt: "1 day ago" },
];

export default function AutoPilotPage() {
  const [config, setConfig] = useState<AutomationConfig>({
    dailyVolume: 10,
    platforms: ["tiktok", "instagram", "youtube"],
    videoTypes: ["talking-head", "broll"],
    autoApprove: false,
    approvalTimeout: "24h",
    timeoutAction: "notify",
    scheduleWindow: { start: "09:00", end: "21:00" },
    bRoll: true,
    framework: "mantech-master",
  });

  const [queue, setQueue] = useState<QueuedVideo[]>(MOCK_QUEUE);
  const [isRunning, setIsRunning] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [batchSize, setBatchSize] = useState(7);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const togglePlatform = (id: string) => {
    setConfig(prev => ({
      ...prev,
      platforms: prev.platforms.includes(id) ? prev.platforms.filter(p => p !== id) : [...prev.platforms, id],
    }));
  };

  const toggleVideoType = (id: string) => {
    setConfig(prev => ({
      ...prev,
      videoTypes: prev.videoTypes.includes(id) ? prev.videoTypes.filter(p => p !== id) : [...prev.videoTypes, id],
    }));
  };

  const approveItem = (id: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: "approved" as const } : q));
  };

  const rejectItem = (id: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: "rejected" as const } : q));
  };

  const approveAll = () => {
    setQueue(prev => prev.map(q => q.status === "pending" ? { ...q, status: "approved" as const } : q));
  };

  const AI_TOPICS = [
    "Why 80% of business owners burn out before hitting $1M",
    "The profit leak hiding in your accounting software",
    "3 things I'd do with $10K to scale to $50K/month",
    "Stop outsourcing this or you'll lose your business",
    "The framework that took me from $500K to $2M in 8 months",
    "Your VA should be doing this but isn't",
    "The $300K mistake I see in every agency I audit",
    "If you can't explain your offer in 8 seconds, it's broken",
    "Why your funnel converts at 1% and mine converts at 12%",
    "The morning routine that replaced my 60-hour work weeks",
  ];

  const thinkForMe = (autoApproveAll: boolean) => {
    setAiGenerating(true);
    setAiProgress(0);
    const count = batchSize;
    let generated = 0;

    intervalRef.current = setInterval(() => {
      generated++;
      setAiProgress(Math.round((generated / count) * 100));

      const topicIdx = Math.floor(Math.random() * AI_TOPICS.length);
      const platIdx = Math.floor(Math.random() * config.platforms.length);
      const typeIdx = Math.floor(Math.random() * config.videoTypes.length);

      const newVideo: QueuedVideo = {
        id: String(Date.now() + generated),
        title: AI_TOPICS[topicIdx],
        status: autoApproveAll ? "approved" : "pending",
        platform: config.platforms[platIdx] || "tiktok",
        videoType: config.videoTypes[typeIdx] || "talking-head",
        scheduledFor: `Today ${Math.floor(Math.random() * 12) + 1}:00 PM`,
        createdAt: "Just now",
      };
      setQueue(prev => [newVideo, ...prev]);

      if (generated >= count) {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          setAiGenerating(false);
          setAiProgress(0);
        }, 500);
      }
    }, 600);
  };

  const totalDaily = config.dailyVolume * config.platforms.length;

  const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", label: "⏳ Pending" },
    approved: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", label: "✅ Approved" },
    rejected: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", label: "❌ Rejected" },
    "auto-sent": { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", label: "🚀 Auto-Sent" },
    producing: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", label: "⚡ Producing" },
  };

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              🚀 AutoPilot
              <span style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                color: "#fff",
                fontSize: "var(--text-xs)",
                padding: "2px 10px",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
              }}>
                PRO
              </span>
            </h2>
            <p>Automated content production engine — set it, review it, let it fly.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <button
              className={`btn ${isRunning ? "btn-ghost" : "btn-primary"}`}
              onClick={() => setIsRunning(!isRunning)}
              style={isRunning ? { border: "1px solid var(--accent-green)", color: "var(--accent-green)" } : {}}
            >
              {isRunning ? "⏸ Pause Engine" : "▶ Start Engine"}
            </button>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Stats Bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-4)", marginBottom: "var(--space-6)",
        }}>
          {[
            { label: "Daily Target", value: `${totalDaily} videos`, color: "var(--accent-primary)" },
            { label: "Pending Review", value: `${queue.filter(q => q.status === "pending").length}`, color: "#fbbf24" },
            { label: "Approved Today", value: `${queue.filter(q => q.status === "approved").length}`, color: "#22c55e" },
            { label: "Auto-Sent", value: `${queue.filter(q => q.status === "auto-sent").length}`, color: "#8b5cf6" },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: "var(--space-4)", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>{stat.label}</div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 🧠 Think For Me — AI Batch Panel */}
        <div className="card" style={{
          padding: "var(--space-6)",
          marginBottom: "var(--space-6)",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.03))",
          border: "1px solid rgba(139, 92, 246, 0.25)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
            <div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                🧠 AI Content Engine
                <span style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  color: "#fff", fontSize: "10px", padding: "2px 8px",
                  borderRadius: "var(--radius-full)", fontWeight: 700,
                }}>AUTO</span>
              </h3>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                Let AI research, write, produce, and schedule — you just review
              </p>
            </div>

            {/* Batch Size */}
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Batch:</span>
              {[3, 5, 7, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setBatchSize(n)}
                  style={{
                    width: 36, height: 36,
                    borderRadius: "var(--radius-sm)",
                    border: `2px solid ${batchSize === n ? "#8b5cf6" : "var(--border-default)"}`,
                    background: batchSize === n ? "rgba(139, 92, 246, 0.2)" : "var(--bg-input)",
                    color: batchSize === n ? "#8b5cf6" : "var(--text-primary)",
                    fontWeight: 700, cursor: "pointer", fontSize: "var(--text-sm)",
                  }}
                >{n}</button>
              ))}
            </div>
          </div>

          {/* AI Progress */}
          {aiGenerating && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#8b5cf6", marginBottom: 4 }}>
                <span>🧠 AI is thinking and generating...</span>
                <span>{aiProgress}%</span>
              </div>
              <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${aiProgress}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
                  borderRadius: "var(--radius-full)",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => thinkForMe(false)}
              disabled={aiGenerating}
              style={{
                padding: "var(--space-4)",
                flexDirection: "column", display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg-input)",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🧠</span>
              <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>Think For Me</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Generate {batchSize} ideas → queue for review</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => thinkForMe(true)}
              disabled={aiGenerating}
              style={{
                padding: "var(--space-4)",
                flexDirection: "column", display: "flex", alignItems: "center", gap: 6,
                background: "rgba(139, 92, 246, 0.08)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🚀</span>
              <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>Generate For Me</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Script + produce {batchSize} videos now</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => thinkForMe(true)}
              disabled={aiGenerating}
              style={{
                padding: "var(--space-4)",
                flexDirection: "column", display: "flex", alignItems: "center", gap: 6,
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>Auto-Approve All</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Generate + approve {batchSize} → auto-post</span>
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
          {/* Left: Configuration */}
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-5)" }}>⚙️ Engine Config</h3>

            {/* Daily Volume */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label">📊 Videos Per Platform / Day</label>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <input
                  type="range"
                  min={1} max={30}
                  value={config.dailyVolume}
                  onChange={(e) => setConfig(prev => ({ ...prev, dailyVolume: parseInt(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{
                  background: "var(--accent-primary)",
                  color: "#fff",
                  padding: "var(--space-1) var(--space-3)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 700,
                  fontSize: "var(--text-sm)",
                  minWidth: 36,
                  textAlign: "center",
                }}>
                  {config.dailyVolume}
                </span>
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                = {totalDaily} total videos/day across {config.platforms.length} platform(s)
              </p>
            </div>

            {/* Platforms */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label">📱 Platforms</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    style={{
                      padding: "var(--space-2) var(--space-3)",
                      borderRadius: "var(--radius-sm)",
                      border: `2px solid ${config.platforms.includes(p.id) ? p.color : "var(--border-default)"}`,
                      background: config.platforms.includes(p.id) ? `${p.color}20` : "var(--bg-input)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "var(--text-xs)",
                      fontWeight: config.platforms.includes(p.id) ? 600 : 400,
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Types */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label">🎬 Video Types</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {VIDEO_TYPES.map((vt) => (
                  <button
                    key={vt.id}
                    onClick={() => toggleVideoType(vt.id)}
                    className={`modifier-tag ${config.videoTypes.includes(vt.id) ? "active" : ""}`}
                  >
                    {vt.icon} {vt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Window */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label">🕐 Posting Window</label>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <input
                  type="time"
                  value={config.scheduleWindow.start}
                  onChange={(e) => setConfig(prev => ({ ...prev, scheduleWindow: { ...prev.scheduleWindow, start: e.target.value } }))}
                  className="form-input"
                  style={{ width: 140 }}
                />
                <span style={{ color: "var(--text-muted)" }}>to</span>
                <input
                  type="time"
                  value={config.scheduleWindow.end}
                  onChange={(e) => setConfig(prev => ({ ...prev, scheduleWindow: { ...prev.scheduleWindow, end: e.target.value } }))}
                  className="form-input"
                  style={{ width: 140 }}
                />
              </div>
            </div>
          </div>

          {/* Right: Approval Settings */}
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-5)" }}>🔐 Approval Rules</h3>

            {/* Auto-Approve Toggle */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                <label className="form-label" style={{ margin: 0 }}>⚡ Full Auto-Approve</label>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, autoApprove: !prev.autoApprove }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none",
                    background: config.autoApprove ? "#8b5cf6" : "var(--bg-input)",
                    cursor: "pointer", position: "relative", transition: "background var(--transition-fast)",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3,
                    left: config.autoApprove ? 23 : 3,
                    transition: "left var(--transition-fast)",
                  }} />
                </button>
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                {config.autoApprove
                  ? "Videos will be posted automatically without review"
                  : "Videos go to queue for manual approval before posting"}
              </p>
            </div>

            {/* Approval Timeout */}
            {!config.autoApprove && (
              <>
                <div style={{ marginBottom: "var(--space-5)" }}>
                  <label className="form-label">⏱️ If Not Reviewed Within</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                    {APPROVAL_TIMEOUTS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setConfig(prev => ({ ...prev, approvalTimeout: t.id }))}
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          borderRadius: "var(--radius-sm)",
                          border: `2px solid ${config.approvalTimeout === t.id ? "#8b5cf6" : "var(--border-default)"}`,
                          background: config.approvalTimeout === t.id ? "rgba(139, 92, 246, 0.15)" : "var(--bg-input)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          fontSize: "var(--text-xs)",
                          fontWeight: config.approvalTimeout === t.id ? 600 : 400,
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "var(--space-5)" }}>
                  <label className="form-label">🎯 Then...</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {TIMEOUT_ACTIONS.map((ta) => (
                      <button
                        key={ta.id}
                        onClick={() => setConfig(prev => ({ ...prev, timeoutAction: ta.id as AutomationConfig["timeoutAction"] }))}
                        style={{
                          display: "flex", alignItems: "center", gap: "var(--space-3)",
                          padding: "var(--space-3) var(--space-4)",
                          borderRadius: "var(--radius-sm)",
                          border: `2px solid ${config.timeoutAction === ta.id ? "#8b5cf6" : "var(--border-default)"}`,
                          background: config.timeoutAction === ta.id ? "rgba(139, 92, 246, 0.15)" : "var(--bg-input)",
                          color: "var(--text-primary)",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{ta.icon}</span>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{ta.label}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ta.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Engine Status */}
            <div style={{
              padding: "var(--space-4)",
              background: isRunning ? "rgba(34, 197, 94, 0.1)" : "var(--bg-input)",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${isRunning ? "rgba(34, 197, 94, 0.3)" : "var(--border-default)"}`,
              textAlign: "center",
            }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: isRunning ? "#22c55e" : "var(--text-muted)" }}>
                {isRunning ? "🟢 Engine Running" : "⚫ Engine Paused"}
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                {isRunning
                  ? `Producing ${totalDaily} videos/day • ${config.approvalTimeout} timeout • ${config.timeoutAction} on expire`
                  : "Start the engine to begin automated content production"}
              </p>
            </div>
          </div>
        </div>

        {/* Production Queue */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "var(--space-5) var(--space-6)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>📋 Today&apos;s Queue</h3>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button className="btn btn-primary" onClick={approveAll}>
                ✅ Approve All Pending
              </button>
              <Link href="/autopilot/queue" className="btn btn-secondary">
                View Full Queue →
              </Link>
            </div>
          </div>

          {queue.map((item) => {
            const s = statusStyles[item.status];
            const platform = PLATFORMS.find(p => p.id === item.platform);
            return (
              <div
                key={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-4)",
                  padding: "var(--space-4) var(--space-6)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {/* Platform Icon */}
                <span style={{ fontSize: "1.3rem", width: 32 }}>{platform?.icon}</span>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <span>{platform?.label}</span>
                    <span>•</span>
                    <span>{VIDEO_TYPES.find(v => v.id === item.videoType)?.label}</span>
                    <span>•</span>
                    <span>{item.scheduledFor}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span style={{
                  padding: "var(--space-1) var(--space-3)",
                  borderRadius: "var(--radius-full)",
                  background: s.bg,
                  color: s.color,
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                }}>
                  {s.label}
                </span>

                {/* Actions */}
                {item.status === "pending" && (
                  <div style={{ display: "flex", gap: "var(--space-1)" }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => approveItem(item.id)}
                      style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--text-xs)" }}
                    >
                      ✅
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => rejectItem(item.id)}
                      style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--text-xs)" }}
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Premium Upgrade CTA */}
        {showUpgrade && (
          <div style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-8)",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05))",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>⚡</div>
            <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              Upgrade to AutoPilot Pro
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto var(--space-4)", lineHeight: 1.6 }}>
              Unlock unlimited daily volume, multi-platform scheduling, auto-approval, and priority rendering.
            </p>
            <button className="btn btn-primary btn-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
              🚀 Upgrade Now — $97/mo
            </button>
          </div>
        )}

        {/* Toggle Upgrade Preview */}
        <div style={{ textAlign: "center", marginTop: "var(--space-4)" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowUpgrade(!showUpgrade)}
            style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
          >
            {showUpgrade ? "Hide Upgrade CTA" : "Preview Upgrade CTA (for SaaS)"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
