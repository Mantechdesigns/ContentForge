"use client";

import { useState } from "react";
import AppShell from "../../components/AppShell";

/* ───── Types ───── */
interface ScheduleSlot {
  id: string;
  title: string;
  platform: string;
  platformIcon: string;
}

type SlotKey = string; // "day-hour" format

/* ───── Constants ───── */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "📱" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
];

function slotKey(day: string, hour: string): SlotKey {
  return `${day}-${hour}`;
}

/* ───── Initial Schedule ───── */
function buildInitial(): Record<SlotKey, ScheduleSlot[]> {
  const data: Record<SlotKey, ScheduleSlot[]> = {};
  const entries: [string, string, string, string, string][] = [
    ["Mon", "9 AM", "Why 90% leak profit", "TikTok", "📱"],
    ["Mon", "9 AM", "Scaling past $500K", "Instagram", "📸"],
    ["Mon", "12 PM", "CEO morning routine", "YouTube", "▶️"],
    ["Mon", "12 PM", "Funnel converts at 12%", "TikTok", "📱"],
    ["Mon", "12 PM", "VA doing it wrong", "LinkedIn", "💼"],
    ["Mon", "6 PM", "Agency $300K mistake", "Instagram", "📸"],
    ["Mon", "6 PM", "Stop outsourcing this", "TikTok", "📱"],
    ["Mon", "6 PM", "Offer explanation 8s", "YouTube", "▶️"],
    ["Tue", "10 AM", "Profit leak in software", "TikTok", "📱"],
    ["Tue", "10 AM", "3 things with $10K", "Instagram", "📸"],
    ["Tue", "1 PM", "Burn out before $1M", "YouTube", "▶️"],
    ["Tue", "1 PM", "Revenue growth case", "LinkedIn", "💼"],
    ["Tue", "7 PM", "Email cold outreach", "TikTok", "📱"],
    ["Tue", "7 PM", "Accelerator demo", "Instagram", "📸"],
    ["Tue", "7 PM", "Client testimonial", "Facebook", "📘"],
    ["Wed", "9 AM", "BRR framework intro", "TikTok", "📱"],
    ["Wed", "9 AM", "ManTech 3 C's", "YouTube", "▶️"],
    ["Wed", "9 AM", "Scale systems demo", "Instagram", "📸"],
    ["Wed", "3 PM", "Competitor secrets", "TikTok", "📱"],
    ["Wed", "3 PM", "Agency automations", "LinkedIn", "💼"],
    ["Wed", "6 PM", "Profit audit teaser", "Instagram", "📸"],
    ["Wed", "6 PM", "Digital flipbook", "TikTok", "📱"],
    ["Wed", "6 PM", "BRR hook formula", "YouTube", "▶️"],
    ["Thu", "10 AM", "60hr to nothing", "TikTok", "📱"],
    ["Thu", "10 AM", "Onboarding flow", "Instagram", "📸"],
    ["Thu", "4 PM", "Brand kit reveal", "YouTube", "▶️"],
    ["Thu", "4 PM", "Split screen demo", "TikTok", "📱"],
    ["Thu", "7 PM", "Masterclass clip", "Instagram", "📸"],
    ["Thu", "7 PM", "Audience targeting", "LinkedIn", "💼"],
    ["Thu", "7 PM", "Results walkthrough", "Facebook", "📘"],
    ["Fri", "9 AM", "Friday motivation", "TikTok", "📱"],
    ["Fri", "9 AM", "Week in review", "Instagram", "📸"],
    ["Fri", "3 PM", "Weekend strategy", "YouTube", "▶️"],
    ["Fri", "3 PM", "Quick tip series", "TikTok", "📱"],
    ["Fri", "3 PM", "Community post", "Facebook", "📘"],
    ["Fri", "6 PM", "Sunday prep guide", "LinkedIn", "💼"],
    ["Fri", "6 PM", "BRR accelerator", "Instagram", "📸"],
    ["Sat", "11 AM", "Weekend hustle", "TikTok", "📱"],
    ["Sat", "11 AM", "Casual vlog", "Instagram", "📸"],
    ["Sat", "3 PM", "Story time reel", "TikTok", "📱"],
    ["Sat", "3 PM", "Behind the scenes", "YouTube", "▶️"],
    ["Sun", "11 AM", "Week ahead preview", "TikTok", "📱"],
    ["Sun", "3 PM", "Motivation Monday prep", "Instagram", "📸"],
    ["Sun", "3 PM", "Goal setting video", "LinkedIn", "💼"],
  ];
  entries.forEach(([day, hour, title, platform, icon], i) => {
    const key = slotKey(day, hour);
    if (!data[key]) data[key] = [];
    data[key].push({ id: `init-${i}`, title, platform, platformIcon: icon });
  });
  return data;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Record<SlotKey, ScheduleSlot[]>>(buildInitial);
  const [selectedSlot, setSelectedSlot] = useState<SlotKey | null>(null);
  const [addTitle, setAddTitle] = useState("");
  const [addPlatform, setAddPlatform] = useState("tiktok");
  const [dragItem, setDragItem] = useState<{ item: ScheduleSlot; from: SlotKey } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<SlotKey | null>(null);

  const addToSlot = () => {
    if (!selectedSlot || !addTitle.trim()) return;
    const plat = PLATFORMS.find(p => p.id === addPlatform);
    const newItem: ScheduleSlot = {
      id: `add-${Date.now()}`,
      title: addTitle.trim(),
      platform: plat?.label || "TikTok",
      platformIcon: plat?.icon || "📱",
    };
    setSchedule(prev => ({ ...prev, [selectedSlot]: [...(prev[selectedSlot] || []), newItem] }));
    setAddTitle("");
    setSelectedSlot(null);
  };

  const removeItem = (key: SlotKey, itemId: string) => {
    setSchedule(prev => ({ ...prev, [key]: (prev[key] || []).filter(s => s.id !== itemId) }));
  };

  const handleDragStart = (item: ScheduleSlot, from: SlotKey) => {
    setDragItem({ item, from });
  };

  const handleDrop = (toKey: SlotKey) => {
    if (!dragItem) return;
    if (dragItem.from === toKey) { setDragItem(null); setDragOverSlot(null); return; }
    setSchedule(prev => {
      const fromItems = (prev[dragItem.from] || []).filter(s => s.id !== dragItem.item.id);
      const toItems = [...(prev[toKey] || []), dragItem.item];
      return { ...prev, [dragItem.from]: fromItems, [toKey]: toItems };
    });
    setDragItem(null);
    setDragOverSlot(null);
  };

  const totalScheduled = Object.values(schedule).flat().length;

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📅 Auto Schedule</h2>
            <p>Click any slot to add content. Drag items between slots to reschedule.</p>
          </div>
          <span className="badge badge-green">{totalScheduled} scheduled this week</span>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Add Modal */}
        {selectedSlot && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          }} onClick={() => setSelectedSlot(null)}>
            <div className="card" style={{ padding: "var(--space-6)", width: 420 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
                ➕ Add to {selectedSlot.replace("-", " · ")}
              </h3>
              <div style={{ marginBottom: "var(--space-3)" }}>
                <input
                  className="form-input"
                  placeholder="Video title or topic..."
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addToSlot()}
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setAddPlatform(p.id)}
                    style={{
                      padding: "var(--space-1) var(--space-3)",
                      borderRadius: "var(--radius-sm)",
                      border: `2px solid ${addPlatform === p.id ? "#8b5cf6" : "var(--border-default)"}`,
                      background: addPlatform === p.id ? "rgba(139, 92, 246, 0.15)" : "var(--bg-input)",
                      color: "var(--text-primary)", cursor: "pointer", fontSize: "var(--text-xs)",
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setSelectedSlot(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={addToSlot}>Add to Schedule</button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="card" style={{ padding: "var(--space-4)", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "var(--space-2) var(--space-3)", textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)", width: 60 }}></th>
                {HOURS.map(h => (
                  <th key={h} style={{ padding: "var(--space-2) var(--space-1)", textAlign: "center", color: "var(--text-muted)", fontWeight: 400, fontSize: "10px", minWidth: 80 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td style={{ padding: "var(--space-2) var(--space-3)", fontWeight: 600, color: "var(--text-primary)", fontSize: "var(--text-xs)", verticalAlign: "top" }}>{day}</td>
                  {HOURS.map(hour => {
                    const key = slotKey(day, hour);
                    const items = schedule[key] || [];
                    const isOver = dragOverSlot === key;
                    return (
                      <td
                        key={hour}
                        onClick={() => !dragItem && setSelectedSlot(key)}
                        onDragOver={e => { e.preventDefault(); setDragOverSlot(key); }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={() => handleDrop(key)}
                        style={{
                          padding: 2,
                          verticalAlign: "top",
                          cursor: "pointer",
                          minHeight: 60,
                        }}
                      >
                        <div style={{
                          minHeight: 50,
                          borderRadius: "var(--radius-sm)",
                          background: isOver ? "rgba(139, 92, 246, 0.12)" : items.length > 0 ? "transparent" : "var(--bg-input)",
                          border: `1px ${items.length > 0 || isOver ? "solid" : "dashed"} ${isOver ? "#8b5cf6" : "var(--border-subtle)"}`,
                          padding: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          transition: "background 0.15s, border-color 0.15s",
                        }}>
                          {items.map(item => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => { e.stopPropagation(); handleDragStart(item, key); }}
                              onDragEnd={() => { setDragItem(null); setDragOverSlot(null); }}
                              onClick={e => e.stopPropagation()}
                              style={{
                                background: "rgba(139, 92, 246, 0.12)",
                                borderRadius: 4,
                                padding: "3px 5px",
                                fontSize: "9px",
                                color: "var(--text-primary)",
                                cursor: "grab",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                                lineHeight: 1.2,
                              }}
                            >
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                {item.platformIcon} {item.title}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeItem(key, item.id); }}
                                style={{
                                  background: "none", border: "none", color: "var(--text-muted)",
                                  cursor: "pointer", fontSize: "9px", padding: 0, flexShrink: 0,
                                }}
                              >✕</button>
                            </div>
                          ))}
                          {items.length === 0 && (
                            <div style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                              color: "var(--text-muted)", fontSize: "9px", opacity: 0.4, minHeight: 46,
                            }}>+</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
          {[
            { label: "This Week", value: `${totalScheduled} videos`, sub: `${Math.round(totalScheduled / 7)}/day avg` },
            { label: "Busiest Day", value: (() => { let maxDay = "Mon"; let maxCount = 0; DAYS.forEach(d => { const count = HOURS.reduce((sum, h) => sum + (schedule[slotKey(d, h)]?.length || 0), 0); if (count > maxCount) { maxCount = count; maxDay = d; } }); return maxDay; })(), sub: `${Math.max(...DAYS.map(d => HOURS.reduce((sum, h) => sum + (schedule[slotKey(d, h)]?.length || 0), 0)))} videos` },
            { label: "Peak Slot", value: (() => { let maxHour = "12 PM"; let maxCount = 0; HOURS.forEach(h => { const count = DAYS.reduce((sum, d) => sum + (schedule[slotKey(d, h)]?.length || 0), 0); if (count > maxCount) { maxCount = count; maxHour = h; } }); return maxHour; })(), sub: "Highest engagement window" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "var(--space-5)", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.label}</div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "#8b5cf6", marginTop: "var(--space-1)" }}>{s.value}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
