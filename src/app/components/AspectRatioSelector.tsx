"use client";

import { useState } from "react";

type Ratio = "9:16" | "1:1" | "16:9";

interface AspectRatioSelectorProps {
  value: Ratio;
  onChange: (ratio: Ratio) => void;
}

const RATIOS: { id: Ratio; icon: string; label: string; desc: string; width: number; height: number }[] = [
  { id: "9:16", icon: "📱", label: "9:16", desc: "Vertical", width: 36, height: 64 },
  { id: "1:1", icon: "⬜", label: "1:1", desc: "Square", width: 50, height: 50 },
  { id: "16:9", icon: "🖥️", label: "16:9", desc: "Landscape", width: 64, height: 36 },
];

/**
 * AspectRatioSelector — Reusable component for selecting video aspect ratio.
 * Shows visual previews of each ratio with labels.
 */
export default function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <div>
      <label className="form-label">Aspect Ratio</label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        {RATIOS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            style={{
              flex: 1,
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${value === r.id ? "#06b6d4" : "var(--border-default)"}`,
              background: value === r.id ? "rgba(6, 182, 212, 0.12)" : "var(--bg-input)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            {/* Visual ratio preview */}
            <div style={{
              width: r.width * 0.6,
              height: r.height * 0.6,
              borderRadius: 4,
              border: `2px solid ${value === r.id ? "#06b6d4" : "var(--text-muted)"}`,
              background: value === r.id ? "rgba(6, 182, 212, 0.2)" : "transparent",
              transition: "all 0.2s ease",
            }} />
            <div style={{
              fontWeight: 700,
              fontSize: "var(--text-sm)",
              color: value === r.id ? "#06b6d4" : "var(--text-primary)",
            }}>
              {r.label}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * ApiKeyNotice — Shows a warning banner when API key is missing.
 */
export function ApiKeyNotice({ service, settingsPath = "/settings" }: { service: string; settingsPath?: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      padding: "var(--space-4)",
      marginBottom: "var(--space-5)",
      borderRadius: "var(--radius-md)",
      border: "1px solid rgba(245, 158, 11, 0.4)",
      background: "rgba(245, 158, 11, 0.08)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
    }}>
      <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>🔑</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "#f59e0b", marginBottom: 2 }}>
          {service} API Key Required
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          Add your {service} API key in{" "}
          <a href={settingsPath} style={{ color: "#06b6d4", textDecoration: "underline" }}>Settings</a>{" "}
          to use this feature. Each user uses their own key — your data stays private.
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none", border: "none", color: "var(--text-muted)",
          cursor: "pointer", fontSize: "var(--text-sm)", flexShrink: 0,
        }}
      >✕</button>
    </div>
  );
}
