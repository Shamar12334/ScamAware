"use client";

export type TabId = "check-link" | "scan-image" | "read-policy";

const TABS: { id: TabId; icon: string; label: string; desc: string; shortcut: string }[] = [
  { id: "check-link",  icon: "⬡", label: "Check Link",  desc: "URL phishing detection", shortcut: "1" },
  { id: "scan-image",  icon: "⬢", label: "Scan Image",  desc: "OCR & pattern analysis", shortcut: "2" },
  { id: "read-policy", icon: "⬡", label: "Read Policy", desc: "Policy summarisation",   shortcut: "3" },
];

const ICON_MAP: Record<TabId, string> = {
  "check-link":  "🔗",
  "scan-image":  "🖼️",
  "read-policy": "📄",
};

interface TabNavProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav
      role="tablist"
      aria-label="Analysis tools"
      className="flex overflow-hidden border-b"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
        borderRadius: "16px 16px 0 0",
        borderTop: "1px solid var(--border-subtle)",
        borderLeft: "1px solid var(--border-subtle)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {TABS.map((tab, i) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-1 flex-col items-start gap-0.5 px-5 py-4 cursor-pointer transition-all"
            style={{
              background: isActive ? "rgba(0,212,255,0.04)" : "transparent",
              border: "none",
              borderBottom: `2px solid ${isActive ? "var(--cyan)" : "transparent"}`,
              borderRight: i < TABS.length - 1 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            {/* Active glow */}
            {isActive && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)" }}
              />
            )}

            <div className="flex items-center gap-2 relative z-10">
              <span className="text-sm leading-none">{ICON_MAP[tab.id]}</span>
              <span
                className="text-[0.85rem] font-semibold tracking-tight"
                style={{ color: isActive ? "var(--cyan)" : "var(--text-secondary)" }}
              >
                {tab.label}
              </span>
              {/* Keyboard shortcut badge */}
              <span
                className="ml-auto rounded px-1.5 py-0.5 font-mono text-[0.6rem]"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                ⌘{tab.shortcut}
              </span>
            </div>
            <span
              className="text-[0.65rem] leading-none pl-6 relative z-10"
              style={{ color: isActive ? "var(--text-muted)" : "var(--text-dim)" }}
            >
              {tab.desc}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
