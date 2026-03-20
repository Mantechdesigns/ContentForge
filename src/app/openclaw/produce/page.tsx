"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../../components/AppShell";
import VoiceInput from "../../components/VoiceInput";
import AspectRatioSelector, { ApiKeyNotice } from "../../components/AspectRatioSelector";

/* ───── Types ───── */
type ContentType = "video" | "image" | "carousel";
type ContentStyle = "talking-head" | "broll" | "cinematic" | "ugc";

function ProducerContent() {
  const [contentType, setContentType] = useState<ContentType>("video");
  const [style, setStyle] = useState<ContentStyle>("talking-head");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [prompt, setPrompt] = useState("");
  const [producing, setProducing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchCount, setBatchCount] = useState(3);
  const [hasGoogleKey, setHasGoogleKey] = useState(true);
  const searchParams = useSearchParams();
  const initialPromptSet = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/check-keys", { signal: ac.signal }).then(r => { if (r.ok) return r.json(); throw new Error(); }).then(d => setHasGoogleKey(!!d.google)).catch(() => {});
    return () => ac.abort();
  }, []);

  // Accept prompt from URL query (e.g. from Viral Intelligence 🦀 button)
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt && !initialPromptSet.current) {
      setPrompt(urlPrompt);
      initialPromptSet.current = true;
    }
  }, [searchParams]);

  const startProduction = () => {
    if (!prompt.trim()) return;
    setProducing(true);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(intervalRef.current!); setTimeout(() => setProducing(false), 500); return 100; }
        return prev + Math.random() * 15;
      });
    }, 800);
  };

  return (
    <AppShell>
      <div className="page-header">
        <h2>🎬 AI Producer</h2>
        <p>Tell OpenClaw what to create — it handles research, scripting, production, and export.</p>
      </div>

      <div className="page-body fade-in">
        {!hasGoogleKey && <ApiKeyNotice service="Google Gemini" />}
        {/* Content Type */}
        <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-5)" }}>
          <label className="form-label">What do you want to create?</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            {[
              { id: "video" as ContentType, icon: "🎬", label: "Video", desc: "Reels, Shorts, TikToks" },
              { id: "image" as ContentType, icon: "🖼️", label: "Image", desc: "Social posts, ads, banners" },
              { id: "carousel" as ContentType, icon: "📸", label: "Carousel", desc: "Multi-slide carousels" },
            ].map(ct => (
              <button
                key={ct.id}
                onClick={() => setContentType(ct.id)}
                style={{
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${contentType === ct.id ? "#06b6d4" : "var(--border-default)"}`,
                  background: contentType === ct.id ? "rgba(6, 182, 212, 0.1)" : "var(--bg-input)",
                  color: "var(--text-primary)", cursor: "pointer", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 4 }}>{ct.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{ct.label}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{ct.desc}</div>
              </button>
            ))}
          </div>

          {/* Style — video only */}
          {contentType === "video" && (
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label">Video Style</label>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {[
                  { id: "talking-head" as ContentStyle, label: "🗣️ Talking Head" },
                  { id: "broll" as ContentStyle, label: "🎞️ B-Roll Overlay" },
                  { id: "cinematic" as ContentStyle, label: "🎬 Cinematic" },
                  { id: "ugc" as ContentStyle, label: "👤 UGC Style" },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`modifier-tag ${style === s.id ? "active" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aspect Ratio — for video and carousel */}
          {(contentType === "video" || contentType === "carousel") && (
            <div style={{ marginBottom: "var(--space-5)" }}>
              <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
            </div>
          )}

          <div style={{ marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <label className="form-label" style={{ margin: 0 }}>Describe what you want (or let AI decide)</label>
              <VoiceInput onTranscript={(text) => setPrompt((prev) => prev ? prev + " " + text : text)} size="sm" />
            </div>
            <textarea
              className="form-input"
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={`e.g. "Create a video about why 90% of businesses leak profit, use my BRR framework, target agency owners" — or click 🎤 above to speak${contentType === "carousel" ? "\n\nor \"Make a 5-slide carousel about scaling past $500K\"" : ""}`}
              style={{ resize: "vertical", display: "block", width: "100%" }}
            />
          </div>

          {/* Batch Size + Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Create:</span>
              {[1, 3, 5, 7].map(n => (
                <button
                  key={n}
                  onClick={() => setBatchCount(n)}
                  style={{
                    width: 32, height: 32, borderRadius: "var(--radius-sm)",
                    border: `2px solid ${batchCount === n ? "#06b6d4" : "var(--border-default)"}`,
                    background: batchCount === n ? "rgba(6, 182, 212, 0.2)" : "var(--bg-input)",
                    color: batchCount === n ? "#06b6d4" : "var(--text-primary)",
                    fontWeight: 700, cursor: "pointer", fontSize: "var(--text-xs)",
                  }}
                >{n}</button>
              ))}
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{contentType === "video" ? "video(s)" : contentType === "carousel" ? "carousel(s)" : "image(s)"}</span>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button className="btn btn-secondary" onClick={startProduction} disabled={producing}>
                🧠 Let AI Decide Topic
              </button>
              <button className="btn btn-primary" onClick={startProduction} disabled={producing} style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
                🦀 Produce Now
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        {producing && (
          <div className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#06b6d4", marginBottom: 6 }}>
              <span>🦀 OpenClaw is producing {batchCount} {contentType}(s)...</span>
              <span>{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(100, progress)}%`,
                background: "linear-gradient(90deg, #06b6d4, #0891b2)",
                borderRadius: "var(--radius-full)", transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ marginTop: "var(--space-3)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {progress < 30 ? "🔍 Researching trending topics..." :
               progress < 60 ? "📝 Writing scripts..." :
               progress < 85 ? "🎬 Rendering content..." :
               "📤 Exporting to Content Vault..."}
            </div>
          </div>
        )}

        {/* Output Preview */}
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>📂 Recent Productions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
            {[
              { title: "Profit Leak Audit Reel", type: "🎬 Video", platform: "📱 TikTok", time: "2 min ago", status: "ready" },
              { title: "5 Revenue Leaks Carousel", type: "📸 Carousel", platform: "📸 Instagram", time: "15 min ago", status: "ready" },
              { title: "BRR Accelerator Banner", type: "🖼️ Image", platform: "💼 LinkedIn", time: "30 min ago", status: "ready" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "var(--bg-input)", borderRadius: "var(--radius-md)",
                padding: "var(--space-4)", border: "1px solid var(--border-subtle)",
              }}>
                <div style={{
                  width: "100%", height: 120, background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(8, 145, 178, 0.05))",
                  borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem", marginBottom: "var(--space-3)",
                }}>
                  {item.type.split(" ")[0]}
                </div>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
                  <span>{item.platform}</span>
                  <span>{item.time}</span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: "var(--space-1)", fontSize: "var(--text-xs)" }}>👁️ Preview</button>
                  <button className="btn btn-primary" style={{ flex: 1, padding: "var(--space-1)", fontSize: "var(--text-xs)", background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>📤 Export</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function OpenClawProducer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProducerContent />
    </Suspense>
  );
}
