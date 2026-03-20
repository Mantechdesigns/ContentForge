"use client";

import AppShell from "../../components/AppShell";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h2>📊 Performance</h2>
        <p>Track your automated content performance across all platforms.</p>
      </div>
      <div className="page-body fade-in">
        {/* Summary Stats — Real Empty State */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          {[
            { label: "Videos Posted", value: "—", color: "#8b5cf6" },
            { label: "Total Views", value: "—", color: "var(--accent-primary)" },
            { label: "Avg Engagement", value: "—", color: "#22c55e" },
            { label: "Revenue Impact", value: "—", color: "#fbbf24" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "var(--space-5)", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.label}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }}>📊</div>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
            No performance data yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: 400, margin: "0 auto" }}>
            Performance analytics will populate once you start publishing content through AutoPilot. Connect your platforms in Settings first.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
