"use client";

import { useState, FormEvent } from "react";
import type { AnalysisResult } from "./ResultsPanel";

interface ReadPolicyPanelProps {
  onResult: (r: AnalysisResult) => void;
  onLoading: (v: boolean) => void;
}

const EXAMPLES = [
  { label: "Google",     value: "https://policies.google.com/privacy" },
  { label: "TikTok",     value: "https://www.tiktok.com/legal/page/us/privacy-policy/en" },
  { label: "X / Twitter", value: "https://twitter.com/en/privacy" },
  { label: "Meta",       value: "https://www.facebook.com/privacy/policy/" },
];

export default function ReadPolicyPanel({ onResult, onLoading }: ReadPolicyPanelProps) {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [charCount, setCharCount] = useState(0);

  function fillExample(value: string) {
    const input = document.getElementById("policy-url-input") as HTMLInputElement;
    if (input) { input.value = value; setMode("url"); }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onLoading(true);
    onResult(null!);
    await new Promise((r) => setTimeout(r, 2000));
    onLoading(false);
    onResult({
      tool: "policy",
      subject: mode === "url"
        ? (document.getElementById("policy-url-input") as HTMLInputElement)?.value
        : "Pasted text",
      level: "warning",
      score: 58,
      label: "Moderate Risk — Broad Data Collection",
      analysis:
        "This policy permits sharing user data with third-party advertising partners. Data is retained for up to 36 months after account deletion. The policy uses vague language around 'service improvement' that could permit wide data usage. Some GDPR-compliant opt-out mechanisms are present.",
      flags: [
        "Data shared with advertising third parties without explicit consent",
        "Retention period extends 36 months post-deletion",
        "Vague 'service improvement' clause allows broad data use",
        "Opt-out mechanism buried in Settings > Privacy > Advanced",
      ],
      details: [
        { label: "GDPR Compliant",    value: "Partial" },
        { label: "CCPA Compliant",    value: "Yes ✓" },
        { label: "Data Retention",    value: "36 months" },
        { label: "Third-Party Share", value: "Yes ✗" },
      ],
    });
  }

  return (
    <section
      id="panel-read-policy"
      role="tabpanel"
      aria-labelledby="tab-read-policy"
      className="flex flex-col gap-5 rounded-b-2xl border border-t-0 p-7"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Analyse a Privacy Policy
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Paste a URL or raw text. Get a plain-English summary with key data
          practices and risk flags highlighted.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="inline-flex rounded-md border p-1 gap-0.5"
        style={{ background: "var(--bg-input)", borderColor: "var(--border-default)" }}
      >
        {(["url", "paste"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="flex-1 rounded px-5 py-1.5 text-sm font-medium transition-all cursor-pointer"
            style={{
              background: mode === m ? "var(--bg-elevated)" : "transparent",
              color: mode === m ? "var(--accent)" : "var(--text-secondary)",
              border: "none",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.4)" : "none",
            }}
          >
            {m === "url" ? "🔗 URL" : "📋 Paste Text"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* URL input */}
        {mode === "url" && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="policy-url-input"
              className="text-[0.75rem] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-secondary)" }}
            >
              Policy URL
            </label>
            <div
              className="flex h-12 items-center overflow-hidden rounded-lg border-[1.5px] transition-all"
              style={{ background: "var(--bg-input)", borderColor: "var(--border-default)" }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
            >
              <span className="px-3.5 text-lg opacity-50 pointer-events-none">🌐</span>
              <input
                id="policy-url-input"
                name="policy-url"
                type="url"
                placeholder="https://example.com/privacy-policy"
                autoComplete="off"
                autoCorrect="off"
                className="h-full flex-1 bg-transparent text-[1.05rem] outline-none pr-3"
                style={{ color: "var(--text-primary)", caretColor: "var(--accent)" }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Must be a publicly accessible URL
            </p>
          </div>
        )}

        {/* Paste textarea */}
        {mode === "paste" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="policy-text-input"
                className="text-[0.75rem] font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-secondary)" }}
              >
                Policy Text
              </label>
              <span
                className="font-mono text-[0.7rem] transition-colors"
                style={{ color: charCount >= 200 ? "var(--safe)" : charCount > 0 ? "var(--warning)" : "var(--text-muted)" }}
              >
                {charCount.toLocaleString()} characters
                {charCount >= 200 ? " ✓" : " (min 200)"}
              </span>
            </div>
            <textarea
              id="policy-text-input"
              name="policy-text"
              rows={12}
              placeholder={"Paste the full privacy policy or terms of service text here…\n\nTip: Select all (Ctrl+A) on the policy page, copy, then paste here."}
              onChange={(e) => setCharCount(e.target.value.length)}
              className="w-full rounded-xl border-[1.5px] p-4 text-base leading-relaxed resize-y outline-none transition-all"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                caretColor: "var(--accent)",
                minHeight: "320px",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-default)")}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Minimum 200 characters for accurate analysis
              </p>
              <button
                type="button"
                onClick={() => {
                  const ta = document.getElementById("policy-text-input") as HTMLTextAreaElement;
                  if (ta) { ta.value = ""; setCharCount(0); }
                }}
                className="text-xs border rounded px-2.5 py-1 transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)", borderColor: "var(--border-subtle)", background: "transparent" }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg py-3 text-base font-semibold transition-all cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #00b8d9, #00e5ff)",
            color: "#020d1a",
            border: "none",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "linear-gradient(135deg, #00d4ff, #40efff)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,255,0.45)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "linear-gradient(135deg, #00b8d9, #00e5ff)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          🤖 Analyze Policy
        </button>
      </form>

      {/* Examples */}
      <div className="flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
        <span className="text-[0.7rem] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Load an example
        </span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => fillExample(ex.value)}
              className="rounded px-3 py-1.5 text-[0.8rem] font-medium border transition-colors cursor-pointer"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
