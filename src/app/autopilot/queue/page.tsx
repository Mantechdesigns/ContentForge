"use client";

import { useState, useRef } from "react";
import AppShell from "../../components/AppShell";

/* ───── Types ───── */
interface QueueCard {
  id: string;
  title: string;
  platform: string;
  platformIcon: string;
  type: string;
  typeIcon: string;
  scheduled: string;
  age: string;
}

type ColumnId = "ideas" | "scripted" | "producing" | "review" | "approved" | "posted";

interface Column {
  id: ColumnId;
  label: string;
  icon: string;
  color: string;
}

/* ───── Constants ───── */
const COLUMNS: Column[] = [
  { id: "ideas", label: "Ideas", icon: "💡", color: "#fbbf24" },
  { id: "scripted", label: "Scripted", icon: "📝", color: "#f97316" },
  { id: "producing", label: "Producing", icon: "⚡", color: "#3b82f6" },
  { id: "review", label: "In Review", icon: "👀", color: "#a855f7" },
  { id: "approved", label: "Approved", icon: "✅", color: "#22c55e" },
  { id: "posted", label: "Posted", icon: "🚀", color: "#8b5cf6" },
];

const INITIAL_CARDS: Record<ColumnId, QueueCard[]> = {
  ideas: [
    { id: "i1", title: "Why 90% of businesses leak profit", platform: "TikTok", platformIcon: "📱", type: "Talking Head", typeIcon: "🗣️", scheduled: "Today 2 PM", age: "5m" },
    { id: "i2", title: "The morning routine that 10x'd revenue", platform: "LinkedIn", platformIcon: "💼", type: "B-Roll", typeIcon: "🎞️", scheduled: "Tomorrow 9 AM", age: "10m" },
  ],
  scripted: [
    { id: "s1", title: "The 3-step system to scale past $500K", platform: "Instagram", platformIcon: "📸", type: "B-Roll", typeIcon: "🎞️", scheduled: "Today 4 PM", age: "15m" },
    { id: "s2", title: "Stop outsourcing this or you'll fail", platform: "YouTube", platformIcon: "▶️", type: "Cinematic", typeIcon: "🎬", scheduled: "Tomorrow 12 PM", age: "20m" },
  ],
  producing: [
    { id: "p1", title: "Your competitors know this and you don't", platform: "YouTube", platformIcon: "▶️", type: "Cinematic", typeIcon: "🎬", scheduled: "Today 6 PM", age: "25m" },
  ],
  review: [
    { id: "r1", title: "Stop trading hours for dollars", platform: "TikTok", platformIcon: "📱", type: "Talking Head", typeIcon: "🗣️", scheduled: "Tomorrow 10 AM", age: "30m" },
    { id: "r2", title: "3 automations every agency needs", platform: "Facebook", platformIcon: "📘", type: "Split", typeIcon: "📱", scheduled: "Tomorrow 3 PM", age: "15m" },
  ],
  approved: [
    { id: "a1", title: "I audited a $2M business and found $300K in leaks", platform: "Instagram", platformIcon: "📸", type: "B-Roll", typeIcon: "🎞️", scheduled: "Yesterday", age: "1d" },
  ],
  posted: [
    { id: "d1", title: "Why your funnel converts at 1%", platform: "TikTok", platformIcon: "📱", type: "Talking Head", typeIcon: "🗣️", scheduled: "2 days ago", age: "2d" },
  ],
};

export default function QueuePage() {
  const [board, setBoard] = useState<Record<ColumnId, QueueCard[]>>(INITIAL_CARDS);
  const [draggedCard, setDraggedCard] = useState<{ card: QueueCard; fromCol: ColumnId } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("TikTok");
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (card: QueueCard, fromCol: ColumnId) => {
    setDraggedCard({ card, fromCol });
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (toCol: ColumnId) => {
    if (!draggedCard) return;
    if (draggedCard.fromCol === toCol) { setDraggedCard(null); setDragOverCol(null); return; }

    setBoard(prev => {
      const fromCards = prev[draggedCard.fromCol].filter(c => c.id !== draggedCard.card.id);
      const toCards = [...prev[toCol], draggedCard.card];
      return { ...prev, [draggedCard.fromCol]: fromCards, [toCol]: toCards };
    });
    setDraggedCard(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCol(null);
  };

  const addCard = () => {
    if (!newTitle.trim()) return;
    const platformMap: Record<string, { icon: string }> = {
      TikTok: { icon: "📱" }, Instagram: { icon: "📸" }, YouTube: { icon: "▶️" },
      Facebook: { icon: "📘" }, LinkedIn: { icon: "💼" },
    };
    const newCard: QueueCard = {
      id: `new-${Date.now()}`,
      title: newTitle.trim(),
      platform: newPlatform,
      platformIcon: platformMap[newPlatform]?.icon || "📱",
      type: "Talking Head",
      typeIcon: "🗣️",
      scheduled: "Not scheduled",
      age: "just now",
    };
    setBoard(prev => ({ ...prev, ideas: [newCard, ...prev.ideas] }));
    setNewTitle("");
    setShowAddForm(false);
  };

  const totalCards = Object.values(board).flat().length;

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📋 Production Queue</h2>
            <p>Drag cards between columns to manage your content pipeline. Trello-style board view.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{totalCards} items</span>
            <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setTimeout(() => addInputRef.current?.focus(), 100); }}>
              + Add Video
            </button>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Quick Add Form */}
        {showAddForm && (
          <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-5)", display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <input
              ref={addInputRef}
              className="form-input"
              placeholder="Video title or topic..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCard()}
              style={{ flex: 1 }}
            />
            <select
              className="form-input"
              value={newPlatform}
              onChange={e => setNewPlatform(e.target.value)}
              style={{ width: 150 }}
            >
              {["TikTok", "Instagram", "YouTube", "Facebook", "LinkedIn"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={addCard}>Add</button>
            <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>✕</button>
          </div>
        )}

        {/* Kanban Board */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`,
          gap: "var(--space-3)",
          overflowX: "auto",
          minHeight: 500,
        }}>
          {COLUMNS.map(col => {
            const cards = board[col.id];
            const isOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.id)}
                style={{
                  background: isOver ? `${col.color}10` : "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isOver ? col.color : "var(--border-subtle)"}`,
                  padding: "var(--space-3)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s, background 0.2s",
                  minHeight: 400,
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "var(--space-2) var(--space-2)",
                  marginBottom: "var(--space-3)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                    <span>{col.icon}</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: col.color }}>{col.label}</span>
                  </div>
                  <span style={{
                    background: `${col.color}25`,
                    color: col.color,
                    fontSize: "10px",
                    fontWeight: 700,
                    width: 20, height: 20,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {cards.map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card, col.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        padding: "var(--space-3)",
                        cursor: "grab",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        borderLeft: `3px solid ${col.color}`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                    >
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
                        {card.title}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "var(--space-1)" }}>
                          <span style={{
                            fontSize: "10px", background: "var(--bg-input)",
                            padding: "1px 5px", borderRadius: "var(--radius-full)",
                            color: "var(--text-muted)",
                          }}>
                            {card.platformIcon} {card.platform}
                          </span>
                          <span style={{
                            fontSize: "10px", background: "var(--bg-input)",
                            padding: "1px 5px", borderRadius: "var(--radius-full)",
                            color: "var(--text-muted)",
                          }}>
                            {card.typeIcon}
                          </span>
                        </div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{card.age}</span>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {cards.length === 0 && (
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px dashed var(--border-default)", borderRadius: "var(--radius-sm)",
                      color: "var(--text-muted)", fontSize: "var(--text-xs)",
                      padding: "var(--space-6)",
                    }}>
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
