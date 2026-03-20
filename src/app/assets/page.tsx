"use client";

import { useState, useRef } from "react";
import AppShell from "../components/AppShell";

/* ───── Types ───── */
interface Asset {
  id: string;
  name: string;
  type: "pdf" | "video" | "image" | "doc" | "checklist" | "course";
  size: string;
  source: "upload" | "gdrive" | "r2" | "url";
  tags: string[];
  uploadedAt: string;
  aiIndexed: boolean;
}

/* ───── Constants ───── */
const ASSET_TYPES = [
  { id: "all", label: "All Assets", icon: "📁" },
  { id: "pdf", label: "PDFs & Lead Magnets", icon: "📄" },
  { id: "video", label: "Video Courses", icon: "🎬" },
  { id: "image", label: "Images & Graphics", icon: "🖼️" },
  { id: "doc", label: "Documents", icon: "📝" },
  { id: "checklist", label: "Checklists", icon: "✅" },
  { id: "course", label: "Full Courses", icon: "🎓" },
];

const SOURCES = [
  { id: "upload", label: "📤 Upload File", desc: "Drag & drop or browse" },
  { id: "gdrive", label: "📁 Google Drive", desc: "Connect & sync folders" },
  { id: "r2", label: "☁️ Cloudflare R2", desc: "Pull from bucket" },
  { id: "url", label: "🔗 URL Import", desc: "Paste a link" },
];

const MOCK_ASSETS: Asset[] = [
  { id: "1", name: "BRR Profit Leak Audit — Complete Guide", type: "pdf", size: "4.2 MB", source: "upload", tags: ["lead magnet", "audit", "profit"], uploadedAt: "2 hours ago", aiIndexed: true },
  { id: "2", name: "BRR Digital Flipbook", type: "pdf", size: "12.8 MB", source: "upload", tags: ["lead magnet", "flipbook", "BRR"], uploadedAt: "3 hours ago", aiIndexed: true },
  { id: "3", name: "The 7-Figure Systems Masterclass", type: "course", size: "2.4 GB", source: "gdrive", tags: ["course", "scaling", "systems"], uploadedAt: "1 day ago", aiIndexed: true },
  { id: "4", name: "Client Testimonial — Sarah K.", type: "video", size: "84 MB", source: "upload", tags: ["testimonial", "social proof"], uploadedAt: "1 day ago", aiIndexed: false },
  { id: "5", name: "ManTech Brand Kit — Logos + Colors", type: "image", size: "18 MB", source: "gdrive", tags: ["brand", "design", "logo"], uploadedAt: "3 days ago", aiIndexed: true },
  { id: "6", name: "BRR Accelerator Onboarding Checklist", type: "checklist", size: "230 KB", source: "upload", tags: ["onboarding", "checklist", "accelerator"], uploadedAt: "5 days ago", aiIndexed: true },
  { id: "7", name: "Revenue Growth Case Study — $2M Agency", type: "doc", size: "1.1 MB", source: "upload", tags: ["case study", "agency", "revenue"], uploadedAt: "1 week ago", aiIndexed: true },
  { id: "8", name: "Email Sequence — Cold Outreach Templates", type: "doc", size: "480 KB", source: "url", tags: ["email", "outreach", "templates"], uploadedAt: "1 week ago", aiIndexed: false },
];

const typeIcons: Record<string, string> = {
  pdf: "📄", video: "🎬", image: "🖼️", doc: "📝", checklist: "✅", course: "🎓",
};

const sourceLabels: Record<string, string> = {
  upload: "📤 Uploaded", gdrive: "📁 Google Drive", r2: "☁️ R2", url: "🔗 URL",
};

export default function AssetsPage() {
  const [filter, setFilter] = useState("all");
  const [assets] = useState<Asset[]>(MOCK_ASSETS);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSource, setSelectedSource] = useState("upload");
  const [urlImport, setUrlImport] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filter === "all" ? assets : assets.filter(a => a.type === filter);
  const indexedCount = assets.filter(a => a.aiIndexed).length;

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📦 Asset Library</h2>
            <p>Upload lead magnets, courses, and brand assets — AI uses these for smarter content.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <span className="badge badge-green">{indexedCount}/{assets.length} AI Indexed</span>
            <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
              + Add Assets
            </button>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Upload Panel */}
        {showUpload && (
          <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>📤 Add New Assets</h3>

            {/* Source Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
              {SOURCES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSource(s.id)}
                  style={{
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${selectedSource === s.id ? "var(--accent-primary)" : "var(--border-default)"}`,
                    background: selectedSource === s.id ? "var(--accent-primary-glow)" : "var(--bg-input)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{s.label.split(" ")[0]}</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>{s.label.split(" ").slice(1).join(" ")}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Upload Zone */}
            {selectedSource === "upload" && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const files = e.dataTransfer.files; if (files.length > 0) { console.log("Files dropped:", Array.from(files).map(f => f.name)); } }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "var(--accent-primary)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-10)",
                  textAlign: "center",
                  background: dragOver ? "var(--accent-primary-glow)" : "var(--bg-input)",
                  transition: "all var(--transition-fast)",
                  cursor: "pointer",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.mp4,.mov,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt,.md"
                  onChange={(e) => { const files = e.target.files; if (files && files.length > 0) { console.log("Files selected:", Array.from(files).map(f => f.name)); } }}
                  style={{ display: "none" }}
                />
                <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>📁</div>
                <p style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>Drag & drop files here</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  PDF, Video, Images, Docs — up to 500 MB per file
                </p>
                <button className="btn btn-secondary" style={{ marginTop: "var(--space-3)" }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Browse Files
                </button>
              </div>
            )}

            {/* Google Drive Connect */}
            {selectedSource === "gdrive" && (
              <div style={{
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-8)",
                textAlign: "center",
                background: "var(--bg-input)",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>📁</div>
                <p style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>Connect Google Drive</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
                  Sync folders directly — AI will index all lead magnets, courses, and docs automatically
                </p>
                <button className="btn btn-primary" style={{ background: "#4285f4" }}>
                  🔗 Connect Google Drive
                </button>
              </div>
            )}

            {/* R2 Connect */}
            {selectedSource === "r2" && (
              <div style={{
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-8)",
                textAlign: "center",
                background: "var(--bg-input)",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>☁️</div>
                <p style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>Cloudflare R2 Bucket</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
                  Pull assets from your R2 storage bucket
                </p>
                <button className="btn btn-primary" style={{ background: "#f48120" }}>
                  Connect R2 Bucket
                </button>
              </div>
            )}

            {/* URL Import */}
            {selectedSource === "url" && (
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <input
                  className="form-input"
                  placeholder="https://example.com/my-lead-magnet.pdf"
                  value={urlImport}
                  onChange={(e) => setUrlImport(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && urlImport.trim() && console.log("Import URL:", urlImport)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={() => { if (urlImport.trim()) { console.log("Import URL:", urlImport); setUrlImport(""); } }}>Import</button>
              </div>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)", flexWrap: "wrap" }}>
          {ASSET_TYPES.map(at => (
            <button
              key={at.id}
              onClick={() => setFilter(at.id)}
              className={`modifier-tag ${filter === at.id ? "active" : ""}`}
            >
              {at.icon} {at.label}
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)" }}>
          {filtered.map(asset => (
            <div key={asset.id} className="card" style={{
              padding: "var(--space-5)",
              display: "flex",
              gap: "var(--space-4)",
              alignItems: "flex-start",
            }}>
              {/* Type Icon */}
              <div style={{
                width: 48, height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem",
                flexShrink: 0,
              }}>
                {typeIcons[asset.type]}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 4 }}>
                  <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {asset.name}
                  </h4>
                  {asset.aiIndexed && (
                    <span style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#22c55e",
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      🧠 AI Indexed
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                  <span>{sourceLabels[asset.source]}</span>
                  <span>•</span>
                  <span>{asset.size}</span>
                  <span>•</span>
                  <span>{asset.uploadedAt}</span>
                </div>

                <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
                  {asset.tags.map(tag => (
                    <span key={tag} style={{
                      background: "var(--bg-input)",
                      color: "var(--text-muted)",
                      fontSize: "10px",
                      padding: "1px 8px",
                      borderRadius: "var(--radius-full)",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flexShrink: 0 }}>
                {!asset.aiIndexed && (
                  <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: "var(--text-xs)" }}>
                    🧠 Index
                  </button>
                )}
                <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: "var(--text-xs)" }}>
                  👁️ View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Context Summary */}
        <div className="card" style={{
          marginTop: "var(--space-6)",
          padding: "var(--space-5)",
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02))",
          border: "1px solid rgba(34, 197, 94, 0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "1.5rem" }}>🧠</span>
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#22c55e" }}>
                AI Context: {indexedCount} assets indexed
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                The AI uses your indexed assets to generate contextually-aware scripts, understand your offers, reference your lead magnets, and create branded content that matches your style.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
