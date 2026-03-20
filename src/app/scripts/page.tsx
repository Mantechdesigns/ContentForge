"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import VoiceInput from "../components/VoiceInput";

/* ───── Context Bar Options ───── */
const AVATARS = [
  { id: "brr-founder", label: "Manny — BRR Founder" },
  { id: "agency-owner", label: "Agency Owner ($500K-$2M)" },
  { id: "ecom-ceo", label: "E-Commerce CEO" },
  { id: "coach", label: "Business Coach" },
  { id: "custom", label: "Custom Avatar" },
];

const ICPS = [
  { id: "brr-icp", label: "$500K-$5M Business Owner" },
  { id: "startup", label: "Pre-Revenue Startup Founder" },
  { id: "agency", label: "Agency Doing $50K-$500K/mo" },
  { id: "solopreneur", label: "Solopreneur / Side Hustle" },
];

const FRAMEWORKS = [
  { id: "mantech-master", label: "ManTech Master Copy" },
  { id: "brr-hooks", label: "BRR Viral Hooks" },
  { id: "brr-youtube", label: "BRR YouTube Formula" },
  { id: "brr-offers", label: "BRR Offer System" },
  { id: "mantech-3c", label: "ManTech 3 C's" },
];

const OFFERS = [
  { id: "profit-audit", label: "Profit Leak Audit" },
  { id: "brr-flipbook", label: "BRR Digital Flipbook" },
  { id: "brr-accelerator", label: "BRR Accelerator" },
  { id: "custom", label: "Custom Offer" },
];

const MODIFIERS = [
  { flag: "--clean", label: "Voiceover-ready", description: "Clean script for AI voice" },
  { flag: "--platform=tiktok", label: "TikTok", description: "Platform optimized" },
  { flag: "--platform=instagram", label: "Instagram", description: "Platform optimized" },
  { flag: "--platform=youtube", label: "YouTube Shorts", description: "Platform optimized" },
  { flag: "--multi=3", label: "3 Angles", description: "Generate 3 different perspectives" },
  { flag: "--viral-only", label: "Viral Only", description: "Only output if score ≥8" },
  { flag: "--style=story", label: "Story", description: "Narrative format" },
  { flag: "--style=contrarian", label: "Contrarian", description: "Hot take angle" },
  { flag: "--style=listicle", label: "Listicle", description: "Numbered list format" },
  { flag: "--tone=humor", label: "Humor", description: "Add comedy elements" },
  { flag: "--tone=raw", label: "Raw", description: "Unfiltered, street-smart" },
  { flag: "--tone=motivational", label: "Motivational", description: "Inspire and uplift" },
  { flag: "--length=15", label: "15s", description: "Short form" },
  { flag: "--length=30", label: "30s", description: "Standard" },
  { flag: "--length=60", label: "60s", description: "Long form" },
  { flag: "--hook-test", label: "Hook Test", description: "10 different hooks for A/B testing" },
  { flag: "--series=5", label: "5-Part Series", description: "Connected multi-part content" },
  { flag: "--convert-to=email", label: "Email CTA", description: "Optimize for email signups" },
  { flag: "--convert-to=dm", label: "DM CTA", description: "Optimize for DM conversations" },
];

/* ───── Context Selector Component ───── */
function ContextSelector({ label, icon, options, value, locked, onSelect, onToggleLock }: {
  label: string;
  icon: string;
  options: { id: string; label: string }[];
  value: string;
  locked: boolean;
  onSelect: (id: string) => void;
  onToggleLock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: 4 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{icon} {label}</span>
        <button
          onClick={onToggleLock}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: 0 }}
          title={locked ? "Unlock to change" : "Lock selection"}
        >
          {locked ? "🔒" : "🔓"}
        </button>
      </div>
      <button
        onClick={() => !locked && setOpen(!open)}
        style={{
          width: "100%",
          padding: "var(--space-2) var(--space-3)",
          background: locked ? "var(--accent-primary-glow)" : "var(--bg-input)",
          border: `1px solid ${locked ? "var(--accent-primary)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-sm)",
          color: "var(--text-primary)",
          fontSize: "var(--text-xs)",
          cursor: locked ? "default" : "pointer",
          textAlign: "left",
          fontWeight: locked ? 600 : 400,
        }}
      >
        {selected?.label || "Select..."} {!locked && "▾"}
      </button>
      {open && !locked && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: 2,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          zIndex: 50,
          boxShadow: "var(--shadow-lg)",
          maxHeight: 200,
          overflow: "auto",
        }}>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onSelect(opt.id); setOpen(false); }}
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                background: opt.id === value ? "var(--accent-primary-glow)" : "transparent",
                border: "none",
                color: "var(--text-primary)",
                fontSize: "var(--text-xs)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScriptsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [activeModifiers, setActiveModifiers] = useState<string[]>(["--clean"]);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");

  // Context bar state
  const [avatar, setAvatar] = useState("brr-founder");
  const [icp, setIcp] = useState("brr-icp");
  const [framework, setFramework] = useState("mantech-master");
  const [offer, setOffer] = useState("profit-audit");
  const [locks, setLocks] = useState({ avatar: true, icp: true, framework: true, offer: false });

  const toggleLock = (key: keyof typeof locks) => {
    setLocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const urlTopic = searchParams.get("topic");
    if (urlTopic) setTopic(urlTopic);
  }, [searchParams]);

  const toggleModifier = (flag: string) => {
    setActiveModifiers((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript("");

    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, modifiers: activeModifiers }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Script generation failed" }));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (data.script) {
        setScript(data.script);
      }
    } catch (err) {
      console.error("Script generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const commandPreview = topic.trim()
    ? `${topic} ${activeModifiers.join(" ")}`
    : "Enter a topic above...";

  return (
    <AppShell>
      <div className="page-header">
        <h2>📝 Script Generator</h2>
        <p>Create voiceover-ready viral scripts with powerful modifiers</p>
      </div>

      {/* Context Bar — Lockable selectors */}
      <div style={{
        display: "flex",
        gap: "var(--space-4)",
        padding: "var(--space-4) var(--space-5)",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        marginBottom: "var(--space-6)",
      }}>
        <ContextSelector
          label="Avatar" icon="👤"
          options={AVATARS} value={avatar}
          locked={locks.avatar}
          onSelect={setAvatar}
          onToggleLock={() => toggleLock("avatar")}
        />
        <ContextSelector
          label="ICP" icon="🎯"
          options={ICPS} value={icp}
          locked={locks.icp}
          onSelect={setIcp}
          onToggleLock={() => toggleLock("icp")}
        />
        <ContextSelector
          label="Framework" icon="📚"
          options={FRAMEWORKS} value={framework}
          locked={locks.framework}
          onSelect={setFramework}
          onToggleLock={() => toggleLock("framework")}
        />
        <ContextSelector
          label="Offer" icon="💰"
          options={OFFERS} value={offer}
          locked={locks.offer}
          onSelect={setOffer}
          onToggleLock={() => toggleLock("offer")}
        />
      </div>

      <div className="page-body fade-in">
        {/* Topic Input */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
            <label className="form-label">Topic</label>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <input
                id="script-topic"
                className="form-input"
                type="text"
                placeholder='e.g. "Why most businesses fail in year 2" or click 🎤 to speak'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                style={{ flex: 1 }}
              />
              <VoiceInput onTranscript={(text) => setTopic((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          {/* Command Preview */}
          <div style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: "var(--accent-primary)",
            marginBottom: "var(--space-4)",
          }}>
            <span style={{ color: "var(--text-muted)" }}>$ </span>
            {commandPreview}
          </div>

          {/* Modifiers */}
          <div className="form-group">
            <label className="form-label">Modifiers</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {MODIFIERS.map((mod) => (
                <button
                  key={mod.flag}
                  className={`modifier-tag ${activeModifiers.includes(mod.flag) ? "active" : ""}`}
                  onClick={() => toggleModifier(mod.flag)}
                  title={mod.description}
                >
                  {mod.flag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          <button
            id="generate-script-btn"
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            style={{ opacity: loading || !topic.trim() ? 0.6 : 1 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Generating Script...
              </>
            ) : (
              <>⚡ Generate Script</>
            )}
          </button>

          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", alignSelf: "center" }}>
            {activeModifiers.length} modifier(s) active
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ marginBottom: "var(--space-6)" }}>
            <div className="loading-bar" />
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "var(--space-3)", textAlign: "center" }}>
              Crafting viral script with AI...
            </p>
          </div>
        )}

        {/* Script Output */}
        {script && !loading && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Generated Script</h3>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const params = new URLSearchParams({ script: script.substring(0, 2000), topic });
                    router.push(`/production?${params.toString()}`);
                  }}
                >
                  🎬 Produce Video
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigator.clipboard.writeText(script).catch(() => {})}
                >
                  📋 Copy
                </button>
                <button className="btn btn-secondary">📥 Export</button>
              </div>
            </div>
            <div className="script-output">{script}</div>
          </div>
        )}

        {/* Empty State */}
        {!script && !loading && (
          <div className="empty-state">
            <div className="icon">📝</div>
            <h3>No script yet</h3>
            <p>Enter a topic, select your modifiers, and generate. The AI will create a production-ready viral script.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ScriptsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScriptsContent />
    </Suspense>
  );
}
