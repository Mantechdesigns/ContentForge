"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";

interface BrandProfile {
  name: string;
  tagline: string;
  mission: string;
  voice: string;
  values: string;
  colors: string;
}

interface ICP {
  title: string;
  revenue: string;
  painPoints: string;
  goals: string;
  platforms: string;
}

interface Avatar {
  id: string;
  name: string;
  description: string;
  painPoints: string;
  desires: string;
}

interface Offer {
  id: string;
  name: string;
  type: string;
  price: string;
  description: string;
  cta: string;
}

export default function ProfilePage() {
  const [brand, setBrand] = useState<BrandProfile>({
    name: "BRR — Business Resilience Revolution",
    tagline: "Stop leaking profit. Start scaling with systems.",
    mission: "Help business owners doing $500K-$5M/year optimize their operations, plug profit leaks, and scale to $100K/month+.",
    voice: "Direct, tactical, bold, premium, faith-aware, scars-to-wisdom. Street-smart but strategic. No fluff, no filler.",
    values: "Faith, Resilience, Freedom, Truth, Legacy",
    colors: "#FF6B2C (Orange), #0A0A0F (Dark), #D4A843 (Gold)",
  });

  const [icp, setIcp] = useState<ICP>({
    title: "Business Owner ($500K-$5M/yr)",
    revenue: "$500,000 — $5,000,000 annual revenue",
    painPoints: "Leaking profit, no systems, working IN the business not ON it, overwhelmed by operations, can't scale past current plateau",
    goals: "Hit $100K/month, build systems that run without them, create legacy, achieve financial freedom",
    platforms: "Instagram, TikTok, YouTube, LinkedIn",
  });

  const [avatars, setAvatars] = useState<Avatar[]>([
    {
      id: "1",
      name: "The Hustling Owner",
      description: "Making $500K-$1M but working 70+ hours. Revenue growing but profit flat.",
      painPoints: "No time, burnt out, money coming in but leaking out, wearing all hats",
      desires: "Systems, team leverage, time freedom, predictable profit",
    },
    {
      id: "2",
      name: "The Plateau Operator",
      description: "Stuck at $1-3M. Has a team but feels like babysitting. Growth stalled.",
      painPoints: "Team underperforms, no SOPs, revenue plateau, imposter syndrome at scale",
      desires: "Break through ceiling, leadership skills, operational excellence, exit optionality",
    },
  ]);

  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "1",
      name: "Profit Leak Audit",
      type: "Lead Magnet (Free)",
      price: "Free",
      description: "30-minute audit revealing where your business is leaking profit. Custom report delivered.",
      cta: 'Comment "AUDIT" below',
    },
    {
      id: "2",
      name: "BRR Digital Flipbook",
      type: "Lead Magnet (Free)",
      price: "Free",
      description: "The complete guide to plugging profit leaks and building scalable systems.",
      cta: 'Comment "FLIPBOOK" to get it free',
    },
    {
      id: "3",
      name: "BRR Accelerator",
      type: "High-Ticket Program",
      price: "$5,000 - $15,000",
      description: "12-week intensive: build your revenue engine, hire right, install systems, scale to $100K/mo.",
      cta: "DM me to apply",
    },
  ]);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>👤 Brand Profile</h2>
            <p>Your identity, ICP, target avatars, and offers. This drives all content generation.</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? "✓ Saved" : "💾 Save Profile"}
          </button>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Brand Identity */}
        <div className="settings-section">
          <h3>🏢 Brand Identity</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input className="form-input" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-input" value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Mission</label>
              <textarea className="form-textarea" rows={2} value={brand.mission} onChange={(e) => setBrand({ ...brand, mission: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Brand Voice</label>
              <textarea className="form-textarea" rows={2} value={brand.voice} onChange={(e) => setBrand({ ...brand, voice: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Core Values</label>
              <input className="form-input" value={brand.values} onChange={(e) => setBrand({ ...brand, values: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Brand Colors</label>
              <input className="form-input" value={brand.colors} onChange={(e) => setBrand({ ...brand, colors: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ICP */}
        <div className="settings-section">
          <h3>🎯 Ideal Customer Profile (ICP)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={icp.title} onChange={(e) => setIcp({ ...icp, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Revenue Range</label>
              <input className="form-input" value={icp.revenue} onChange={(e) => setIcp({ ...icp, revenue: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Pain Points</label>
              <textarea className="form-textarea" rows={2} value={icp.painPoints} onChange={(e) => setIcp({ ...icp, painPoints: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Goals & Desires</label>
              <textarea className="form-textarea" rows={2} value={icp.goals} onChange={(e) => setIcp({ ...icp, goals: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Platforms</label>
              <input className="form-input" value={icp.platforms} onChange={(e) => setIcp({ ...icp, platforms: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Target Avatars */}
        <div className="settings-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: 0, border: 0, padding: 0 }}>🎭 Target Avatars</h3>
            <button className="btn btn-secondary" onClick={() => setAvatars([...avatars, { id: String(Date.now()), name: "", description: "", painPoints: "", desires: "" }])}>
              + Add Avatar
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {avatars.map((avatar, idx) => (
              <div key={avatar.id} style={{ background: "var(--bg-input)", borderRadius: "var(--radius-md)", padding: "var(--space-5)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <span className="badge badge-purple">Avatar {idx + 1}</span>
                  <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", color: "var(--accent-red)" }} onClick={() => setAvatars(avatars.filter((a) => a.id !== avatar.id))}>
                    Remove
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" placeholder="e.g. The Hustling Owner" value={avatar.name} onChange={(e) => { const updated = [...avatars]; updated[idx] = { ...avatar, name: e.target.value }; setAvatars(updated); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Who They Are</label>
                    <input className="form-input" placeholder="Brief description" value={avatar.description} onChange={(e) => { const updated = [...avatars]; updated[idx] = { ...avatar, description: e.target.value }; setAvatars(updated); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pain Points</label>
                    <input className="form-input" placeholder="What keeps them up at night" value={avatar.painPoints} onChange={(e) => { const updated = [...avatars]; updated[idx] = { ...avatar, painPoints: e.target.value }; setAvatars(updated); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Desires</label>
                    <input className="form-input" placeholder="What they want most" value={avatar.desires} onChange={(e) => { const updated = [...avatars]; updated[idx] = { ...avatar, desires: e.target.value }; setAvatars(updated); }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offers & Products */}
        <div className="settings-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: 0, border: 0, padding: 0 }}>💰 Offers & Products</h3>
            <button className="btn btn-secondary" onClick={() => setOffers([...offers, { id: String(Date.now()), name: "", type: "", price: "", description: "", cta: "" }])}>
              + Add Offer
            </button>
          </div>
          <div className="card-grid">
            {offers.map((offer, idx) => (
              <div key={offer.id} className="card" style={{ padding: "var(--space-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <span className={`badge ${offer.price === "Free" ? "badge-green" : "badge-orange"}`}>{offer.type || "Offer"}</span>
                  <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", color: "var(--accent-red)" }} onClick={() => setOffers(offers.filter((o) => o.id !== offer.id))}>
                    ✕
                  </button>
                </div>
                <div className="form-group" style={{ marginBottom: "var(--space-2)" }}>
                  <input className="form-input" placeholder="Offer name" value={offer.name} onChange={(e) => { const u = [...offers]; u[idx] = { ...offer, name: e.target.value }; setOffers(u); }} style={{ fontWeight: 600 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                  <input className="form-input" placeholder="Type (Lead Magnet, Program...)" value={offer.type} onChange={(e) => { const u = [...offers]; u[idx] = { ...offer, type: e.target.value }; setOffers(u); }} style={{ fontSize: "var(--text-xs)" }} />
                  <input className="form-input" placeholder="Price" value={offer.price} onChange={(e) => { const u = [...offers]; u[idx] = { ...offer, price: e.target.value }; setOffers(u); }} style={{ fontSize: "var(--text-xs)" }} />
                </div>
                <textarea className="form-textarea" rows={2} placeholder="Description" value={offer.description} onChange={(e) => { const u = [...offers]; u[idx] = { ...offer, description: e.target.value }; setOffers(u); }} style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-2)", minHeight: 60 }} />
                <input className="form-input" placeholder='CTA (e.g. Comment "AUDIT" below)' value={offer.cta} onChange={(e) => { const u = [...offers]; u[idx] = { ...offer, cta: e.target.value }; setOffers(u); }} style={{ fontSize: "var(--text-xs)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
