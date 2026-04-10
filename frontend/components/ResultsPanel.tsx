"use client";

import { useState, useEffect, useRef } from "react";
import type { AnalysisResult } from "./ResultsPanel";

interface ResultsPanelProps {
  result:  AnalysisResult | null;
  loading: boolean;
}

const LEVEL = {
  safe:    { bg: "rgba(16,185,129,.08)",  border: "rgba(16,185,129,.2)",  color: "var(--safe)",    icon: "✅", label: "safe" },
  warning: { bg: "rgba(245,158,11,.08)",  border: "rgba(245,158,11,.2)",  color: "var(--warning)", icon: "⚠️", label: "warning" },
  danger:  { bg: "rgba(239,68,68,.08)",   border: "rgba(239,68,68,.25)",  color: "var(--danger)",  icon: "🚨", label: "danger" },
};

const BAR_GRAD = {
  safe:    "linear-gradient(90deg, #059669, #10b981, #34d399)",
  warning: "linear-gradient(90deg, #d97706, #f59e0b, #fcd34d)",
  danger:  "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
};

// Typewriter hook
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    ref.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length && ref.current) clearInterval(ref.current);
    }, speed);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [text, speed]);

  return displayed;
}

// Animated score counter
function useCounter(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

export interface AnalysisResult {
  tool:     "link" | "image" | "policy";
  subject:  string;
  level:    "safe" | "warning" | "danger";
  score:    number;
  label:    string;
  analysis: string;
  flags:    string[];
  details:  { label: string; value: string }[];
}

export default function ResultsPanel({ result, loading }: ResultsPanelProps) {
  const typedAnalysis = useTypewriter(result?.analysis ?? "");
  const animScore     = useCounter(result?.score ?? 0);

  return (
    <div
      className="flex flex-col rounded-2xl border transition-all duration-300"
      style={{
        background: "var(--bg-card)",
        borderColor: result ? "var(--border-active)" : "var(--border-subtle)",
        boxShadow: result ? "0 0 40px rgba(0,212,255,0.06)" : "none",
        minHeight: "560px",
        position: "sticky",
        top: "80px",
      }}
    >
      {/* Top chrome bar */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b rounded-t-2xl"
        style={{ borderColor: "var(--border-subtle)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <span className="ml-2 font-mono text-[0.65rem] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          {result ? `analysis — ${result.tool}` : "analysis panel"}
        </span>
        {result && (
          <span
            className="ml-auto rounded-full px-2 py-0.5 font-mono text-[0.6rem]"
            style={{ background: LEVEL[result.level].bg, color: LEVEL[result.level].color, border: `1px solid ${LEVEL[result.level].border}` }}
          >
            {LEVEL[result.level].label}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--border-default)", borderTopColor: "var(--cyan)" }} />
              <div className="absolute inset-0 flex items-center justify-center text-lg">🛡️</div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium animate-pulse" style={{ color: "var(--cyan)" }}>Scanning…</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Checking reputation databases</p>
            </div>
          </div>
        )}

        {/* Placeholder */}
        {!loading && !result && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center px-6">
            <div className="text-5xl opacity-15" style={{ animation: "float-icon 4s ease-in-out infinite" }}>🛡️</div>
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                Results will appear here
              </h3>
              <p className="text-sm leading-relaxed max-w-[260px] mx-auto" style={{ color: "var(--text-muted)" }}>
                Choose a tool on the left, enter your data, and click Analyze.
              </p>
            </div>
            <div className="w-full max-w-[240px] rounded-xl border p-4 text-left" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
              {["⚡ Sub-second AI analysis", "🔍 Red flag extraction", "📊 Risk scoring 0–100", "🚩 Detailed threat breakdown"].map(f => (
                <div key={f} className="font-mono text-[0.65rem] py-1" style={{ color: "var(--text-muted)" }}>{f}</div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && result && (() => {
          const s = LEVEL[result.level];
          return (
            <div className="flex flex-col gap-5" style={{ animation: "slide-up 300ms ease both" }}>

              {/* Risk banner */}
              <div className="flex items-center gap-4 rounded-xl px-4 py-3.5 border" style={{ background: s.bg, borderColor: s.border }}>
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm" style={{ color: s.color }}>{result.label}</p>
                  <p className="font-mono text-[0.65rem] mt-0.5 truncate opacity-60" style={{ color: s.color, maxWidth: "320px" }}>
                    {result.subject}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Risk Score</span>
                  <span className="font-mono text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {animScore}
                    <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/100</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-elevated)" }}
                  role="progressbar" aria-valuenow={result.score} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.score}%`, background: BAR_GRAD[result.level], boxShadow: `0 0 8px ${s.color}` }} />
                </div>
                <div className="flex justify-between font-mono text-[0.6rem]" style={{ color: "var(--text-dim)" }}>
                  <span>0 Safe</span><span>50 Suspicious</span><span>100 Dangerous</span>
                </div>
              </div>

              {/* AI analysis — typewriter */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs">🤖</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>AI Analysis</span>
                  <span className="font-mono text-[0.6rem] ml-auto" style={{ color: "var(--text-dim)" }}>
                    {typedAnalysis.length < (result.analysis?.length ?? 0) ? "typing…" : "done ✓"}
                  </span>
                </div>
                <div className="rounded-xl border p-4 font-mono text-xs leading-[1.8]"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                  {typedAnalysis}
                  {typedAnalysis.length < (result.analysis?.length ?? 0) && (
                    <span className="border-r-2 ml-0.5 animate-pulse" style={{ borderColor: "var(--cyan)" }}>&nbsp;</span>
                  )}
                </div>
              </div>

              {/* Red flags */}
              {result.flags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-xs">🚩</span>
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                      Red Flags ({result.flags.length})
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {result.flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-snug"
                        style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.15)", color: "var(--text-primary)", animation: `slide-up ${200 + i * 80}ms ease both` }}>
                        <span className="shrink-0 mt-0.5" style={{ color: "var(--danger)" }}>⚑</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.flags.length === 0 && (
                <p className="font-mono text-xs" style={{ color: "var(--safe)" }}>✓ No red flags detected</p>
              )}

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-2">
                {result.details.map((d, i) => (
                  <div key={d.label} className="rounded-xl border p-3"
                    style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", animation: `slide-up ${300 + i * 60}ms ease both` }}>
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: "var(--text-muted)" }}>{d.label}</p>
                    <p className="font-mono text-xs font-semibold break-all" style={{ color: "var(--text-primary)" }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
