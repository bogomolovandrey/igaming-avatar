"use client";

import type { ChatHook } from "@/hooks/useChat";
import type { VoiceHook } from "@/hooks/useVoice";
import type { DemoEventType, SessionState } from "@/lib/types";
import { AdminView } from "../AdminView/AdminView";
import { ChatView } from "../ChatView/ChatView";
import { InputBar } from "./InputBar";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetTabs, type WidgetTab } from "./WidgetTabs";

type Props = {
  session: SessionState;
  chat: ChatHook;
  tab: WidgetTab;
  setTab: (t: WidgetTab) => void;
  onClose: () => void;
  onTrigger: (
    type: DemoEventType,
    payload?: Record<string, unknown>
  ) => void | Promise<void>;
  onInject: (text: string) => void | Promise<void>;
  voice?: VoiceHook;
};

export function DesktopWidget({
  session,
  chat,
  tab,
  setTab,
  onClose,
  onTrigger,
  onInject,
  voice,
}: Props) {
  const rgClass = session.mode === "rg_care" ? " rg-glow" : "";
  return (
    <div
      className={"sidebar-enter" + rgClass}
      style={{
        width: 400,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-alt)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        height: "100vh",
      }}
    >
      <WidgetHeader onClose={onClose} />
      <WidgetTabs tab={tab} setTab={setTab} />
      {tab === "chat" ? (
        <ChatView
          messages={chat.messages}
          streamingText={chat.streamingText}
          streaming={chat.streaming}
          micActive={voice?.micActive}
          interim={voice?.interim}
          mode={session.mode}
        />
      ) : (
        <AdminView
          session={session}
          messages={chat.messages}
          onTrigger={onTrigger}
          onInject={onInject}
        />
      )}
      <InputBar
        onSend={chat.send}
        disabled={chat.streaming}
        micActive={voice?.micActive}
        interim={voice?.interim}
        onMicDown={voice?.startListening}
        onMicUp={voice?.stopListening}
      />
    </div>
  );
}
