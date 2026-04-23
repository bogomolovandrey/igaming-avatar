"use client";

import { useState } from "react";

import type { UiMessage } from "@/hooks/useChat";
import type { DemoEventType, Mode, SessionState } from "@/lib/types";
import { AdminBlock } from "./AdminBlock";
import { TriggerIcon } from "./TriggerIcon";

type TriggerDef = {
  id: DemoEventType;
  label: string;
  desc: string;
  kbd?: string;
};

const TRIGGERS: TriggerDef[] = [
  {
    id: "big_win",
    label: "Крупный выигрыш",
    desc: "Confetti + proactive реплика",
    kbd: "⌘1",
  },
  {
    id: "loss_streak",
    label: "Серия проигрышей 5×",
    desc: "Переход в RG care режим",
    kbd: "⌘2",
  },
  {
    id: "freebet_expiring",
    label: "Фрибет сгорает (48ч)",
    desc: "Badge в хедере + нудж",
    kbd: "⌘3",
  },
  {
    id: "show_gallery",
    label: "Галерея персонажей",
    desc: "Открывает модал с командой",
    kbd: "⌘4",
  },
  {
    id: "first_visit",
    label: "Сброс / первый визит",
    desc: "Чат и mode очищаются",
    kbd: "⌘5",
  },
];

type Props = {
  session: SessionState;
  messages: UiMessage[];
  onTrigger: (
    type: DemoEventType,
    payload?: Record<string, unknown>
  ) => void | Promise<void>;
  onInject: (text: string) => void | Promise<void>;
};

const MODE_COLOR: Record<Mode, string> = {
  onboarding: "var(--text-dim)",
  normal: "var(--text-dim)",
  celebration: "var(--gold)",
  rg_care: "var(--warn)",
  bonus_nudge: "var(--blue)",
};

export function AdminView({ session, messages, onTrigger, onInject }: Props) {
  const [activeTrigger, setActiveTrigger] = useState<DemoEventType | null>(null);
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState<Mode>("normal");
  const [injectText, setInjectText] = useState("");

  const fireTrigger = async (t: DemoEventType, payload?: Record<string, unknown>) => {
    setActiveTrigger(t);
    window.setTimeout(() => setActiveTrigger(null), 1500);
    await onTrigger(t, payload);
  };

  const fireCustom = async () => {
    const desc = custom.trim();
    if (!desc) return;
    await fireTrigger("custom", { description: desc, mode: customMode });
    setCustom("");
  };

  const fireInject = async () => {
    const text = injectText.trim();
    if (!text) return;
    await onInject(text);
    setInjectText("");
  };

  const modeColor = MODE_COLOR[session.mode];

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "12px 14px",
        background: "rgba(5,7,12,0.4)",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 16px",
          }}
        >
          <Field label="session" value={session.id} />
          <Field label="mode" value={session.mode} color={modeColor} />
          <Field
            label="balance"
            value={`$${session.player.balance.toFixed(2)}`}
            color="var(--gold)"
          />
          <Field label="loginCount" value={String(session.player.loginCount)} />
        </div>
      </div>

      <AdminBlock title="⚡ Preset triggers">
        {TRIGGERS.map((t) => (
          <TriggerButton
            key={t.id}
            t={t}
            active={activeTrigger === t.id}
            onClick={() => fireTrigger(t.id)}
          />
        ))}
      </AdminBlock>

      <AdminBlock title="📝 Custom event" collapsible defaultOpen={false}>
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Игрок только что пополнил $500"
          style={textareaStyle(60)}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <select
            value={customMode}
            onChange={(e) => setCustomMode(e.target.value as Mode)}
            className="mono"
            style={selectStyle}
          >
            <option value="normal">mode: normal</option>
            <option value="celebration">mode: celebration</option>
            <option value="rg_care">mode: rg_care</option>
            <option value="bonus_nudge">mode: bonus_nudge</option>
            <option value="onboarding">mode: onboarding</option>
          </select>
          <button onClick={fireCustom} className="btn-hover" style={primaryButton}>
            Отправить
          </button>
        </div>
      </AdminBlock>

      <AdminBlock title="💬 Inject as user" collapsible defaultOpen={false}>
        <textarea
          value={injectText}
          onChange={(e) => setInjectText(e.target.value)}
          placeholder="Реплика от имени пользователя"
          style={textareaStyle(50)}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--text-mute)",
              flex: 1,
            }}
          >
            появится в чате как user-сообщение
          </span>
          <button onClick={fireInject} className="btn-hover" style={primaryButton}>
            Отправить
          </button>
        </div>
      </AdminBlock>

      <AdminBlock title="📜 Mini transcript (last 10)" collapsible defaultOpen>
        <div
          className="mono"
          style={{
            background: "#0c1220",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            padding: "8px 10px",
            maxHeight: 160,
            overflowY: "auto",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                color: "var(--text-mute)",
                fontSize: 11,
                padding: "12px 0",
                textAlign: "center",
              }}
            >
              — нет сообщений —
            </div>
          ) : (
            messages.slice(-10).map((m, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "var(--text-dim)",
                  padding: "2px 0",
                }}
              >
                <span
                  style={{
                    color:
                      m.role === "alex"
                        ? "var(--avatar-to)"
                        : "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  {m.role}:
                </span>{" "}
                {m.text.length > 60 ? m.text.slice(0, 60) + "…" : m.text}
              </div>
            ))
          )}
        </div>
      </AdminBlock>
    </div>
  );
}

function Field({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-mute)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 13,
          color: color ?? "var(--text)",
          marginTop: 2,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TriggerButton({
  t,
  active,
  onClick,
}: {
  t: TriggerDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-hover"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: active
          ? "rgba(251,191,36,0.1)"
          : "rgba(255,255,255,0.02)",
        border: active
          ? "1px solid rgba(251,191,36,0.5)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
        textAlign: "left",
        color: "var(--text)",
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          placeItems: "center",
          color: active ? "var(--gold)" : "var(--text-dim)",
          flexShrink: 0,
        }}
      >
        <TriggerIcon id={t.id} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-mute)",
            marginTop: 2,
          }}
        >
          {t.desc}
        </div>
      </div>
      {t.kbd && (
        <div
          className="mono"
          style={{ fontSize: 10, color: "var(--text-mute)" }}
        >
          {t.kbd}
        </div>
      )}
    </button>
  );
}

const textareaStyle = (minHeight: number) => ({
  width: "100%",
  minHeight,
  padding: 10,
  background: "#0c1220",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 13,
  resize: "vertical" as const,
  fontFamily: "inherit",
});

const selectStyle = {
  flex: 1,
  background: "#0c1220",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  padding: 8,
  color: "var(--text)",
  fontSize: 12,
};

const primaryButton = {
  padding: "8px 14px",
  background: "var(--gold)",
  color: "#0a0e14",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
};
