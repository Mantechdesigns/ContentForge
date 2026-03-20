"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../../components/AppShell";
import VoiceInput from "../../components/VoiceInput";
import VideoBreakdown from "../../components/VideoBreakdown";

function BreakdownContent() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialUrlSet = useRef(false);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Accept URL from query param (from Viral Intelligence page)
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && !initialUrlSet.current) {
      initialUrlSet.current = true;
      setUrl(urlParam);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    setProgressLabel("🔗 Fetching video...");
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        const next = p + Math.random() * 10;
        if (next > 20 && next < 45) setProgressLabel("📝 Extracting transcript...");
        if (next > 45 && next < 70) setProgressLabel("🧠 Gemini analyzing framework...");
        if (next > 70) setProgressLabel("⚡ Building your script...");
        return next;
      });
    }, 800);

    try {
      const res = await fetch("/api/analyze/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setProgress(100);
      setProgressLabel("✅ Complete!");
      setResult(data);
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMyVersion = (script: string) => {
    router.push(`/scripts?topic=${encodeURIComponent(script.substring(0, 500))}`);
  };

  return (
    <AppShell>
      <div className="page-header">
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            marginBottom: "var(--space-3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f97316";
            e.currentTarget.style.borderColor = "#f97316";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          ← Back
        </button>
        <h2>🔬 Video Breakdown</h2>
        <p>Paste any video URL — extract the transcript, reverse-engineer the framework, and create your version</p>
      </div>

      <div className="page-body fade-in">
        {/* URL Input */}
        <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-5)" }}>
          <label className="form-label">Video URL</label>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <input
              className="form-input"
              type="url"
              placeholder="https://youtube.com/watch?v=... or TikTok/Instagram URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              style={{ flex: 1 }}
            />
            <VoiceInput onTranscript={(t) => setUrl((p) => p ? p + " " + t : t)} />
          </div>

          {/* Supported Platforms */}
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            {["▶️ YouTube", "📱 TikTok", "📸 Instagram"].map((p) => (
              <span key={p} style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                background: "var(--bg-input)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={!url.trim() || loading}
          style={{
            width: "100%",
            padding: "var(--space-4)",
            fontSize: "var(--text-md)",
            fontWeight: 700,
            background: url.trim() && !loading ? "linear-gradient(135deg, #f97316, #ea580c)" : "var(--bg-input)",
            opacity: !url.trim() || loading ? 0.6 : 1,
            marginBottom: "var(--space-5)",
          }}
        >
          {loading ? "🔬 Analyzing..." : "🔍 Analyze Video"}
        </button>

        {/* Progress */}
        {loading && (
          <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#f97316", marginBottom: 6 }}>
              <span>{progressLabel}</span>
              <span>{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, progress)}%`,
                background: "linear-gradient(90deg, #f97316, #ea580c, #ef4444)",
                borderRadius: "var(--radius-full)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)", border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.08)" }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>❌ {error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#f97316" }}>
                🔬 Deep Breakdown
              </h3>
              <span style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                background: "var(--bg-input)",
                padding: "var(--space-1) var(--space-3)",
                borderRadius: "var(--radius-full)",
              }}>
                {result.platform} · {result.totalDuration}s · {result.wordCount} words
              </span>
            </div>
            <VideoBreakdown data={result} onCreateMyVersion={handleCreateMyVersion} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function BreakdownPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BreakdownContent />
    </Suspense>
  );
}
