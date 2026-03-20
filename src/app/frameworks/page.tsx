"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";

interface CopyFramework {
  id: string;
  name: string;
  author: string;
  description: string;
  category: string;
  installed: boolean;
  components: FrameworkComponent[];
}

interface FrameworkComponent {
  name: string;
  description: string;
  template: string;
}

const PREINSTALLED_FRAMEWORKS: CopyFramework[] = [
  {
    id: "mantech-master",
    name: "ManTech Designs Master Copywriting",
    author: "ManTech Designs",
    description: "The Five Horsemen copywriting system — five battle-tested angles that generate engagement, trust, and conversions at scale. Covers contrarian, story, authority, fear-to-freedom, and tribe-builder hooks.",
    category: "Master Framework",
    installed: true,
    components: [
      {
        name: "The Contrarian",
        description: "Challenge conventional wisdom. Say what others won't.",
        template: "Everyone says [common belief]. Here's why that's killing your [result]. The truth is [contrarian take]...",
      },
      {
        name: "The War Story",
        description: "Personal battle → lesson → framework. Scar-to-wisdom arc.",
        template: "I was [painful situation]. Everything said I should [common advice]. Instead, I [unexpected action]. Here's what happened...",
      },
      {
        name: "The Authority Play",
        description: "Results-first credibility. Let numbers do the talking.",
        template: "In the last [time period], I've helped [X] businesses [specific result]. Here's the exact framework we use...",
      },
      {
        name: "Fear to Freedom",
        description: "Paint the nightmare, then show the escape route.",
        template: "If you're [pain point], you're [X days/months] away from [worst outcome]. But there's a way out...",
      },
      {
        name: "The Tribe Builder",
        description: "Us vs. Them. Create identity and belonging.",
        template: "There are two types of business owners: those who [mediocre action], and those who [elite action]. Which one are you?",
      },
    ],
  },
  {
    id: "brr-viral-hooks",
    name: "BRR Viral Hook Frameworks",
    author: "ManTech Designs",
    description: "10 proven hook frameworks that make Instagram Reels go viral. Battle-tested formulas for scroll-stopping first lines that drive views, engagement, and follows.",
    category: "Hooks & Openers",
    installed: true,
    components: [
      {
        name: "The Shocking Statement",
        description: "Open with something that makes them stop scrolling.",
        template: "[Shocking/controversial claim about their industry]. And I can prove it in [X] seconds...",
      },
      {
        name: "The Question Hook",
        description: "Ask a question they can't ignore.",
        template: "Want to know why [desirable outcome] while everyone else is [struggling with X]?",
      },
      {
        name: "The Result Hook",
        description: "Lead with proof. Numbers and specifics.",
        template: "I went from [bad state] to [amazing result] in [timeframe]. Here's the [X]-step process...",
      },
      {
        name: "The Warning Hook",
        description: "Create urgency through potential loss.",
        template: "If you're [common action], stop immediately. You're about to lose [valuable thing]...",
      },
      {
        name: "The Myth Buster",
        description: "Destroy a popular belief.",
        template: "\"[Popular advice]\" — this is the worst advice in [industry]. Here's what actually works...",
      },
    ],
  },
  {
    id: "brr-youtube-formula",
    name: "BRR Viral YouTube Formula",
    author: "ManTech Designs",
    description: "The complete YouTube viral formula system — content structure, thumbnail frameworks, and audience retention tactics.",
    category: "Long-form Video",
    installed: true,
    components: [
      {
        name: "The Promise Open",
        description: "First 3 seconds — make a promise they can't resist.",
        template: "By the end of this video, you'll know exactly how to [specific outcome] without [common sacrifice].",
      },
      {
        name: "The Loop Structure",
        description: "Open loops throughout to maintain retention.",
        template: "But before I show you that, you need to understand [setup]. And later I'll reveal [bigger payoff]...",
      },
      {
        name: "The Proof Stack",
        description: "Stack evidence: testimonials, screenshots, data.",
        template: "Don't take my word for it. Here's [Client A] who [result]. And [Client B] who [result]. And here's my own [proof]...",
      },
    ],
  },
  {
    id: "brr-offer-system",
    name: "BRR Irresistible Offer System",
    author: "ManTech Designs",
    description: "The framework for creating irresistible offers people actually want to buy. Pricing, positioning, and packaging.",
    category: "Offers & Sales",
    installed: true,
    components: [
      {
        name: "The Stack Method",
        description: "Stack value so the price feels like a steal.",
        template: "You get: [Item 1 — $X value] + [Item 2 — $X value] + [Item 3 — $X value]. Total value: $[huge number]. Your investment: $[fraction].",
      },
      {
        name: "The Instant Pitch",
        description: "60-second pitch formula for any offer.",
        template: "I help [who] achieve [result] without [sacrifice] in [timeframe]. Right now I'm offering [specific thing] for [price/free]. [CTA].",
      },
    ],
  },
  {
    id: "3cs-framework",
    name: "ManTech 3 C's Framework",
    author: "ManTech Designs",
    description: "The 3 C's — Clarity, Connection, Conversion. A systematic approach to content that builds trust and drives revenue.",
    category: "Content Strategy",
    installed: true,
    components: [
      {
        name: "Clarity",
        description: "Make the complex simple. Position as the guide, not the guru.",
        template: "Here's the simple truth about [topic] that nobody explains: [clear breakdown in plain language].",
      },
      {
        name: "Connection",
        description: "Share real stories and scars. Be human, not corporate.",
        template: "I'm going to tell you something I've never shared publicly. [Vulnerable story] → [Lesson] → [How it helps them].",
      },
      {
        name: "Conversion",
        description: "Every piece of content should lead somewhere. Always close.",
        template: "[Value delivered] → If this resonated, [soft CTA]. For [audience doing X], I created [offer]. [Action step].",
      },
    ],
  },
];

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<CopyFramework[]>(PREINSTALLED_FRAMEWORKS);
  const [expandedId, setExpandedId] = useState<string | null>("mantech-master");
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newFramework: CopyFramework = {
      id: String(Date.now()),
      name: customName,
      author: "Custom",
      description: customDesc || "Custom content framework",
      category: "Custom",
      installed: true,
      components: [
        { name: "Component 1", description: "Your first template", template: "Enter your template here..." },
      ],
    };
    setFrameworks(prev => [...prev, newFramework]);
    setCustomName("");
    setCustomDesc("");
    setShowAdd(false);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📚 Content Frameworks</h2>
            <p>Copywriting systems that drive all content generation. Install, customize, or create your own.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "Cancel" : "+ Add Framework"}
          </button>
        </div>
      </div>

      <div className="page-body fade-in">
        {/* Add Custom Framework */}
        {showAdd && (
          <div className="card" style={{ marginBottom: "var(--space-6)", border: "1px solid var(--accent-primary)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>New Framework</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label className="form-label">Framework Name</label>
                <input className="form-input" placeholder="e.g. Russell Brunson's Story Selling" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="What this framework does" value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} />
              </div>
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
              💡 You can also paste output from a custom GPT here — the AI will parse it into framework components.
            </p>
            <button className="btn btn-primary" onClick={handleAddCustom} disabled={!customName.trim()}>
              Install Framework
            </button>
          </div>
        )}

        {/* Active count */}
        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          <span className="badge badge-green">{frameworks.filter(f => f.installed).length} Active</span>
          <span className="badge badge-blue">{frameworks.reduce((n, f) => n + f.components.length, 0)} Components</span>
        </div>

        {/* Framework List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {frameworks.map((fw) => (
            <div key={fw.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Header */}
              <div
                style={{
                  padding: "var(--space-5) var(--space-6)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => toggleExpand(fw.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: "var(--radius-md)",
                    background: fw.author === "ManTech Designs" ? "var(--accent-primary-glow)" : "rgba(59,130,246,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem",
                  }}>
                    {fw.category === "Master Framework" ? "🏆" :
                     fw.category === "Hooks & Openers" ? "🎣" :
                     fw.category === "Long-form Video" ? "🎬" :
                     fw.category === "Offers & Sales" ? "💰" :
                     fw.category === "Content Strategy" ? "📐" : "📝"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{fw.name}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {fw.author} • {fw.components.length} templates • {fw.category}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  {fw.installed && <span className="badge badge-green">Active</span>}
                  <span style={{ color: "var(--text-muted)", fontSize: "var(--text-lg)", transition: "transform var(--transition-fast)", transform: expandedId === fw.id ? "rotate(180deg)" : "rotate(0)" }}>
                    ▾
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === fw.id && (
                <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "var(--space-5) var(--space-6)" }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-5)", lineHeight: 1.6 }}>
                    {fw.description}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {fw.components.map((comp, i) => (
                      <div key={i} style={{
                        background: "var(--bg-input)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4)",
                        border: "1px solid var(--border-subtle)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{comp.name}</span>
                          <span className="badge badge-purple" style={{ fontSize: "10px" }}>Template</span>
                        </div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>{comp.description}</p>
                        <div style={{
                          background: "var(--bg-primary)",
                          borderRadius: "var(--radius-sm)",
                          padding: "var(--space-3)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-xs)",
                          color: "var(--accent-secondary)",
                          lineHeight: 1.6,
                          borderLeft: "3px solid var(--accent-primary)",
                        }}>
                          {comp.template}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                    <button className="btn btn-secondary" style={{ fontSize: "var(--text-xs)" }}>
                      ✏️ Edit Templates
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", color: "var(--accent-red)" }} onClick={() => setFrameworks(prev => prev.filter(f => f.id !== fw.id))}>
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
