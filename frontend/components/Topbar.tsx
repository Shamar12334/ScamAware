"use client";

import { useEffect, useRef } from "react";

// Animated SVG waveform that reacts to app state
function Waveform({ state }: { state: "idle" | "scanning" | "danger" | "safe" }) {
  const color    = state === "danger" ? "#ef4444" : state === "safe" ? "#10b981" : state === "scanning" ? "#00d4ff" : "#3d5a78";
  const speed    = state === "scanning" ? "0.8s" : state === "danger" ? "0.4s" : "2s";
  return (
    <svg width="48" height="16" viewBox="0 0 80 16" className="opacity-80">
      <polyline
        points="0,8 10,3 20,13 30,2 40,14 50,4 60,12 70,3 80,8"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: `stroke ${speed} ease`, animation: `waveform ${speed} ease-in-out infinite alternate` }}
      />
    </svg>
  );
}

export default function Topbar({ scanState = "idle" }: { scanState?: "idle" | "scanning" | "danger" | "safe" }) {
  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center border-b px-6 gap-6"
      style={{
        background: "rgba(8,10,18,0.92)",
        borderColor: "var(--border-subtle)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
      }}
    >
      {/* Brand */}
      <a href="/" className="flex items-center gap-2.5 shrink-0 no-underline group">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(159,122,234,0.2))",
            border: "1px solid var(--border-default)",
            boxShadow: "0 0 12px rgba(0,212,255,0.1)",
          }}
        >
          🛡️
        </div>
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-[0.95rem] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            PolicyPal
          </span>
          <span className="text-[0.6rem] font-medium tracking-[0.1em] uppercase" style={{ color: "var(--text-muted)" }}>
            Security Platform
          </span>
        </div>
      </a>

      {/* Center waveform — the "wow" element */}
      <div className="flex flex-1 items-center justify-center gap-3">
        <Waveform state={scanState} />
        <span className="font-mono text-[0.65rem] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          {scanState === "scanning" ? "analysing…" : scanState === "danger" ? "threat detected" : scanState === "safe" ? "all clear" : "ready"}
        </span>
        <Waveform state={scanState} />
      </div>

      {/* Status pill */}
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-medium shrink-0"
        style={{ background: "var(--safe-glow)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--safe)" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--safe)", animation: "pulse-dot 2s ease-in-out infinite" }}
        />
        Protected
      </div>

      {/* Nav buttons */}
      <nav className="flex items-center gap-1 shrink-0">
        {["Docs", "History"].map((label) => (
          <button
            key={label}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border-0"
            style={{ background: "transparent", color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            {label}
          </button>
        ))}
        <button
          className="ml-1 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)", color: "var(--cyan)" }}
        >
          ⚙️ Settings
        </button>
      </nav>
    </header>
  );
}
