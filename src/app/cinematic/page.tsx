"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import AppShell from "../components/AppShell";
import VoiceInput from "../components/VoiceInput";
import AspectRatioSelector, { ApiKeyNotice } from "../components/AspectRatioSelector";

/* ───── Duration Options ───── */
const DURATIONS = [
  { value: 8, label: "8s", desc: "Quick Hook" },
  { value: 30, label: "30s", desc: "Short Reel" },
  { value: 60, label: "60s", desc: "Standard" },
  { value: 180, label: "3 min", desc: "Deep Dive" },
  { value: 300, label: "5 min", desc: "Full Feature" },
] as const;

/* ───── Video Styles ───── */
const STYLES = [
  { id: "cinematic", label: "🎬 Cinematic", desc: "Premium film-quality" },
  { id: "documentary", label: "📽️ Documentary", desc: "Info-driven narrative" },
  { id: "hype", label: "🔥 Hype Reel", desc: "Fast-paced energy" },
  { id: "storytelling", label: "📖 Story", desc: "Emotional arc" },
  { id: "corporate", label: "🏢 Corporate", desc: "Professional clean" },
] as const;

/* ───── Source Type ───── */
type SourceType = "url" | "text" | "file";

interface CinematicResult {
  title: string;
  narration: string;
  videoPrompt: string;
  scenes: string[];
  videoStatus: string;
  videoOperation: string | null;
  voiceoverGenerated: boolean;
}

export default function CinematicStudioPage() {
  const [sourceType, setSourceType] = useState<SourceType>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState("cinematic");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<CinematicResult | null>(null);
  const [error, setError] = useState("");
  const [hasGoogleKey, setHasGoogleKey] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const hasInput = sourceType === "url" ? url.trim().length > 0 :
    sourceType === "text" ? text.trim().length > 0 :
    file !== null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleGenerate = async () => {
    if (!hasInput || generating) return;
    setGenerating(true);
    setError("");
    setResult(null);
    setProgress(0);

    // Simulated progress while API processes
    setProgressLabel("📄 Extracting content...");
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        const next = p + Math.random() * 12;
        if (next > 25 && next < 50) setProgressLabel("🧠 Gemini is scripting...");
        if (next > 50 && next < 75) setProgressLabel("🎬 Generating with Veo 3...");
        if (next > 75) setProgressLabel("🎙️ Creating voiceover...");
        return next;
      });
    }, 1000);

    try {
      let body: FormData | string;
      let headers: HeadersInit = {};

      if (sourceType === "file" && file) {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("duration", String(duration));
        formData.append("style", style);
        body = formData;
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({
          ...(sourceType === "url" ? { url } : { text }),
          duration,
          style,
          aspectRatio,
        });
      }

      const res = await fetch("/api/generate/cinematic", {
        method: "POST",
        headers,
        body,
      });

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setProgress(100);
      setProgressLabel("✅ Complete!");

      setResult({
        title: data.script?.title || "Untitled",
        narration: data.script?.narration || "",
        videoPrompt: data.script?.videoPrompt || "",
        scenes: data.script?.scenes || [],
        videoStatus: data.video?.status || "unknown",
        videoOperation: data.video?.operation || null,
        voiceoverGenerated: !!data.voiceover?.generated,
      });
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <h2>🎥 Cinematic Studio</h2>
        <p>Turn any URL, document, or idea into a cinematic video — powered by Gemini + Veo 3</p>
      </div>

      <div className="page-body fade-in">
        {!hasGoogleKey && <ApiKeyNotice service="Google Gemini" />}
        {/* Source Input */}
        <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-5)" }}>
          {/* Source Type Tabs */}
          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
            {([
              { id: "url" as SourceType, icon: "🔗", label: "Website URL" },
              { id: "text" as SourceType, icon: "📝", label: "Paste Text" },
              { id: "file" as SourceType, icon: "📄", label: "Upload Doc" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSourceType(tab.id)}
                style={{
                  flex: 1,
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${sourceType === tab.id ? "#06b6d4" : "var(--border-default)"}`,
                  background: sourceType === tab.id ? "rgba(6, 182, 212, 0.1)" : "var(--bg-input)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: sourceType === tab.id ? 700 : 500,
                  fontSize: "var(--text-sm)",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {sourceType === "url" && (
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://example.com/article — or click 🎤 to describe it"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                <VoiceInput onTranscript={(t) => setUrl((p) => p ? p + " " + t : t)} />
              </div>
            </div>
          )}

          {/* Text Input */}
          {sourceType === "text" && (
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <label className="form-label" style={{ margin: 0 }}>Content / Ideas</label>
                <VoiceInput onTranscript={(t) => setText((p) => p ? p + " " + t : t)} size="sm" />
              </div>
              <textarea
                className="form-input"
                rows={6}
                placeholder={"Paste your article, blog post, script, or ideas here...\n\nOr click 🎤 above to speak your concept."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ resize: "vertical", display: "block", width: "100%" }}
              />
            </div>
          )}

          {/* File Upload */}
          {sourceType === "file" && (
            <div className="form-group">
              <label className="form-label">Upload Document</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "var(--space-6)",
                  border: "2px dashed var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                  background: "var(--bg-input)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx,.html"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>
                  {file ? "📄" : "📂"}
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
                  {file ? file.name : "Click to upload or drag & drop"}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "Supports .txt, .md, .pdf, .doc, .html"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Duration + Style */}
        <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-5)" }}>
          {/* Duration Selector */}
          <div style={{ marginBottom: "var(--space-5)" }}>
            <label className="form-label">Video Duration</label>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  style={{
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${duration === d.value ? "#06b6d4" : "var(--border-default)"}`,
                    background: duration === d.value ? "rgba(6, 182, 212, 0.15)" : "var(--bg-input)",
                    color: duration === d.value ? "#06b6d4" : "var(--text-primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: "var(--text-lg)" }}>{d.label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 2 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="form-label">Video Style</label>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {STYLES.map((s) => (
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

          {/* Aspect Ratio */}
          <div style={{ marginTop: "var(--space-5)" }}>
            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!hasInput || generating}
            style={{
              flex: 1,
              padding: "var(--space-4)",
              fontSize: "var(--text-md)",
              fontWeight: 700,
              background: hasInput && !generating
                ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                : "var(--bg-input)",
              opacity: !hasInput || generating ? 0.6 : 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {generating ? "🎬 Generating..." : "🎥 Generate Cinematic Video"}
          </button>
        </div>

        {/* Progress */}
        {generating && (
          <div className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#7c3aed", marginBottom: 6 }}>
              <span>{progressLabel}</span>
              <span>{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, progress)}%`,
                background: "linear-gradient(90deg, #7c3aed, #6d28d9, #06b6d4)",
                borderRadius: "var(--radius-full)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)", border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.1)" }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>❌ {error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)", color: "#7c3aed" }}>
              🎬 {result.title}
            </h3>

            {/* Status Badges */}
            <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)", flexWrap: "wrap" }}>
              <span style={{
                padding: "var(--space-1) var(--space-3)",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                background: result.videoStatus === "processing" ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
                color: result.videoStatus === "processing" ? "#f59e0b" : "#22c55e",
                border: `1px solid ${result.videoStatus === "processing" ? "rgba(245, 158, 11, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
              }}>
                {result.videoStatus === "processing" ? "⏳ Veo 3 Rendering" : "✅ Video Ready"}
              </span>
              {result.voiceoverGenerated && (
                <span style={{
                  padding: "var(--space-1) var(--space-3)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }}>
                  🎙️ Voiceover Ready
                </span>
              )}
              <span style={{
                padding: "var(--space-1) var(--space-3)",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                background: "rgba(124, 58, 237, 0.15)",
                color: "#7c3aed",
                border: "1px solid rgba(124, 58, 237, 0.3)",
              }}>
                🎥 {duration}s • {style}
              </span>
            </div>

            {/* Narration */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label">🎙️ Narration Script</label>
              <div style={{
                background: "var(--bg-input)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                maxHeight: 200,
                overflowY: "auto",
              }}>
                {result.narration}
              </div>
            </div>

            {/* Scenes */}
            {result.scenes.length > 0 && (
              <div style={{ marginBottom: "var(--space-5)" }}>
                <label className="form-label">🎬 Scenes</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {result.scenes.map((scene, i) => (
                    <div key={i} style={{
                      padding: "var(--space-3)",
                      background: "var(--bg-input)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--text-xs)",
                      borderLeft: "3px solid #7c3aed",
                    }}>
                      {scene}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(result.narration).catch(() => {})}>
                📋 Copy Script
              </button>
              <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(result.videoPrompt).catch(() => {})}>
                🎬 Copy Video Prompt
              </button>
              <button className="btn btn-primary" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                📤 Send to Production
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
