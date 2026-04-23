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

export function MobileWidget({
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
      className={"slide-up" + rgClass}
      style={{
        position: "fixed",
        top: 52,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-alt)",
        zIndex: 30,
      }}
    >
      <WidgetHeader mobile onClose={onClose} />
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
