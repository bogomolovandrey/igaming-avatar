"use client";

export type WidgetTab = "chat" | "admin";

type Props = {
  tab: WidgetTab;
  setTab: (t: WidgetTab) => void;
};

const TABS: { id: WidgetTab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "admin", label: "⚙ Admin" },
];

export function WidgetTabs({ tab, setTab }: Props) {
  return (
    <div
      style={{
        display: "flex",
        padding: "0 16px",
        gap: 18,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 2px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: active ? "var(--gold)" : "var(--text-mute)",
              borderBottom: active
                ? "2px solid var(--gold)"
                : "2px solid transparent",
              marginBottom: -1,
              transition: "all 160ms ease",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
