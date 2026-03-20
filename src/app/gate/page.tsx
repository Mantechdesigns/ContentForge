"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GateForm() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Invalid passcode");
        setPasscode("");
      }
    } catch {
      setError("Connection error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        placeholder="Enter beta access code"
        autoFocus
        style={{
          width: "100%",
          padding: "14px 18px",
          fontSize: 15,
          fontWeight: 500,
          background: "rgba(0, 0, 0, 0.35)",
          border: error ? "1.5px solid #ef4444" : "1.5px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          color: "#fff",
          outline: "none",
          letterSpacing: "3px",
          textAlign: "center",
          transition: "border 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = "rgba(249, 115, 22, 0.5)";
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
        }}
      />

      {error && (
        <p style={{
          color: "#ef4444",
          fontSize: 13,
          textAlign: "center",
          marginTop: 10,
          marginBottom: 0,
        }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !passcode.trim()}
        style={{
          width: "100%",
          padding: "14px",
          marginTop: 20,
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          background: loading ? "rgba(249, 115, 22, 0.3)" : "linear-gradient(135deg, #f97316, #ea580c)",
          border: "none",
          borderRadius: 12,
          cursor: loading ? "wait" : "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.5px",
        }}
      >
        {loading ? "Verifying..." : "Enter Content Forge →"}
      </button>
    </form>
  );
}

export default function GatePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0a0f 0%, #1a1028 40%, #0f1923 100%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        padding: "48px 40px",
        background: "rgba(26, 26, 36, 0.85)",
        backdropFilter: "blur(24px)",
        borderRadius: 20,
        border: "1px solid rgba(249, 115, 22, 0.15)",
        boxShadow: "0 32px 64px rgba(0, 0, 0, 0.5), 0 0 120px rgba(249, 115, 22, 0.05)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 40,
            marginBottom: 8,
            filter: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.4))",
          }}>🔥</div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            background: "linear-gradient(135deg, #f97316, #fb923c, #fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            letterSpacing: "-0.5px",
          }}>Content Forge</h1>
          <p style={{
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.4)",
            marginTop: 6,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}>BY MANTECH DESIGNS</p>
        </div>

        {/* Beta Badge */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{
            display: "inline-block",
            background: "rgba(249, 115, 22, 0.12)",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            color: "#f97316",
            fontSize: 11,
            fontWeight: 700,
            padding: "6px 16px",
            borderRadius: 100,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}>Private Beta</span>
        </div>

        {/* Description */}
        <p style={{
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.55)",
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          AI-powered content production platform.<br />
          Enter your beta access code to continue.
        </p>

        {/* Form wrapped in Suspense for useSearchParams */}
        <Suspense fallback={
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 20 }}>Loading...</div>
        }>
          <GateForm />
        </Suspense>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.2)",
          fontSize: 11,
          marginTop: 32,
          marginBottom: 0,
        }}>
          Need access? Contact{" "}
          <a href="mailto:mantech379@gmail.com" style={{ color: "rgba(249, 115, 22, 0.6)", textDecoration: "none" }}>
            mantech379@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
