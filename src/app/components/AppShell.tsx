"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  children: React.ReactNode;
}

const FORGE_ITEMS = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/research", label: "Research Engine", icon: "🔍" },
  { href: "/research/viral", label: "Viral Intelligence", icon: "🔥" },
  { href: "/research/breakdown", label: "Video Breakdown", icon: "🔬" },
  { href: "/scripts", label: "Script Generator", icon: "📝" },
  { href: "/production", label: "Video Production", icon: "🎬" },
  { href: "/production/scenes", label: "Scene Editor", icon: "🎞️", locked: true },
  { href: "/cinematic", label: "Cinematic Studio", icon: "🎥", locked: true },
  { href: "/assets", label: "Asset Library", icon: "📦", locked: true },
  { href: "/profile", label: "Brand Profile", icon: "👤" },
  { href: "/frameworks", label: "Frameworks", icon: "📚" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const AUTOPILOT_ITEMS = [
  { href: "/autopilot", label: "Command Center", icon: "🚀" },
  { href: "/autopilot/research", label: "Research Auto", icon: "🔬" },
  { href: "/autopilot/queue", label: "Production Queue", icon: "📋" },
  { href: "/autopilot/schedule", label: "Auto Schedule", icon: "📅" },
  { href: "/autopilot/analytics", label: "Performance", icon: "📊" },
];

const OPENCLAW_ITEMS = [
  { href: "/openclaw", label: "Agent Dashboard", icon: "🦀" },
  { href: "/openclaw/skills", label: "Skills Hub", icon: "🧠" },
  { href: "/openclaw/produce", label: "AI Producer", icon: "🎬" },
  { href: "/openclaw/content", label: "Content Vault", icon: "📂" },
  { href: "/openclaw/logs", label: "Activity Log", icon: "📜" },
];

const PRO_ITEMS = [
  { href: "/extension", label: "Chrome Extension", icon: "🧩" },
];

type TabId = "forge" | "autopilot" | "openclaw";

const TAB_ROUTES: Record<TabId, string> = {
  forge: "/",
  autopilot: "/autopilot",
  openclaw: "/openclaw",
};

const TABS: { id: TabId; label: string; bg: string; bgActive: string }[] = [
  { id: "forge", label: "🔥 Forge", bg: "transparent", bgActive: "var(--accent-primary)" },
  { id: "autopilot", label: "⚡ AutoPilot", bg: "transparent", bgActive: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
  { id: "openclaw", label: "🦀 OpenClaw", bg: "transparent", bgActive: "linear-gradient(135deg, #06b6d4, #0891b2)" },
];

export default function AppShell({ children }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const initialTab: TabId = pathname.startsWith("/openclaw") ? "openclaw" : pathname.startsWith("/autopilot") ? "autopilot" : "forge";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keep tab in sync with URL when navigating via sidebar links
  useEffect(() => {
    const correctTab: TabId = pathname.startsWith("/openclaw") ? "openclaw" : pathname.startsWith("/autopilot") ? "autopilot" : "forge";
    if (correctTab !== activeTab) {
      setActiveTab(correctTab);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Pro status — hardcoded true for now, will be dynamic from auth */
  const isPro = true;

  const handleTabSwitch = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileOpen(false);
    router.push(TAB_ROUTES[tabId]);
  };

  const navItems = activeTab === "forge" ? FORGE_ITEMS : activeTab === "autopilot" ? AUTOPILOT_ITEMS : OPENCLAW_ITEMS;
  const sectionLabel = activeTab === "forge" ? "Content" : activeTab === "autopilot" ? "Automation" : "Agent";

  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        <div className="sidebar-brand">
          <h1>Content Forge</h1>
          <span>by ManTech Designs</span>
        </div>

        {/* Tab Switcher — 3 tabs */}
        <div style={{
          display: "flex",
          margin: "0 var(--space-3)",
          background: "var(--bg-input)",
          borderRadius: "var(--radius-md)",
          padding: 3,
          marginBottom: "var(--space-3)",
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              style={{
                flex: 1,
                padding: "var(--space-2) var(--space-1)",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: activeTab === tab.id ? tab.bgActive : tab.bg,
                color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
                fontSize: "10px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable Nav ── */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          <div className="nav-section">{sectionLabel}</div>
          {navItems.map((item: { href: string; label: string; icon: string; locked?: boolean }) => (
            <Link
              key={item.href}
              href={item.locked ? "#" : item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
              onClick={(e) => { if (item.locked) e.preventDefault(); setMobileOpen(false); }}
              style={item.locked ? { opacity: 0.45 } : undefined}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.locked && <span style={{ marginLeft: "auto", fontSize: "10px" }}>🔒</span>}
            </Link>
          ))}
        </nav>

        {/* ── Pinned Bottom: PRO + System ── */}
        <div style={{ flexShrink: 0, borderTop: "1px solid var(--border-subtle)" }}>
          {/* PRO Section */}
          <div style={{ padding: "var(--space-3) var(--space-4) 0" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "var(--space-2)",
              fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.05em", color: "var(--text-muted)",
              marginBottom: "var(--space-2)",
            }}>
              <span>Pro</span>
              <span style={{
                background: isPro
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#fff", fontSize: "8px", fontWeight: 700,
                padding: "1px 6px", borderRadius: "var(--radius-full)",
                lineHeight: "14px",
              }}>{isPro ? "ACTIVE" : "UPGRADE"}</span>
            </div>
            {PRO_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={isPro ? item.href : "#"}
                className={`nav-link ${pathname === item.href ? "active" : ""}`}
                onClick={(e) => {
                  if (!isPro) { e.preventDefault(); return; }
                  setMobileOpen(false);
                }}
                style={{
                  borderLeft: isPro
                    ? "2px solid rgba(34, 197, 94, 0.5)"
                    : "2px solid rgba(100, 116, 139, 0.3)",
                  opacity: isPro ? 1 : 0.5,
                  pointerEvents: isPro ? "auto" : "none",
                }}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
                <span style={{
                  marginLeft: "auto", fontSize: "8px", fontWeight: 700,
                  background: isPro ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
                  color: isPro ? "#22c55e" : "var(--text-muted)",
                  padding: "1px 5px", borderRadius: "var(--radius-full)",
                }}>PRO</span>
              </Link>
            ))}
          </div>

          {/* System */}
          <div style={{ padding: "var(--space-2) var(--space-4) var(--space-3)" }}>
            <Link
              href="/settings"
              className={`nav-link ${pathname === "/settings" ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="icon">⚙️</span>
              Settings
            </Link>
          </div>

          {/* Version */}
          <div style={{ padding: "var(--space-2) var(--space-4) var(--space-3)", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Phase 1 • v0.1.0
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
