"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import VoiceInput from "../components/VoiceInput";

interface ViralIdea {
  title: string;
  hook: string;
  angle: string;
  viralScore: number;
  category: string;
}

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

function ContextSelector({ label, icon, options, value, locked, onSelect, onToggleLock }: {
  label: string; icon: string;
  options: { id: string; label: string }[];
  value: string; locked: boolean;
  onSelect: (id: string) => void; onToggleLock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: 4 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{icon} {label}</span>
        <button onClick={onToggleLock} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: 0 }} title={locked ? "Unlock" : "Lock"}>
          {locked ? "🔒" : "🔓"}
        </button>
      </div>
      <button
        onClick={() => !locked && setOpen(!open)}
        style={{
          width: "100%", padding: "var(--space-2) var(--space-3)",
          background: locked ? "var(--accent-primary-glow)" : "var(--bg-input)",
          border: `1px solid ${locked ? "var(--accent-primary)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
          fontSize: "var(--text-xs)", cursor: locked ? "default" : "pointer",
          textAlign: "left", fontWeight: locked ? 600 : 400,
        }}
      >
        {selected?.label || "Select..."} {!locked && "▾"}
      </button>
      {open && !locked && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 2,
          background: "var(--bg-secondary)", border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)", zIndex: 50, boxShadow: "var(--shadow-lg)",
          maxHeight: 200, overflow: "auto",
        }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => { onSelect(opt.id); setOpen(false); }}
              style={{
                width: "100%", padding: "var(--space-2) var(--space-3)",
                background: opt.id === value ? "var(--accent-primary-glow)" : "transparent",
                border: "none", color: "var(--text-primary)", fontSize: "var(--text-xs)",
                cursor: "pointer", textAlign: "left",
              }}
            >{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

const QUICK_TOPICS = [
  { label: "🏢 From My Brand", topic: "Business resilience, profit optimization, and scaling systems for $500K-$5M business owners — BRR by ManTech Designs" },
  { label: "💰 From My Offers", topic: "Profit Leak Audit, BRR Digital Flipbook, and BRR Accelerator program for business owners who want to scale to $100K/month" },
  { label: "🎯 From My ICP", topic: "Content for business owners doing $500K-$5M/year who are burnt out, leaking profit, and stuck working IN the business instead of ON it" },
  { label: "🔥 Trending in My Niche", topic: "Trending business coaching, entrepreneurship, and profit scaling content that's going viral right now" },
];

export default function ResearchPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ViralIdea[]>([]);

  // Context bar state
  const [avatar, setAvatar] = useState("brr-founder");
  const [icp, setIcp] = useState("brr-icp");
  const [framework, setFramework] = useState("mantech-master");
  const [offer, setOffer] = useState("profit-audit");
  const [locks, setLocks] = useState({ avatar: true, icp: true, framework: true, offer: false });
  const toggleLock = (key: keyof typeof locks) => setLocks(prev => ({ ...prev, [key]: !prev[key] }));

  const handleGenerate = async (customTopic?: string) => {
    const t = customTopic || topic;
    if (!t.trim()) return;
    if (customTopic) setTopic(customTopic);
    setLoading(true);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Research failed" }));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (data.ideas) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error("Research failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const goToScript = (idea: ViralIdea) => {
    const params = new URLSearchParams({ topic: idea.title, hook: idea.hook });
    router.push(`/scripts?${params.toString()}`);
  };

  const scoreClass = (score: number) =>
    score >= 8 ? "score-high" : score >= 5 ? "score-medium" : "score-low";

  return (
    <AppShell>
      <div className="page-header">
        <h2>🔍 Research Engine</h2>
        <p>Generate 30 viral content ideas from any topic. Powered by AI intelligence.</p>
      </div>

      {/* Context Bar — Lockable selectors */}
      <div style={{
        display: "flex", gap: "var(--space-4)",
        padding: "var(--space-4) var(--space-5)",
        background: "var(--bg-secondary)", borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)", marginBottom: "var(--space-6)",
      }}>
        <ContextSelector label="Avatar" icon="👤" options={AVATARS} value={avatar} locked={locks.avatar} onSelect={setAvatar} onToggleLock={() => toggleLock("avatar")} />
        <ContextSelector label="ICP" icon="🎯" options={ICPS} value={icp} locked={locks.icp} onSelect={setIcp} onToggleLock={() => toggleLock("icp")} />
        <ContextSelector label="Framework" icon="📚" options={FRAMEWORKS} value={framework} locked={locks.framework} onSelect={setFramework} onToggleLock={() => toggleLock("framework")} />
        <ContextSelector label="Offer" icon="💰" options={OFFERS} value={offer} locked={locks.offer} onSelect={setOffer} onToggleLock={() => toggleLock("offer")} />
      </div>

      <div className="page-body fade-in">
        {/* Quick Generate Buttons */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <label className="form-label" style={{ marginBottom: "var(--space-3)", display: "block" }}>⚡ Quick Generate</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
            {QUICK_TOPICS.map((qt, i) => (
              <button
                key={i}
                className="btn btn-secondary"
                onClick={() => handleGenerate(qt.topic)}
                disabled={loading}
                style={{ padding: "var(--space-4)", fontSize: "var(--text-sm)", justifyContent: "center" }}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="card" style={{ marginBottom: "var(--space-8)" }}>
          <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
            <label className="form-label">Custom Topic or Niche</label>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <input
                id="research-topic"
                className="form-input"
                type="text"
                placeholder='e.g. "Business resilience" or click 🎤 to speak'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                style={{ flex: 1 }}
              />
              <VoiceInput onTranscript={(text) => setTopic((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <button
              id="generate-ideas-btn"
              className="btn btn-primary btn-lg"
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              style={{ opacity: loading || !topic.trim() ? 0.6 : 1 }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Generating...
                </>
              ) : (
                <>🧠 Generate 30 Viral Ideas</>
              )}
            </button>

            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Uses GPT-4o • ~30 seconds
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ marginBottom: "var(--space-6)" }}>
            <div className="loading-bar" />
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "var(--space-3)", textAlign: "center" }}>
              Researching trends, analyzing competition, scoring viral potential...
            </p>
          </div>
        )}

        {/* Results */}
        {ideas.length > 0 && !loading && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>
                {ideas.length} Viral Ideas Generated
              </h3>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <span className="badge badge-green">{ideas.filter(i => i.viralScore >= 8).length} High</span>
                <span className="badge badge-orange">{ideas.filter(i => i.viralScore >= 5 && i.viralScore < 8).length} Medium</span>
              </div>
            </div>

            <div className="card-grid">
              {ideas.map((idea, i) => (
                <div key={i} className="idea-card slide-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                    <span className="badge badge-blue" style={{ fontSize: "10px" }}>{idea.category}</span>
                    <span className={`idea-score ${scoreClass(idea.viralScore)}`}>
                      {idea.viralScore}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)", lineHeight: 1.4 }}>
                    {idea.title}
                  </h4>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-3)", lineHeight: 1.5 }}>
                    {idea.hook}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{idea.angle}</span>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: "var(--text-xs)", padding: "2px 8px" }}
                      onClick={() => goToScript(idea)}
                    >
                      → Script
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {ideas.length === 0 && !loading && (
          <div className="empty-state">
            <div className="icon">🧠</div>
            <h3>No ideas yet</h3>
            <p>Use a quick-generate button above or enter a custom topic. The AI will research trends, analyze competition, and generate 30 viral content ideas with scores.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
