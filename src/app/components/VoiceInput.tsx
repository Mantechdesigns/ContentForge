"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  /** Called with transcribed text to append/set into the target field */
  onTranscript: (text: string) => void;
  /** Optional: size of button */
  size?: "sm" | "md";
  /** Optional: custom label */
  label?: string;
}

/* ───── Extend Window for Web Speech API types ───── */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

/**
 * VoiceInput — Scalable voice-to-text input.
 *
 * Strategy (designed for thousands of concurrent users):
 *  1. **Browser Web Speech API** (DEFAULT) — free, runs entirely on user's
 *     device, no API calls, no server cost, no rate limits. Works on Chrome,
 *     Edge, Safari, and most modern browsers.
 *  2. **Groq Whisper** (FALLBACK) — only used if browser API unavailable
 *     (e.g. Firefox) AND server key is configured. In production, each user
 *     would supply their own API key via Settings.
 *
 * This means:
 *  - 0 cost per user for voice input on Chrome/Edge/Safari (~95% of users)
 *  - Full scalability: no shared API key bottleneck
 *  - Graceful fallback for unsupported browsers
 */
export default function VoiceInput({ onTranscript, size = "md", label }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"browser" | "whisper" | "none">("none");

  // Browser Speech API ref
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // MediaRecorder fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Detect which mode is available on mount + cleanup on unmount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setMode("browser");
    } else if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      setMode("whisper");
    } else {
      setMode("none");
    }

    return () => {
      // Abort any active browser recognition on unmount
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      // Stop any active media recorder on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  /* ───── Browser Web Speech API (free, client-side) ───── */
  const startBrowserRecognition = useCallback(() => {
    setError("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(event.error === "not-allowed" ? "Microphone access denied" : `Error: ${event.error}`);
      }
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopBrowserRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
  }, []);

  /* ───── Groq Whisper fallback (server-side) ───── */
  const startWhisperRecording = useCallback(async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        if (chunksRef.current.length === 0) { setError("No audio captured"); return; }
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (audioBlob.size < 1000) { setError("Recording too short"); return; }

        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Transcription failed");
          }
          const data = await res.json();
          if (data.text) onTranscript(data.text);
          else setError("No speech detected");
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setRecording(true);
    } catch {
      setError("Microphone access denied");
    }
  }, [onTranscript]);

  const stopWhisperRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  /* ───── Toggle ───── */
  const toggleRecording = useCallback(() => {
    if (recording) {
      if (mode === "browser") stopBrowserRecognition();
      else stopWhisperRecording();
    } else {
      if (mode === "browser") startBrowserRecognition();
      else if (mode === "whisper") startWhisperRecording();
      else setError("Voice input not available in this browser");
    }
  }, [recording, mode, startBrowserRecognition, stopBrowserRecognition, startWhisperRecording, stopWhisperRecording]);

  if (mode === "none") return null; // Hide if no voice support

  const btnSize = size === "sm" ? 36 : 44;
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={toggleRecording}
        disabled={transcribing}
        title={recording ? "Stop recording" : label || `Voice input — click to speak (${mode === "browser" ? "free, on-device" : "Groq Whisper"})`}
        style={{
          width: btnSize, height: btnSize, borderRadius: "50%",
          border: recording ? "2px solid #ef4444" : "2px solid var(--border-default)",
          background: recording ? "rgba(239, 68, 68, 0.15)"
            : transcribing ? "rgba(6, 182, 212, 0.15)"
            : "rgba(255,255,255,0.05)",
          color: recording ? "#ef4444" : transcribing ? "#06b6d4" : "var(--text-muted)",
          cursor: transcribing ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
          animation: recording ? "pulse-mic 1.5s ease-in-out infinite" : "none",
          flexShrink: 0,
        }}
      >
        {transcribing ? (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : recording ? (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        )}
      </button>

      {recording && (
        <span style={{ fontSize: "var(--text-xs)", color: "#ef4444", fontWeight: 600, animation: "pulse-mic 1.5s ease-in-out infinite" }}>
          ● {mode === "browser" ? "Listening..." : "Recording..."}
        </span>
      )}

      {transcribing && (
        <span style={{ fontSize: "var(--text-xs)", color: "#06b6d4", fontWeight: 500 }}>
          Transcribing...
        </span>
      )}

      {error && (
        <span style={{ fontSize: "var(--text-xs)", color: "#ef4444" }}>
          {error}
        </span>
      )}

      <style>{`
        @keyframes pulse-mic {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
