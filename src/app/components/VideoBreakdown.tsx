"use client";

import { useState } from "react";

/* ───── Types ───── */
interface VideoAnalysis {
  hook?: { text: string; type: string; why_it_works: string; grade: string; visual_hook: string };
  story_structure?: { framework: string; setup: string; conflict: string; resolution: string; arc_type: string };
  cta?: { text: string; type: string; placement: string; effectiveness: string };
  visual_hooks?: string[];
  pacing?: { hook_duration: string; body_duration: string; cta_duration: string; words_per_minute: number; energy_level: string; pacing_style: string };
  key_phrases?: string[];
  emotional_triggers?: string[];
  why_it_went_viral?: string;
  script_suggestion?: { title: string; hook: string; body: string; cta: string; full_script: string };
}

interface VideoBreakdownData {
  platform: string;
  totalDuration: number;
  wordCount: number;
  transcript: { text: string; start: number; duration: number }[];
  analysis: VideoAnalysis;
}

interface Props {
  data: VideoBreakdownData;
  onCreateMyVersion?: (script: string) => void;
}

/* ───── Grade Color ───── */
function gradeColor(grade: string): string {
  const g = grade?.toUpperCase().charAt(0);
  if (g === "A") return "#22c55e";
  if (g === "B") return "#06b6d4";
  if (g === "C") return "#f59e0b";
  return "#ef4444";
}

/* ───── Section Card ───── */
function Section({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-input)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-4)",
      marginBottom: "var(--space-3)",
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: "var(--space-2)", color }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

/* ───── Component ───── */
export default function VideoBreakdown({ data, onCreateMyVersion }: Props) {
  const { analysis: a, transcript, totalDuration, wordCount, platform } = data;
  const [showTranscript, setShowTranscript] = useState(false);
  const [showScript, setShowScript] = useState(false);

  return (
    <div>
      {/* Header Stats */}
      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
        {[
          { label: "Platform", value: platform, color: "#06b6d4" },
          { label: "Duration", value: `${totalDuration}s`, color: "#8b5cf6" },
          { label: "Words", value: String(wordCount), color: "#f97316" },
          { label: "WPM", value: String(a.pacing?.words_per_minute || "—"), color: "#22c55e" },
          { label: "Energy", value: a.pacing?.energy_level || "—", color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--bg-input)",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-sm)",
            textAlign: "center",
            minWidth: 70,
          }}>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Why It Went Viral */}
      {a.why_it_went_viral && (
        <div style={{
          background: "rgba(249, 115, 22, 0.08)",
          border: "1px solid rgba(249, 115, 22, 0.3)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          marginBottom: "var(--space-4)",
          fontSize: "var(--text-sm)",
          lineHeight: 1.7,
        }}>
          <span style={{ fontWeight: 700, color: "#f97316" }}>🔥 Why It Went Viral: </span>
          {a.why_it_went_viral}
        </div>
      )}

      {/* Hook Analysis */}
      {a.hook && (
        <Section icon="🪝" title="Hook Analysis" color="#f97316">
          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)", flexWrap: "wrap" }}>
            <span style={{
              background: `${gradeColor(a.hook.grade)}22`,
              color: gradeColor(a.hook.grade),
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${gradeColor(a.hook.grade)}44`,
            }}>
              Grade: {a.hook.grade}
            </span>
            <span style={{
              background: "rgba(249, 115, 22, 0.12)",
              color: "#f97316",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
            }}>
              {a.hook.type}
            </span>
          </div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 6, fontStyle: "italic" }}>
            &ldquo;{a.hook.text}&rdquo;
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong>Why it works:</strong> {a.hook.why_it_works}
          </div>
          {a.hook.visual_hook && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
              <strong>👁️ Visual:</strong> {a.hook.visual_hook}
            </div>
          )}
        </Section>
      )}

      {/* Story Structure */}
      {a.story_structure && (
        <Section icon="📖" title={`Story Structure — ${a.story_structure.framework}`} color="#8b5cf6">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {[
              { label: "Setup", text: a.story_structure.setup, icon: "📌" },
              { label: "Conflict", text: a.story_structure.conflict, icon: "⚡" },
              { label: "Resolution", text: a.story_structure.resolution, icon: "✅" },
            ].map(({ label, text, icon }) => (
              <div key={label} style={{ fontSize: "var(--text-xs)", lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{icon} {label}:</span> {text}
              </div>
            ))}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 6 }}>
            Arc: {a.story_structure.arc_type}
          </div>
        </Section>
      )}

      {/* CTA */}
      {a.cta && (
        <Section icon="📢" title="Call to Action" color="#22c55e">
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 4 }}>
            &ldquo;{a.cta.text}&rdquo;
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Type: {a.cta.type} · Placement: {a.cta.placement} · Rating: {a.cta.effectiveness}
          </div>
        </Section>
      )}

      {/* Visual Hooks */}
      {a.visual_hooks && a.visual_hooks.length > 0 && (
        <Section icon="👁️" title="Visual Hooks" color="#06b6d4">
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            {a.visual_hooks.map((v, i) => (
              <span key={i} style={{
                background: "rgba(6, 182, 212, 0.12)",
                color: "#06b6d4",
                fontSize: "10px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
              }}>
                {v}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Key Phrases */}
      {a.key_phrases && a.key_phrases.length > 0 && (
        <Section icon="💬" title="Key Phrases" color="#f59e0b">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {a.key_phrases.map((p, i) => (
              <div key={i} style={{ fontSize: "var(--text-xs)", fontStyle: "italic" }}>
                &ldquo;{p}&rdquo;
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Emotional Triggers */}
      {a.emotional_triggers && a.emotional_triggers.length > 0 && (
        <Section icon="🧠" title="Emotional Triggers" color="#ef4444">
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            {a.emotional_triggers.map((t, i) => (
              <span key={i} style={{
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                fontSize: "10px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
              }}>
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Pacing Timeline */}
      {a.pacing && (
        <Section icon="⏱️" title="Pacing Breakdown" color="#7c3aed">
          <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-xs)" }}>
            <span>🪝 Hook: {a.pacing.hook_duration}</span>
            <span>·</span>
            <span>📖 Body: {a.pacing.body_duration}</span>
            <span>·</span>
            <span>📢 CTA: {a.pacing.cta_duration}</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 4 }}>
            Style: {a.pacing.pacing_style} · {a.pacing.words_per_minute} WPM
          </div>
        </Section>
      )}

      {/* Full Transcript (collapsible) */}
      <div style={{ marginBottom: "var(--space-3)" }}>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          style={{
            background: "none", border: "none", color: "#06b6d4",
            cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 600,
            padding: "var(--space-2) 0",
          }}
        >
          {showTranscript ? "▼ Hide" : "▶ Show"} Full Transcript ({transcript.length} segments)
        </button>
        {showTranscript && (
          <div style={{
            background: "var(--bg-input)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            maxHeight: 250,
            overflowY: "auto",
            fontSize: "var(--text-xs)",
            lineHeight: 1.8,
          }}>
            {transcript.map((seg, i) => (
              <div key={i}>
                <span style={{ color: "#06b6d4", fontWeight: 600, fontFamily: "monospace", marginRight: 8 }}>
                  {Math.floor(seg.start / 60)}:{String(seg.start % 60).padStart(2, "0")}
                </span>
                {seg.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Script Suggestion */}
      {a.script_suggestion && (
        <div style={{ marginBottom: "var(--space-3)" }}>
          <button
            onClick={() => setShowScript(!showScript)}
            style={{
              background: "none", border: "none", color: "#7c3aed",
              cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 600,
              padding: "var(--space-2) 0",
            }}
          >
            {showScript ? "▼ Hide" : "▶ Show"} Your Brand Version Script
          </button>
          {showScript && (
            <div style={{
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              fontSize: "var(--text-sm)",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}>
              <div style={{ fontWeight: 700, marginBottom: "var(--space-2)", color: "#7c3aed" }}>
                {a.script_suggestion.title}
              </div>
              {a.script_suggestion.full_script}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {a.script_suggestion?.full_script && onCreateMyVersion && (
          <button
            className="btn btn-primary"
            onClick={() => { if (a.script_suggestion) onCreateMyVersion(a.script_suggestion.full_script); }}
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", fontSize: "var(--text-xs)" }}
          >
            ⚡ Create My Version
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => {
            const text = transcript.map(s => s.text).join(" ");
            navigator.clipboard.writeText(text).catch(() => {});
          }}
          style={{ fontSize: "var(--text-xs)" }}
        >
          📋 Copy Transcript
        </button>
        {a.script_suggestion?.full_script && (
          <button
            className="btn btn-secondary"
            onClick={() => { if (a.script_suggestion) navigator.clipboard.writeText(a.script_suggestion.full_script).catch(() => {}); }}
            style={{ fontSize: "var(--text-xs)" }}
          >
            📋 Copy Script
          </button>
        )}
      </div>
    </div>
  );
}
