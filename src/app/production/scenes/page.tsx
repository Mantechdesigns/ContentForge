"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import VoiceInput from "../../components/VoiceInput";

/* ───── Types ───── */
interface Scene {
  id: string;
  description: string;
  emotion: string;
  dialogue: string;
  camera: string;
  setting: string;
  referenceImage: string | null; // base64
  referencePreview: string | null; // data URL for preview
}

type DurationPreset = "30" | "45" | "60" | "custom";

const EMOTIONS = [
  { id: "confident", label: "💪 Confident", desc: "Strong, assured delivery" },
  { id: "intense", label: "🔥 Intense", desc: "Passionate, urgent energy" },
  { id: "bold", label: "⚡ Bold", desc: "Direct, powerful statements" },
  { id: "calm", label: "🧘 Calm", desc: "Steady, composed presence" },
  { id: "excited", label: "🎉 Excited", desc: "High energy, enthusiasm" },
  { id: "sad", label: "😔 Sad", desc: "Emotional, vulnerable moment" },
  { id: "urgent", label: "🚨 Urgent", desc: "Time-sensitive, pressing" },
  { id: "inspirational", label: "✨ Inspirational", desc: "Uplifting, motivational" },
];

const CAMERAS = [
  { id: "close-up", label: "Close-up", desc: "Face fills frame" },
  { id: "medium", label: "Medium", desc: "Waist up" },
  { id: "wide", label: "Wide", desc: "Full body + environment" },
  { id: "over-shoulder", label: "Over Shoulder", desc: "Behind speaker" },
  { id: "broll", label: "B-Roll Only", desc: "No person, visuals only" },
];

const SETTINGS = [
  { id: "studio", label: "🎙️ Dark Studio" },
  { id: "office", label: "🏢 Modern Office" },
  { id: "outdoor", label: "🌅 Outdoor" },
  { id: "minimal", label: "⬜ Minimal White" },
  { id: "custom", label: "✏️ Custom" },
];

function createScene(): Scene {
  return {
    id: String(Date.now()) + Math.random().toString(36).slice(2, 5),
    description: "",
    emotion: "confident",
    dialogue: "",
    camera: "medium",
    setting: "studio",
    referenceImage: null,
    referencePreview: null,
  };
}

function scenesForPreset(preset: DurationPreset): number {
  if (preset === "30") return 4;
  if (preset === "45") return 6;
  if (preset === "60") return 8;
  return 1;
}

export default function SceneEditorPage() {
  const [scenes, setScenes] = useState<Scene[]>([createScene()]);
  const [preset, setPreset] = useState<DurationPreset>("30");
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [results, setResults] = useState<Record<string, string[]>>({}); // sceneId -> videoUrls[]
  const [selectedVideos, setSelectedVideos] = useState<Record<string, number>>({}); // sceneId -> picked index
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const router = useRouter();

  const totalDuration = scenes.length * 8;
  const totalScenes = scenes.length;

  /* ───── Scene Management ───── */
  const addScene = () => setScenes((prev) => [...prev, createScene()]);
  const removeScene = (id: string) => setScenes((prev) => prev.filter((s) => s.id !== id));
  const updateScene = (id: string, updates: Partial<Scene>) =>
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  const moveScene = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= scenes.length) return;
    setScenes((prev) => {
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const applyPreset = (p: DurationPreset) => {
    setPreset(p);
    const count = scenesForPreset(p);
    if (scenes.length < count) {
      const toAdd = count - scenes.length;
      setScenes((prev) => [...prev, ...Array.from({ length: toAdd }, () => createScene())]);
    }
  };

  /* ───── Reference Image Upload ───── */
  const handleImageUpload = (sceneId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      updateScene(sceneId, { referenceImage: base64, referencePreview: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  /* ───── Generate All Scenes ───── */
  const generateAllScenes = async () => {
    if (generating) return;
    setGenerating(true);
    setGenerationProgress(0);
    setResults({});
    setSelectedVideos({});

    const newResults: Record<string, string[]> = {};

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      setProgressLabel(`🎬 Scene ${i + 1}/${scenes.length}: Generating 4 variations...`);
      setGenerationProgress(((i) / scenes.length) * 100);

      try {
        const res = await fetch("/api/produce/scene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scene: {
              description: scene.description,
              emotion: scene.emotion,
              dialogue: scene.dialogue,
              camera: scene.camera,
              setting: scene.setting,
              referenceImage: scene.referenceImage,
            },
            sampleCount: 4,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          console.error(`Scene ${i + 1} failed:`, data.error);
          newResults[scene.id] = [];
          continue;
        }

        const data = await res.json();
        newResults[scene.id] = data.videos || [];
      } catch (err) {
        console.error(`Scene ${i + 1} error:`, err);
        newResults[scene.id] = [];
      }
    }

    setResults(newResults);
    setGenerationProgress(100);
    setProgressLabel("✅ All scenes generated!");
    setGenerating(false);

    // Auto-select first video for each scene
    const autoSelect: Record<string, number> = {};
    for (const [id, urls] of Object.entries(newResults)) {
      if (urls.length > 0) autoSelect[id] = 0;
    }
    setSelectedVideos(autoSelect);
  };

  /* ───── Stitch Selected Scenes ───── */
  const stitchAndDownload = async () => {
    const videoUrls: string[] = [];
    for (const scene of scenes) {
      const picked = selectedVideos[scene.id];
      const sceneVideos = results[scene.id] || [];
      if (picked !== undefined && sceneVideos[picked]) {
        videoUrls.push(sceneVideos[picked]);
      }
    }
    if (videoUrls.length === 0) return;

    setProgressLabel("🔗 Stitching scenes into final video...");
    setGenerating(true);

    try {
      const res = await fetch("/api/produce/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: videoUrls }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        window.open(data.videoUrl, "_blank");
      }
    } catch (err) {
      console.error("Stitch failed:", err);
    } finally {
      setGenerating(false);
      setProgressLabel("");
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <h2>🎬 Scene Editor</h2>
        <p>Build your video scene-by-scene — write descriptions, set emotions, upload your face, and generate 4 variations per scene</p>
      </div>

      <div className="page-body fade-in">
        {/* Duration Presets + Stats */}
        <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {(["30", "45", "60", "custom"] as DurationPreset[]).map((p) => (
              <button
                key={p}
                className={`btn ${preset === p ? "btn-primary" : "btn-secondary"}`}
                onClick={() => applyPreset(p)}
                style={{
                  fontSize: "var(--text-xs)",
                  background: preset === p ? "linear-gradient(135deg, #f97316, #ea580c)" : undefined,
                }}
              >
                {p === "custom" ? "✏️ Custom" : `${p}s (${scenesForPreset(p)} scenes)`}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-sm)" }}>
            <span style={{ color: "#f97316", fontWeight: 700 }}>{totalScenes} scenes</span>
            <span style={{ color: "#06b6d4", fontWeight: 700 }}>{totalDuration}s total</span>
            <span style={{ color: "var(--text-muted)" }}>8s each</span>
          </div>
        </div>

        {/* Scene Cards */}
        {scenes.map((scene, idx) => (
          <div key={scene.id} className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-4)", borderLeft: "4px solid #f97316" }}>
            {/* Scene Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                  fontSize: "var(--text-xs)",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                }}>
                  Scene {idx + 1}
                </span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {idx * 8}s – {(idx + 1) * 8}s
                </span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-1)" }}>
                <button className="btn btn-ghost" onClick={() => moveScene(idx, -1)} disabled={idx === 0} style={{ fontSize: "var(--text-xs)", padding: "2px 6px" }}>▲</button>
                <button className="btn btn-ghost" onClick={() => moveScene(idx, 1)} disabled={idx === scenes.length - 1} style={{ fontSize: "var(--text-xs)", padding: "2px 6px" }}>▼</button>
                {scenes.length > 1 && (
                  <button className="btn btn-ghost" onClick={() => removeScene(scene.id)} style={{ fontSize: "var(--text-xs)", padding: "2px 6px", color: "var(--accent-red)" }}>✕</button>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              {/* Left Column */}
              <div>
                {/* Description */}
                <label className="form-label" style={{ fontSize: "var(--text-xs)" }}>📝 Scene Description</label>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                  <textarea
                    className="form-input"
                    placeholder="Describe what's happening visually... e.g. 'Guy in dark studio, looking intensely at camera, leaning forward'"
                    value={scene.description}
                    onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                    rows={3}
                    style={{ resize: "vertical", fontSize: "var(--text-xs)" }}
                  />
                  <VoiceInput onTranscript={(t) => updateScene(scene.id, { description: scene.description ? scene.description + " " + t : t })} />
                </div>

                {/* Dialogue */}
                <label className="form-label" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>💬 Dialogue (what they say)</label>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                  <textarea
                    className="form-input"
                    placeholder={`e.g. "Listen, your logical sales pitch? It's dead. You're selling facts to emotional buyers..."`}
                    value={scene.dialogue}
                    onChange={(e) => updateScene(scene.id, { dialogue: e.target.value })}
                    rows={2}
                    style={{ resize: "vertical", fontSize: "var(--text-xs)" }}
                  />
                  <VoiceInput onTranscript={(t) => updateScene(scene.id, { dialogue: scene.dialogue ? scene.dialogue + " " + t : t })} />
                </div>

                {/* Reference Image */}
                <label className="form-label" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>📸 Reference Image (your face/style)</label>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => fileInputRefs.current[scene.id]?.click()}
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {scene.referencePreview ? "🔄 Change" : "📤 Upload"}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => { fileInputRefs.current[scene.id] = el; }}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(scene.id, file);
                    }}
                  />
                  {scene.referencePreview && (
                    <img
                      src={scene.referencePreview}
                      alt="Reference"
                      style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", objectFit: "cover", border: "2px solid #f97316" }}
                    />
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Emotion */}
                <label className="form-label" style={{ fontSize: "var(--text-xs)" }}>🎭 Emotion / Energy</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
                  {EMOTIONS.map((em) => (
                    <button
                      key={em.id}
                      className={`btn ${scene.emotion === em.id ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => updateScene(scene.id, { emotion: em.id })}
                      title={em.desc}
                      style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        background: scene.emotion === em.id ? "linear-gradient(135deg, #f97316, #ea580c)" : undefined,
                      }}
                    >
                      {em.label}
                    </button>
                  ))}
                </div>

                {/* Camera */}
                <label className="form-label" style={{ fontSize: "var(--text-xs)" }}>🎥 Camera</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
                  {CAMERAS.map((cam) => (
                    <button
                      key={cam.id}
                      className={`btn ${scene.camera === cam.id ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => updateScene(scene.id, { camera: cam.id })}
                      title={cam.desc}
                      style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        background: scene.camera === cam.id ? "rgba(6, 182, 212, 0.3)" : undefined,
                        color: scene.camera === cam.id ? "#06b6d4" : undefined,
                        border: scene.camera === cam.id ? "1px solid #06b6d4" : undefined,
                      }}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>

                {/* Setting */}
                <label className="form-label" style={{ fontSize: "var(--text-xs)" }}>🌆 Setting</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
                  {SETTINGS.map((s) => (
                    <button
                      key={s.id}
                      className={`btn ${scene.setting === s.id ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => updateScene(scene.id, { setting: s.id })}
                      style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        background: scene.setting === s.id ? "rgba(139, 92, 246, 0.3)" : undefined,
                        color: scene.setting === s.id ? "#8b5cf6" : undefined,
                        border: scene.setting === s.id ? "1px solid #8b5cf6" : undefined,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scene Results (4x generation) */}
            {results[scene.id] && results[scene.id].length > 0 && (
              <div style={{ marginTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#22c55e", marginBottom: "var(--space-2)" }}>
                  ✅ {results[scene.id].length} variations generated — pick your favorite:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-2)" }}>
                  {results[scene.id].map((url, vidIdx) => (
                    <div
                      key={vidIdx}
                      onClick={() => setSelectedVideos((prev) => ({ ...prev, [scene.id]: vidIdx }))}
                      style={{
                        border: selectedVideos[scene.id] === vidIdx ? "3px solid #f97316" : "2px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        cursor: "pointer",
                        position: "relative",
                        background: "#000",
                      }}
                    >
                      <video
                        src={url}
                        style={{ width: "100%", height: 120, objectFit: "cover" }}
                        muted
                        playsInline
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                      />
                      {selectedVideos[scene.id] === vidIdx && (
                        <div style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "#f97316",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "var(--radius-full)",
                        }}>
                          ✓ Selected
                        </div>
                      )}
                      <div style={{ fontSize: "10px", textAlign: "center", padding: 4, color: "var(--text-muted)" }}>
                        Take {vidIdx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Scene */}
        <button
          className="btn btn-secondary"
          onClick={addScene}
          style={{ width: "100%", padding: "var(--space-4)", fontSize: "var(--text-sm)", marginBottom: "var(--space-5)" }}
        >
          ＋ Add Scene
        </button>

        {/* Generation Progress */}
        {generating && (
          <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#f97316", marginBottom: 6 }}>
              <span>{progressLabel}</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <div style={{ background: "var(--bg-input)", borderRadius: "var(--radius-full)", height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${generationProgress}%`,
                background: "linear-gradient(90deg, #f97316, #ea580c, #ef4444)",
                borderRadius: "var(--radius-full)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <button
            className="btn btn-primary"
            onClick={generateAllScenes}
            disabled={generating || scenes.every((s) => !s.description && !s.dialogue)}
            style={{
              flex: 1,
              padding: "var(--space-4)",
              fontSize: "var(--text-md)",
              fontWeight: 700,
              background: !generating ? "linear-gradient(135deg, #f97316, #ea580c)" : "var(--bg-input)",
            }}
          >
            {generating ? "🎬 Generating..." : `🎬 Generate All ${totalScenes} Scenes (4x each)`}
          </button>

          {Object.keys(results).length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={stitchAndDownload}
              disabled={generating || Object.keys(selectedVideos).length === 0}
              style={{ padding: "var(--space-4)", fontSize: "var(--text-md)", fontWeight: 700 }}
            >
              🔗 Stitch & Download ({totalDuration}s video)
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
