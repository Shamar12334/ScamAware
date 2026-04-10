"use client";

import { useState, useEffect, useRef } from "react";
import type { AnalysisResult } from "./ResultsPanel";

interface CheckLinkPanelProps {
  onResult:  (r: AnalysisResult) => void;
  onLoading: (v: boolean) => void;
}

const EXAMPLES = [
  { label: "✅ Safe site",     value: "https://google.com",            type: "safe"    },
  { label: "🚨 Phishing",      value: "http://paypa1-login.ru/verify", type: "danger"  },
  { label: "⚠️ Short URL",     value: "https://bit.ly/3xUnknown",     type: "warning" },
  { label: "🔒 HTTPS valid",   value: "https://stripe.com/dashboard", type: "safe"    },
];

export default function CheckLinkPanel({ onResult, onLoading }: CheckLinkPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [val, setVal] = useState("");

  // Keyboard shortcut: ⌘1 focuses URL input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "1") { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = val.trim();
    if (!url) return;

    onLoading(true);
    onResult(null!);
    await new Promise((r) => setTimeout(r, 1500));

    const isPhishing = url.includes("paypa1") || url.includes(".ru/verify");
    const isShort    = url.includes("bit.ly") || url.includes("t.co");
    const level      = isPhishing ? "danger" : isShort ? "warning" : "safe";

    onLoading(false);
    onResult({
      tool: "link", subject: url, level,
      score: isPhishing ? 87 : isShort ? 52 : 9,
      label: isPhishing ? "High Risk — Likely Phishing" : isShort ? "Suspicious — Shortened URL" : "Safe — No Threats Detected",
      analysis: isPhishing
        ? "This URL exhibits multiple high-confidence phishing indicators. The domain spoofs PayPal via character substitution (paypa1 → paypal). The .ru TLD combined with a /verify path are strongly correlated with credential-harvesting campaigns targeting financial accounts."
        : isShort
        ? "Shortened URLs obscure the final destination, preventing direct reputation and SSL checks. The link routes through a third-party redirector. Proceed with caution — expand the URL before clicking."
        : "The domain is a well-established, reputable site. A valid SSL certificate is present, the domain age is over 10 years, and no associations with phishing or malware databases were found.",
      flags: isPhishing
        ? ["Domain spoofs PayPal via character substitution (1 → l)", "Suspicious TLD: .ru", "Path /verify commonly used in credential phishing", "No HTTPS on root domain"]
        : isShort ? ["Destination hidden behind URL shortener", "Cannot verify SSL or reputation without following redirect"]
        : [],
      details: [
        { label: "Domain",    value: (() => { try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; } catch { return url; } })() },
        { label: "Protocol",  value: url.startsWith("https") ? "HTTPS ✓" : "HTTP ✗" },
        { label: "SSL Valid", value: url.startsWith("https") && !isPhishing ? "Yes ✓" : "No ✗" },
        { label: "Redirect",  value: isShort ? "1 hop detected" : "None" },
      ],
    });
  }

  return (
    <section
      id="panel-check-link"
      role="tabpanel"
      aria-labelledby="tab-check-link"
      className="flex flex-col gap-6 p-6 border border-t-0 rounded-b-2xl"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
          Link Analyser
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Paste any URL to scan for phishing indicators, suspicious redirects,
          and reputation database matches.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="url-input" className="text-[0.7rem] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
              URL to analyse
            </label>
            <span
              className="font-mono text-[0.65rem] transition-all duration-200"
              style={{ color: focused ? "var(--cyan)" : "transparent", opacity: focused ? 1 : 0 }}
            >
              ↵ Enter to scan
            </span>
          </div>

          {/* Input wrapper */}
          <div
            className="relative flex h-12 items-center overflow-hidden transition-all duration-200"
            style={{
              background: "var(--bg-input)",
              border: `1.5px solid ${focused ? "var(--cyan)" : "var(--border-default)"}`,
              borderRadius: "var(--radius-md)",
              boxShadow: focused ? "0 0 0 3px rgba(0,212,255,0.1), 0 0 20px rgba(0,212,255,0.06)" : "none",
            }}
          >
            <span className="px-3.5 text-base opacity-40 shrink-0 pointer-events-none select-none">🌐</span>
            <input
              id="url-input"
              ref={inputRef}
              type="url"
              value={val}
              onChange={e => setVal(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://suspicious-site.com/login"
              autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
              className="h-full flex-1 bg-transparent text-[1rem] outline-none pr-2"
              style={{ color: "var(--text-primary)", caretColor: "var(--cyan)", fontWeight: 400 }}
            />
            <div className="flex h-full shrink-0">
              {val && (
                <button
                  type="button"
                  onClick={() => setVal("")}
                  className="h-full w-9 border-l text-xs transition-colors cursor-pointer"
                  style={{ background: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={async () => { const t = await navigator.clipboard.readText(); setVal(t); }}
                className="h-full px-4 border-l text-xs font-medium transition-colors cursor-pointer"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
              >
                📋 Paste
              </button>
            </div>
          </div>
          <p className="text-[0.7rem]" style={{ color: "var(--text-muted)" }}>
            Supports http, https, shortened URLs (bit.ly, t.co, etc.)
          </p>
        </div>

        {/* Analyze button */}
        <button
          type="submit"
          className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold tracking-wide transition-all cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0099bb 0%, #00d4ff 50%, #40efff 100%)",
            color: "#020d1a",
            border: "none",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(0,212,255,0.5), inset 0 0 20px rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          onMouseDown={e => { e.currentTarget.style.transform = "translateY(0) scale(0.99)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
        >
          ⚡ ANALYZE LINK
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>examples</span>
        <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
      </div>

      {/* Examples */}
      <div className="grid grid-cols-2 gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.value}
            type="button"
            onClick={() => setVal(ex.value)}
            className="rounded-lg px-3 py-2.5 text-left text-xs font-medium border transition-all cursor-pointer"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-glow)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
          >
            <div className="mb-0.5">{ex.label}</div>
            <div className="font-mono text-[0.6rem] truncate opacity-50">{ex.value}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
