"use client";

import { useState, useRef } from "react";
import type { AnalysisResult } from "./ResultsPanel";

interface ScanImagePanelProps {
  onResult:  (r: AnalysisResult) => void;
  onLoading: (v: boolean) => void;
}

export default function ScanImagePanel({ onResult, onLoading }: ScanImagePanelProps) {
  const [preview, setPreview]   = useState<{ url: string; name: string; size: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const size = file.size < 1_000_000 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / 1_000_000).toFixed(1)} MB`;
    setPreview({ url: URL.createObjectURL(file), name: file.name, size });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) return;
    setScanning(true);
    onLoading(true);
    onResult(null!);
    await new Promise((r) => setTimeout(r, 2200));
    setScanning(false);
    onLoading(false);
    onResult({
      tool: "image", subject: preview.name, level: "danger", score: 74,
      label: "High Risk — Phishing Patterns Detected",
      analysis: "The screenshot contains urgency language, a spoofed sender address, and an embedded URL that doesn't match the claimed brand domain. The formatting mirrors known PayPal phishing templates detected in Q1 2026.",
      flags: ["Urgency phrase: 'Your account will be suspended in 24 hours'", "Embedded URL domain mismatch — claims PayPal, links elsewhere", "Generic salutation with no personalisation", "Requests credentials via email link"],
      details: [{ label: "Text Extracted", value: "412 chars" }, { label: "URLs Found", value: "2" }, { label: "Brand Spoofed", value: "PayPal" }, { label: "Confidence", value: "91%" }],
    });
  }

  return (
    <section
      id="panel-scan-image"
      role="tabpanel"
      aria-labelledby="tab-scan-image"
      className="flex flex-col gap-6 p-6 border border-t-0 rounded-b-2xl"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
    >
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>Screenshot Scanner</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Upload an image of a suspicious email, SMS, or webpage.
          PolicyPal extracts text via OCR and identifies phishing patterns.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Drop zone */}
        {!preview && (
          <div
            role="button" tabIndex={0}
            aria-label="Drop image or click to browse"
            className="relative flex min-h-[300px] cursor-pointer select-none items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300"
            style={{
              borderColor: dragging ? "var(--cyan)" : "var(--border-default)",
              background: dragging ? "rgba(0,212,255,0.04)" : "var(--bg-input)",
              boxShadow: dragging ? "0 0 0 4px rgba(0,212,255,0.08), inset 0 0 60px rgba(0,212,255,0.02)" : "none",
            }}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            {/* Scan line animation when dragging */}
            {dragging && (
              <div
                className="pointer-events-none absolute left-0 right-0 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--cyan), transparent)",
                  boxShadow: "0 0 8px var(--cyan)",
                  animation: "scan-line 1.2s linear infinite",
                }}
              />
            )}

            <div className="flex flex-col items-center gap-4 px-8 text-center">
              {/* Icon ring */}
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300"
                style={{
                  background: dragging ? "rgba(0,212,255,0.1)" : "var(--bg-elevated)",
                  borderColor: dragging ? "var(--cyan)" : "var(--border-default)",
                  boxShadow: dragging ? "0 0 24px rgba(0,212,255,0.2)" : "none",
                  fontSize: "1.8rem",
                }}
              >
                {dragging ? "⬇️" : "🖼️"}
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {dragging ? "Drop to scan" : "Drop screenshot here"}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Supports email, SMS, and browser screenshots
                </p>
              </div>
              <label
                className="rounded-lg border px-5 py-2 text-sm font-semibold transition-all cursor-pointer"
                style={{ borderColor: "var(--border-default)", color: "var(--cyan)", background: "var(--bg-elevated)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--cyan)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
              >
                📂 Browse Files
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
              <p className="font-mono text-[0.65rem]" style={{ color: "var(--text-dim)" }}>
                PNG · JPG · WEBP · GIF &nbsp;|&nbsp; max 10 MB
              </p>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-default)", background: "var(--bg-input)" }}>
            {/* Scan line overlay while scanning */}
            {scanning && (
              <div className="relative overflow-hidden h-1">
                <div
                  className="absolute left-0 right-0 h-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--cyan), transparent)",
                    animation: "scan-line 1s linear infinite",
                  }}
                />
              </div>
            )}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ color: "var(--cyan)" }}>🖼️</span>
                <span className="font-mono text-xs truncate" style={{ color: "var(--text-secondary)" }}>{preview.name}</span>
                <span className="shrink-0 text-[0.65rem]" style={{ color: "var(--text-muted)" }}>{preview.size}</span>
              </div>
              <button type="button" onClick={() => setPreview(null)}
                className="shrink-0 rounded border px-2.5 py-1 text-[0.7rem] font-medium cursor-pointer transition-colors"
                style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--danger)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                ✕ Remove
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt="Preview" className="block max-h-52 w-full object-contain" />
          </div>
        )}

        <button type="submit" disabled={!preview}
          className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold tracking-widest transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0099bb, #00d4ff, #40efff)", color: "#020d1a", border: "none" }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.boxShadow = "0 0 24px rgba(0,212,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          🔍 ANALYSE SCREENSHOT
        </button>
      </form>

      {/* Examples */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest mr-1" style={{ color: "var(--text-dim)" }}>Examples:</span>
        {["📧 Phishing email", "📱 Fake SMS", "🌐 Fake login"].map(l => (
          <button key={l} type="button"
            className="rounded-md border px-2.5 py-1 text-[0.72rem] font-medium cursor-pointer transition-colors"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-glow)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
          >{l}</button>
        ))}
      </div>
    </section>
  );
}
