"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import TabNav, { type TabId } from "@/components/TabNav";
import CheckLinkPanel from "@/components/CheckLinkPanel";
import ScanImagePanel from "@/components/ScanImagePanel";
import ReadPolicyPanel from "@/components/ReadPolicyPanel";
import ResultsPanel, { type AnalysisResult } from "@/components/ResultsPanel";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("check-link");
  const [result, setResult]       = useState<AnalysisResult | null>(null);
  const [loading, setLoading]     = useState(false);

  // Derive waveform state from result + loading
  const scanState = loading ? "scanning"
    : result?.level === "danger"  ? "danger"
    : result?.level === "safe"    ? "safe"
    : "idle";

  function handleTabChange(id: TabId) {
    setActiveTab(id);
    setResult(null);
    setLoading(false);
  }

  const panelProps = { onResult: setResult, onLoading: setLoading };

  return (
    <>
      <Topbar scanState={scanState} />

      <main className="mx-auto max-w-[1360px] px-12 py-10 pb-24">
        {/* Page intro */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-5"
            style={{ background: "rgba(0,212,255,0.05)", borderColor: "var(--border-default)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cyan)", boxShadow: "0 0 6px var(--cyan)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span className="font-mono text-[0.65rem] tracking-widest uppercase" style={{ color: "var(--cyan)" }}>
              AI-Powered Security Analysis
            </span>
          </div>
          <h1
            className="text-[2.5rem] font-bold tracking-[-0.04em] mb-3 leading-tight"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #7dd3fc 40%, var(--cyan) 70%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Security Analysis Dashboard
          </h1>
          <p className="mx-auto max-w-[480px] text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Paste a link, upload a screenshot, or drop in a privacy policy —
            get an instant AI-powered risk assessment.
          </p>
        </section>

        {/* 1fr / 1fr grid */}
        <div className="grid grid-cols-2 gap-8 items-start">

          {/* LEFT column — tab nav + active panel (sticky) */}
          <div className="flex flex-col" style={{ position: "sticky", top: "80px" }}>
            <TabNav active={activeTab} onChange={handleTabChange} />
            {activeTab === "check-link"  && <CheckLinkPanel  {...panelProps} />}
            {activeTab === "scan-image"  && <ScanImagePanel  {...panelProps} />}
            {activeTab === "read-policy" && <ReadPolicyPanel {...panelProps} />}
          </div>

          {/* RIGHT column — results (sticky) */}
          <ResultsPanel result={result} loading={loading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-12">
          <div className="flex items-center gap-2">
            <span className="text-sm">🛡️</span>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              © 2026 PolicyPal — Built to keep you safer online.
            </p>
          </div>
          <nav className="flex gap-5">
            {["Privacy Policy", "Terms", "Report a Bug", "API Docs"].map((link) => (
              <a key={link} href="#" className="text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--cyan)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                {link}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
