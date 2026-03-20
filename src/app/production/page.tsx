"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../components/AppShell";
import AspectRatioSelector, { ApiKeyNotice } from "../components/AspectRatioSelector";

/* ───── Types ───── */
interface VideoConfig {
  videoFormat: "talking-head" | "broll-overlay" | "split-screen" | "cinematic";
  background: string;
  bRoll: boolean;
  bRollStyle: "lifestyle" | "product" | "abstract" | "urban";
  aspectRatio?: "9:16" | "1:1" | "16:9";
}

interface CloneConfig extends VideoConfig {
  avatarId: string;
  avatarName: string;
}

interface UGCConfig extends VideoConfig {
  gender: "male" | "female" | "nonbinary";
  ageRange: "18-25" | "25-35" | "35-50" | "50+";
  accent: "american" | "british" | "australian" | "latin" | "neutral";
  voiceId: string;
}

interface QueueItem {
  id: string;
  topic: string;
  script: string;
  videoType: "ai-clone" | "ugc" | null;
  config: CloneConfig | UGCConfig | null;
  status: "configuring" | "queued" | "voice" | "video" | "rendering" | "done" | "error";
  progress: number;
  createdAt: Date;
  videoUrl?: string;
  voiceUrl?: string;
  remoteVideoUrl?: string;
  errorMessage?: string;
}

/* ───── Options ───── */
const BACKGROUNDS = [
  { id: "office", label: "🏢 Modern Office", preview: "#1a1a2e" },
  { id: "studio", label: "🎙️ Dark Studio", preview: "#0d0d1a" },
  { id: "outdoor", label: "🌳 Outdoor", preview: "#1a2e1a" },
  { id: "minimal", label: "⬜ Minimal White", preview: "#f0f0f0" },
  { id: "gradient", label: "🌈 Brand Gradient", preview: "linear-gradient(135deg, #ff6b2c, #d4a843)" },
  { id: "custom", label: "🎨 Custom Upload", preview: "#2a2a3e" },
];

const VIDEO_FORMATS = [
  { id: "talking-head", label: "Talking Head", icon: "🗣️", desc: "Face-to-camera, direct delivery" },
  { id: "broll-overlay", label: "B-Roll Overlay", icon: "🎞️", desc: "Voiceover with visual cuts" },
  { id: "split-screen", label: "Split Screen", icon: "📱", desc: "Speaker + visuals side by side" },
  { id: "cinematic", label: "Cinematic", icon: "🎬", desc: "Full visual storytelling, no face" },
];

const BROLL_STYLES = [
  { id: "lifestyle", label: "Lifestyle", icon: "🏖️" },
  { id: "product", label: "Product", icon: "📦" },
  { id: "abstract", label: "Abstract", icon: "🎨" },
  { id: "urban", label: "Urban", icon: "🏙️" },
];

const HEYGEN_AVATARS = [
  { id: "avatar-1", name: "Manny (Founder)", thumb: "🧑‍💼" },
  { id: "avatar-2", name: "Professional Male", thumb: "👨‍💻" },
  { id: "avatar-3", name: "Professional Female", thumb: "👩‍💼" },
  { id: "avatar-4", name: "Casual Male", thumb: "🧑" },
  { id: "avatar-5", name: "Casual Female", thumb: "👩" },
];

const UGC_GENDERS = [
  { id: "male", label: "Male", icon: "♂️" },
  { id: "female", label: "Female", icon: "♀️" },
  { id: "nonbinary", label: "Non-binary", icon: "⚧️" },
];

const UGC_AGES = [
  { id: "18-25", label: "18–25" },
  { id: "25-35", label: "25–35" },
  { id: "35-50", label: "35–50" },
  { id: "50+", label: "50+" },
];

const UGC_ACCENTS = [
  { id: "american", label: "🇺🇸 American" },
  { id: "british", label: "🇬🇧 British" },
  { id: "australian", label: "🇦🇺 Australian" },
  { id: "latin", label: "🌎 Latin" },
  { id: "neutral", label: "🌐 Neutral" },
];

/* ───── Components ───── */

function OptionGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "var(--space-2)",
    }}>
      {children}
    </div>
  );
}

function OptionButton({ selected, onClick, children }: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "var(--space-3) var(--space-4)",
        borderRadius: "var(--radius-md)",
        border: `2px solid ${selected ? "var(--accent-primary)" : "var(--border-default)"}`,
        background: selected ? "var(--accent-primary-glow)" : "var(--bg-input)",
        color: "var(--text-primary)",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        fontWeight: selected ? 600 : 400,
        transition: "all var(--transition-fast)",
        textAlign: "center",
      }}
    >
      {children}
    </button>
  );
}

/* ───── Main ───── */

const EXPORT_DESTINATIONS = [
  { id: "ghl", label: "📅 GoHighLevel", desc: "Schedule to socials" },
  { id: "airtable", label: "📊 Airtable", desc: "Content database" },
  { id: "notion", label: "📓 Notion", desc: "Content library" },
  { id: "r2", label: "☁️ Cloudflare R2", desc: "Cloud storage" },
];

function ProductionContent() {
  const searchParams = useSearchParams();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sendMenuId, setSendMenuId] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => { timerRefs.current.forEach(t => clearTimeout(t)); timerRefs.current = []; };
  }, []);

  // Pick up new script from URL
  useEffect(() => {
    const scriptParam = searchParams.get("script");
    const topicParam = searchParams.get("topic");
    if (scriptParam) {
      const newItem: QueueItem = {
        id: String(Date.now()),
        topic: topicParam || "Untitled Script",
        script: scriptParam,
        videoType: null,
        config: null,
        status: "configuring",
        progress: 0,
        createdAt: new Date(),
      };
      setQueue((prev) => [newItem, ...prev]);
    }
  }, [searchParams]);

  const selectVideoType = (itemId: string, type: "ai-clone" | "ugc") => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const baseConfig: VideoConfig = {
          videoFormat: "talking-head",
          background: "studio",
          bRoll: true,
          bRollStyle: "lifestyle",
        };
        const config: CloneConfig | UGCConfig = type === "ai-clone"
          ? { ...baseConfig, avatarId: "avatar-1", avatarName: "Manny (Founder)" }
          : { ...baseConfig, gender: "male", ageRange: "25-35", accent: "american", voiceId: "" };
        return { ...item, videoType: type, config, status: "configuring" as const };
      })
    );
  };

  const updateConfig = (itemId: string, updates: Partial<CloneConfig & UGCConfig>) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === itemId && item.config
          ? { ...item, config: { ...item.config, ...updates } as typeof item.config }
          : item
      )
    );
  };

  const startProduction = async (itemId: string) => {
    const item = queueRef.current.find((q) => q.id === itemId);
    if (!item || item.status !== "configuring") return;

    // Update to queued
    setQueue((prev) =>
      prev.map((q) => (q.id === itemId ? { ...q, status: "queued" as const, progress: 5 } : q))
    );

    // Call real API
    try {
      // Clear previous timers to prevent unbounded growth
      timerRefs.current.forEach(t => clearTimeout(t));
      timerRefs.current = [];
      // Fake progress stages — does NOT set 'done', that only happens when the API returns
      const stages: Array<{ status: QueueItem["status"]; progress: number; delay: number }> = [
        { status: "voice", progress: 20, delay: 1000 },
        { status: "video", progress: 45, delay: 4000 },
        { status: "rendering", progress: 70, delay: 10000 },
        { status: "rendering", progress: 85, delay: 20000 },
        { status: "rendering", progress: 90, delay: 30000 },
      ];
      stages.forEach(({ status, progress, delay }) => {
        const t = setTimeout(() => {
          setQueue((prev) =>
            prev.map((q) => (q.id === itemId ? { ...q, status, progress } : q))
          );
        }, delay);
        timerRefs.current.push(t);
      });

      // Fire API call in background and capture result
      fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: item.script,
          videoType: item.videoType,
          config: item.config,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          // Clear fake progress timers
          timerRefs.current.forEach(t => clearTimeout(t));
          timerRefs.current = [];
          if (res.ok && data.success) {
            // Only NOW set status to 'done' with the REAL videoUrl
            setQueue((prev) =>
              prev.map((q) =>
                q.id === itemId
                  ? { ...q, status: "done" as const, progress: 100, videoUrl: data.videoUrl || undefined, voiceUrl: data.voiceUrl || undefined, remoteVideoUrl: data.remoteVideoUrl || undefined }
                  : q
              )
            );
          } else {
            setQueue((prev) =>
              prev.map((q) =>
                q.id === itemId
                  ? { ...q, errorMessage: data.error || "Production failed", status: "error" as const, progress: 0 }
                  : q
              )
            );
          }
        })
        .catch((err) => {
          console.error("Production API:", err);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === itemId
                ? { ...q, errorMessage: (err as Error).message, status: "error" as const, progress: 0 }
                : q
            )
          );
        });
    } catch (err) {
      console.error("Production failed:", err);
      setQueue((prev) =>
        prev.map((q) => (q.id === itemId ? { ...q, status: "error" as const } : q))
      );
    }
  };

  const exportItem = async (itemId: string, destination: string) => {
    const item = queue.find((q) => q.id === itemId);
    if (!item) return;
    setSendMenuId(null);

    const destLabel = EXPORT_DESTINATIONS.find(d => d.id === destination)?.label || destination;
    setExportFeedback({ message: `Sending to ${destLabel}...`, success: true });

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          videoUrl: item.remoteVideoUrl || item.videoUrl || "",
          topic: item.topic,
          script: item.script,
          metadata: { videoType: item.videoType, config: item.config },
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || `Export failed (${res.status})`);
      }
      const data = await res.json() as { success?: boolean; message?: string };
      if (data.success === false) {
        setExportFeedback({ message: data.message || `${destLabel} not connected — add API keys in Settings`, success: false });
      } else {
        setExportFeedback({ message: data.message || `Sent to ${destLabel}!`, success: true });
      }
      timerRefs.current.push(setTimeout(() => setExportFeedback(null), 5000));
    } catch (err) {
      setExportFeedback({ message: `Export failed: ${(err as Error).message}`, success: false });
      timerRefs.current.push(setTimeout(() => setExportFeedback(null), 5000));
    }
  };

  const statusLabel = (s: QueueItem["status"]) => {
    const m: Record<string, string> = {
      configuring: "⚙️ Configuring",
      queued: "⏳ Queued",
      voice: "🎙️ Voice Gen",
      video: "🎬 Video Gen",
      rendering: "⚡ Rendering",
      done: "✅ Complete",
      error: "❌ Error",
    };
    return m[s];
  };

  const statusBadge = (s: QueueItem["status"]) => {
    const m: Record<string, string> = {
      configuring: "badge-purple",
      queued: "badge-blue",
      voice: "badge-purple",
      video: "badge-orange",
      rendering: "badge-orange",
      done: "badge-green",
      error: "badge-orange",
    };
    return m[s];
  };

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>🎬 Video Production</h2>
            <p>Configure, produce, preview, and export video content to your social queue.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <span className="badge badge-green">{queue.filter(q => q.status === "done").length} Complete</span>
            <span className="badge badge-blue">{queue.filter(q => !["done", "configuring"].includes(q.status)).length} Producing</span>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        {queue.map((item) => (
          <div key={item.id} className="card" style={{ padding: 0, marginBottom: "var(--space-6)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-1)" }}>{item.topic}</h4>
                  <span className={`badge ${statusBadge(item.status)}`} style={{ fontSize: "11px" }}>{statusLabel(item.status)}</span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  {item.status === "done" && (
                    <>
                      <button className="btn btn-secondary" onClick={() => setPreviewId(previewId === item.id ? null : item.id)}>
                        👁️ Preview
                      </button>
                      <div style={{ position: "relative" }}>
                        <button
                          className="btn btn-primary"
                          onClick={(e) => { e.stopPropagation(); setSendMenuId(sendMenuId === item.id ? null : item.id); }}
                          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                        >
                          📡 Approve & Send ▾
                        </button>
                        {sendMenuId === item.id && (
                          <div style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            right: 0,
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--space-2)",
                            minWidth: 240,
                            zIndex: 9999,
                            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                            animation: "fadeIn 0.2s ease",
                          }}>
                            <div style={{ padding: "var(--space-2) var(--space-3)", fontSize: "10px", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)", marginBottom: "var(--space-1)" }}>
                              Send to connected platform:
                            </div>
                            {EXPORT_DESTINATIONS.map((dest) => (
                              <button
                                key={dest.id}
                                className="btn btn-ghost"
                                onClick={(e) => { e.stopPropagation(); exportItem(item.id, dest.id); }}
                                style={{
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  padding: "var(--space-3) var(--space-4)",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "var(--text-sm)",
                                  display: "flex",
                                  gap: "var(--space-2)",
                                }}
                              >
                                <span>{dest.label}</span>
                                <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{dest.desc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.videoUrl && (
                        <a
                          href={item.remoteVideoUrl || item.videoUrl}
                          download={`content-forge-${item.id}.mp4`}
                          target="_blank"
                          rel="noopener"
                          className="btn btn-ghost"
                          style={{ textDecoration: "none" }}
                        >
                          📥 Download
                        </a>
                      )}
                    </>
                  )}
                  {item.status === "configuring" && item.videoType && item.config && (
                    <button className="btn btn-primary" onClick={() => startProduction(item.id)}>
                      ▶ Start Production
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Player */}
            {previewId === item.id && item.status === "done" && (
              <div style={{
                padding: "var(--space-6)",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-primary)",
              }}>
                {item.videoUrl && (item.videoUrl.startsWith("/videos/") || item.videoUrl.startsWith("http")) ? (
                  /* Real video player — constrained to reasonable size */
                  <div style={{ maxWidth: 320, maxHeight: 480, margin: "0 auto" }}>
                    <video
                      controls
                      autoPlay
                      playsInline
                      style={{
                        width: "100%",
                        maxHeight: 420,
                        borderRadius: "var(--radius-md)",
                        background: "#000",
                        objectFit: "contain",
                      }}
                      src={item.videoUrl}
                    />
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginTop: "var(--space-3)", fontSize: "var(--text-xs)", color: "var(--text-muted)",
                    }}>
                      <span>✅ Generated via {item.videoType === "ai-clone" ? "HeyGen" : "Veo 3"}</span>
                      <a
                        href={item.remoteVideoUrl || item.videoUrl}
                        download={`content-forge-${item.id}.mp4`}
                        target="_blank"
                        rel="noopener"
                        style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}
                      >
                        📥 Download MP4
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Fallback: status card */
                  <div style={{
                    background: "#000",
                    borderRadius: "var(--radius-md)",
                    aspectRatio: "16/9",
                    maxWidth: 640,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(135deg, rgba(255,107,44,0.15), rgba(212,168,67,0.1))",
                    }} />
                    <div style={{ textAlign: "center", zIndex: 1, padding: "var(--space-4)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>🎬</div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontWeight: 600 }}>
                        Production complete
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                        {item.videoUrl ? `Video: ${item.videoUrl}` : "Awaiting video render..."}
                      </p>
                      {item.voiceUrl && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--accent-green)", marginTop: "var(--space-1)" }}>
                          🎙️ Voice: {item.voiceUrl.startsWith("elevenlabs://") ? "Generated via ElevenLabs" : item.voiceUrl}
                        </p>
                      )}
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                        {item.videoType === "ai-clone" ? "🧑‍💼 AI Clone • HeyGen" : "🎥 UGC • Veo 3 + ElevenLabs"}
                      </p>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", marginTop: "var(--space-4)", flexWrap: "wrap" }}>
                  {EXPORT_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.id}
                      className="btn btn-secondary"
                      onClick={() => exportItem(item.id, dest.id)}
                      style={{ fontSize: "var(--text-sm)" }}
                    >
                      ✅ Approve & Send → {dest.label}
                    </button>
                  ))}
                  <button className="btn btn-ghost" style={{ color: "var(--accent-red)" }} onClick={() => { setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "configuring" as const, progress: 0, videoUrl: undefined, remoteVideoUrl: undefined, voiceUrl: undefined } : q)); setTimeout(() => startProduction(item.id), 200); }}>🔄 Re-generate</button>
                </div>
              </div>
            )}

            {/* Video Type Selection */}
            {item.status === "configuring" && !item.videoType && (
              <div style={{ padding: "var(--space-8)" }}>
                <h3 style={{ textAlign: "center", marginBottom: "var(--space-6)", fontSize: "var(--text-lg)" }}>
                  Choose Video Type
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", maxWidth: 600, margin: "0 auto" }}>
                  <div className="action-card" onClick={() => selectVideoType(item.id, "ai-clone")} style={{ padding: "var(--space-6)", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>🧑‍💼</div>
                    <h3 style={{ fontSize: "var(--text-base)" }}>AI Clone</h3>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                      Your avatar speaks with your voice
                    </p>
                    <span className="badge badge-purple" style={{ marginTop: "var(--space-2)" }}>HeyGen</span>
                  </div>
                  <div className="action-card" onClick={() => selectVideoType(item.id, "ugc")} style={{ padding: "var(--space-6)", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>🎥</div>
                    <h3 style={{ fontSize: "var(--text-base)" }}>UGC Creator</h3>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                      Choose gender, age, accent, style
                    </p>
                    <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "center", marginTop: "var(--space-2)" }}>
                      <span className="badge badge-blue">Veo 3</span>
                      <span className="badge badge-green">ElevenLabs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configuration Panel */}
            {item.status === "configuring" && item.videoType && item.config && (
              <div style={{ padding: "var(--space-6)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
                  {/* Left Column */}
                  <div>
                    {/* AI Clone: Avatar Selection */}
                    {item.videoType === "ai-clone" && (
                      <div style={{ marginBottom: "var(--space-5)" }}>
                        <label className="form-label">🧑‍💼 Avatar</label>
                        <OptionGrid cols={2}>
                          {HEYGEN_AVATARS.map((av) => (
                            <OptionButton
                              key={av.id}
                              selected={(item.config as CloneConfig).avatarId === av.id}
                              onClick={() => updateConfig(item.id, { avatarId: av.id, avatarName: av.name })}
                            >
                              <span style={{ fontSize: "1.3rem" }}>{av.thumb}</span>
                              <div style={{ fontSize: "var(--text-xs)", marginTop: 2 }}>{av.name}</div>
                            </OptionButton>
                          ))}
                        </OptionGrid>
                      </div>
                    )}

                    {/* UGC: Gender */}
                    {item.videoType === "ugc" && (
                      <>
                        <div style={{ marginBottom: "var(--space-5)" }}>
                          <label className="form-label">👤 Gender</label>
                          <OptionGrid cols={3}>
                            {UGC_GENDERS.map((g) => (
                              <OptionButton
                                key={g.id}
                                selected={(item.config as UGCConfig).gender === g.id}
                                onClick={() => updateConfig(item.id, { gender: g.id as UGCConfig["gender"] })}
                              >
                                {g.icon} {g.label}
                              </OptionButton>
                            ))}
                          </OptionGrid>
                        </div>

                        <div style={{ marginBottom: "var(--space-5)" }}>
                          <label className="form-label">🎂 Age Range</label>
                          <OptionGrid cols={4}>
                            {UGC_AGES.map((a) => (
                              <OptionButton
                                key={a.id}
                                selected={(item.config as UGCConfig).ageRange === a.id}
                                onClick={() => updateConfig(item.id, { ageRange: a.id as UGCConfig["ageRange"] })}
                              >
                                {a.label}
                              </OptionButton>
                            ))}
                          </OptionGrid>
                        </div>

                        <div style={{ marginBottom: "var(--space-5)" }}>
                          <label className="form-label">🗣️ Accent</label>
                          <OptionGrid cols={3}>
                            {UGC_ACCENTS.map((ac) => (
                              <OptionButton
                                key={ac.id}
                                selected={(item.config as UGCConfig).accent === ac.id}
                                onClick={() => updateConfig(item.id, { accent: ac.id as UGCConfig["accent"] })}
                              >
                                {ac.label}
                              </OptionButton>
                            ))}
                          </OptionGrid>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column — Shared Controls */}
                  <div>
                    {/* Video Format */}
                    <div style={{ marginBottom: "var(--space-5)" }}>
                      <label className="form-label">🎥 Video Format</label>
                      <OptionGrid cols={2}>
                        {VIDEO_FORMATS.map((vf) => (
                          <OptionButton
                            key={vf.id}
                            selected={item.config!.videoFormat === vf.id}
                            onClick={() => updateConfig(item.id, { videoFormat: vf.id as VideoConfig["videoFormat"] })}
                          >
                            <span style={{ fontSize: "1.2rem" }}>{vf.icon}</span>
                            <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginTop: 2 }}>{vf.label}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{vf.desc}</div>
                          </OptionButton>
                        ))}
                      </OptionGrid>
                    </div>

                    {/* Background */}
                    <div style={{ marginBottom: "var(--space-5)" }}>
                      <label className="form-label">🖼️ Background</label>
                      <OptionGrid cols={3}>
                        {BACKGROUNDS.map((bg) => (
                          <OptionButton
                            key={bg.id}
                            selected={item.config!.background === bg.id}
                            onClick={() => updateConfig(item.id, { background: bg.id })}
                          >
                            <div style={{
                              width: 24, height: 24,
                              borderRadius: "var(--radius-sm)",
                              background: bg.preview,
                              margin: "0 auto 4px",
                              border: "1px solid var(--border-default)",
                            }} />
                            <div style={{ fontSize: "10px" }}>{bg.label}</div>
                          </OptionButton>
                        ))}
                      </OptionGrid>
                    </div>

                    {/* Aspect Ratio */}
                    <div style={{ marginBottom: "var(--space-5)" }}>
                      <AspectRatioSelector value={item.config?.aspectRatio || "9:16"} onChange={(r) => updateConfig(item.id, { aspectRatio: r })} />
                    </div>

                    {/* B-Roll */}
                    <div style={{ marginBottom: "var(--space-5)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                        <label className="form-label" style={{ margin: 0 }}>🎞️ B-Roll Cuts</label>
                        <button
                          onClick={() => updateConfig(item.id, { bRoll: !item.config!.bRoll })}
                          style={{
                            width: 44, height: 24,
                            borderRadius: 12,
                            border: "none",
                            background: item.config!.bRoll ? "var(--accent-primary)" : "var(--bg-input)",
                            cursor: "pointer",
                            position: "relative",
                            transition: "background var(--transition-fast)",
                          }}
                        >
                          <div style={{
                            width: 18, height: 18,
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: 3,
                            left: item.config!.bRoll ? 23 : 3,
                            transition: "left var(--transition-fast)",
                          }} />
                        </button>
                      </div>

                      {item.config!.bRoll && (
                        <OptionGrid cols={4}>
                          {BROLL_STYLES.map((br) => (
                            <OptionButton
                              key={br.id}
                              selected={item.config!.bRollStyle === br.id}
                              onClick={() => updateConfig(item.id, { bRollStyle: br.id as VideoConfig["bRollStyle"] })}
                            >
                              {br.icon} {br.label}
                            </OptionButton>
                          ))}
                        </OptionGrid>
                      )}
                    </div>
                  </div>
                </div>

                {/* Config Summary + Start */}
                <div style={{
                  marginTop: "var(--space-4)",
                  padding: "var(--space-4)",
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", fontSize: "var(--text-xs)" }}>
                    <span className="badge badge-purple">
                      {item.videoType === "ai-clone" ? `🧑‍💼 ${(item.config as CloneConfig).avatarName}` : `🎥 ${(item.config as UGCConfig).gender} • ${(item.config as UGCConfig).ageRange} • ${(item.config as UGCConfig).accent}`}
                    </span>
                    <span className="badge badge-blue">
                      {VIDEO_FORMATS.find(v => v.id === item.config!.videoFormat)?.label}
                    </span>
                    <span className="badge badge-green">
                      {BACKGROUNDS.find(b => b.id === item.config!.background)?.label}
                    </span>
                    {item.config!.bRoll && (
                      <span className="badge badge-orange">
                        B-Roll: {BROLL_STYLES.find(b => b.id === item.config!.bRollStyle)?.label}
                      </span>
                    )}
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={() => startProduction(item.id)}>
                    ▶ Start Production
                  </button>
                </div>
              </div>
            )}

            {/* Production Progress */}
            {!["configuring"].includes(item.status) && (
              <div style={{ padding: "var(--space-5) var(--space-6)" }}>
                {/* Config Summary */}
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)", fontSize: "var(--text-xs)", flexWrap: "wrap" }}>
                  <span>{item.videoType === "ai-clone" ? "🧑‍💼 AI Clone" : "🎥 UGC"}</span>
                  {item.config && (
                    <>
                      <span>• {VIDEO_FORMATS.find(v => v.id === item.config!.videoFormat)?.label}</span>
                      <span>• {BACKGROUNDS.find(b => b.id === item.config!.background)?.label}</span>
                      {item.config.bRoll && <span>• B-Roll: {BROLL_STYLES.find(b => b.id === item.config!.bRollStyle)?.label}</span>}
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 6, overflow: "hidden", marginBottom: "var(--space-3)" }}>
                  <div style={{
                    height: "100%",
                    width: `${item.progress}%`,
                    background: item.status === "done"
                      ? "var(--accent-green)"
                      : "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.8s ease",
                  }} />
                </div>

                {/* Pipeline Steps */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  {[
                    { label: "Script", icon: "📝", done: item.progress > 0 },
                    { label: "Voice", icon: "🎙️", done: item.progress >= 25 },
                    { label: "Video", icon: "🎬", done: item.progress >= 55 },
                    { label: "Render", icon: "⚡", done: item.progress >= 80 },
                    { label: "Done", icon: "✅", done: item.progress >= 100 },
                  ].map((step, i) => (
                    <span key={i} style={{ color: step.done ? "var(--accent-green)" : "var(--text-muted)", fontWeight: step.done ? 600 : 400 }}>
                      {step.icon} {step.label}
                    </span>
                  ))}
                </div>

                {/* Script Preview */}
                <details style={{ marginTop: "var(--space-3)" }}>
                  <summary style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", cursor: "pointer" }}>View Script</summary>
                  <div style={{
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-3)",
                    marginTop: "var(--space-2)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    lineHeight: 1.6,
                    maxHeight: 200,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}>
                    {item.script}
                  </div>
                </details>
              </div>
            )}

            {/* Error Display */}
            {item.status === "error" && item.errorMessage && (
              <div style={{
                padding: "var(--space-5) var(--space-6)",
                background: "rgba(239, 68, 68, 0.1)",
                borderTop: "1px solid rgba(239, 68, 68, 0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                  <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#ef4444", marginBottom: "var(--space-1)" }}>
                      Production Error
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {item.errorMessage}
                    </p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => startProduction(item.id)}
                      style={{ marginTop: "var(--space-3)", fontSize: "var(--text-xs)" }}
                    >
                      🔄 Retry Production
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Export Feedback Toast */}
        {exportFeedback && (
          <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: exportFeedback.success ? "var(--accent-green)" : "#f97316",
            color: "#fff",
            padding: "var(--space-4) var(--space-6)",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "var(--text-sm)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 9999,
            animation: "slideIn 0.3s ease",
            maxWidth: 400,
          }}>
            {exportFeedback.success ? "✅" : "⚠️"} {exportFeedback.message}
          </div>
        )}

        {/* Empty State */}
        {queue.length === 0 && (
          <div className="empty-state">
            <div className="icon">🎬</div>
            <h3>No videos in production</h3>
            <p>Generate a script, then click &quot;🎬 Produce Video&quot; to send it here. Configure your avatar, background, format, and B-Roll — then start production.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ProductionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductionContent />
    </Suspense>
  );
}
