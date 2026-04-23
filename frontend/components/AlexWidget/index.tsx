"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAdmin } from "@/hooks/useAdmin";
import { useChat } from "@/hooks/useChat";
import { useEvents, type UiHint } from "@/hooks/useEvents";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSession } from "@/hooks/useSession";
import { useVoice } from "@/hooks/useVoice";
import { createSentenceStreamer } from "@/lib/sentence-streamer";
import type { Bonus } from "@/lib/types";
import { BookmakerPage } from "../BookmakerPage";
import { Confetti } from "../Confetti";
import { CharacterGallery } from "../CharacterGallery/Gallery";
import { CollapsedWidget } from "./CollapsedWidget";
import { DesktopWidget } from "./DesktopWidget";
import { MobileWidget } from "./MobileWidget";
import type { WidgetTab } from "./WidgetTabs";

type ProactiveBubble = { text: string; key: number };

export function AppShell() {
  const { session, setSession, error } = useSession();
  const chat = useChat(session?.id ?? null);
  const { trigger, inject } = useAdmin(session?.id ?? null);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<WidgetTab>("chat");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [balanceFlash, setBalanceFlash] = useState(false);
  const [bubble, setBubble] = useState<ProactiveBubble | null>(null);
  const lastVoiceUseRef = useRef(0);

  const voice = useVoice({
    onUserFinal: (text) => {
      lastVoiceUseRef.current = Date.now();
      const streamer = createSentenceStreamer();
      chat
        .send(text, {
          onDelta: (delta) => {
            const chunks = streamer.push(delta);
            for (const c of chunks) voice.enqueueSpeak(c);
          },
          onFinish: () => {
            const tail = streamer.flush();
            for (const c of tail) voice.enqueueSpeak(c);
          },
        })
        .catch(() => undefined);
    },
  });

  // Expose a wrapped send for the text input that streams into TTS only
  // when the user has been talking via voice recently.
  const sendFromTextInput = useCallback(
    async (text: string) => {
      const recentlyUsedVoice =
        Date.now() - lastVoiceUseRef.current < 30_000;
      if (!recentlyUsedVoice) {
        await chat.send(text);
        return;
      }
      const streamer = createSentenceStreamer();
      await chat.send(text, {
        onDelta: (delta) => {
          const chunks = streamer.push(delta);
          for (const c of chunks) voice.enqueueSpeak(c);
        },
        onFinish: () => {
          const tail = streamer.flush();
          for (const c of tail) voice.enqueueSpeak(c);
        },
      });
    },
    [chat, voice]
  );

  // Sentence streamer for proactive replies (triggers / inject)
  const proactiveStreamerRef = useRef(createSentenceStreamer());

  const showBubbleOnce = useCallback(
    (text: string) => {
      if (!text || open) return;
      const key = Date.now();
      setBubble({ text, key });
      window.setTimeout(() => {
        setBubble((prev) => (prev && prev.key === key ? null : prev));
      }, 7000);
    },
    [open]
  );

  const handleUiHint = useCallback(
    (hint: UiHint) => {
      switch (hint.kind) {
        case "celebration":
          setConfetti((c) => c + 1);
          setBalanceFlash(true);
          window.setTimeout(() => setBalanceFlash(false), 1900);
          break;
        case "rg_care_enter":
          break;
        case "freebet_nudge":
          break;
        case "open_gallery":
          setGalleryOpen(true);
          break;
        case "reset":
          chat.reset();
          setBubble(null);
          break;
      }
    },
    [chat]
  );

  useEvents(session?.id ?? null, {
    onState: (s) => {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              mode: s.mode,
              player: {
                ...prev.player,
                balance: s.balance,
                loginCount: s.loginCount,
                activeBonuses: s.activeBonuses,
              },
            }
          : prev
      );
    },
    onUiHint: handleUiHint,
    onAlexMessageStart: () => {
      proactiveStreamerRef.current.reset();
      voice.cancelSpeak();
      chat.startProactive();
    },
    onAlexMessageDelta: (delta) => {
      chat.appendDelta(delta);
      const chunks = proactiveStreamerRef.current.push(delta);
      for (const c of chunks) voice.enqueueSpeak(c);
    },
    onAlexMessageDone: (text) => {
      const tail = proactiveStreamerRef.current.flush();
      for (const c of tail) voice.enqueueSpeak(c);
      chat.finishProactive(text);
      showBubbleOnce(text.length > 140 ? text.slice(0, 137) + "…" : text);
    },
    onUserMessage: (text) => chat.appendUser(text),
    onError: (err) => {
      chat.finishProactive(`Что-то пошло не так: ${err}`);
    },
  });

  const balance = session?.player.balance ?? 840;
  const freebet = activeFreebet(session?.player.activeBonuses);
  const freebetBadge = freebet
    ? {
        amount: freebet.amount,
        expiresInLabel: hoursLeftLabel(freebet.expiresAt),
      }
    : null;

  // Wrap chat exposed to widgets so the desktop/mobile InputBar uses our
  // text→TTS send wrapper.
  const wrappedChat = useMemo(
    () => ({ ...chat, send: sendFromTextInput }),
    [chat, sendFromTextInput]
  );

  return (
    <div className="app-shell" style={{ display: "flex" }}>
      <BookmakerPage
        balance={balance}
        balanceFlash={balanceFlash}
        freebetBadge={freebetBadge}
        sessionId={session?.id}
        onPanelClick={() => {
          setOpen(true);
          setTab("admin");
        }}
      />

      {!isMobile && open && session && (
        <DesktopWidget
          session={session}
          chat={wrappedChat}
          tab={tab}
          setTab={setTab}
          onClose={() => setOpen(false)}
          onTrigger={trigger}
          onInject={inject}
          voice={voice}
        />
      )}

      {isMobile && open && session && (
        <MobileWidget
          session={session}
          chat={wrappedChat}
          tab={tab}
          setTab={setTab}
          onClose={() => setOpen(false)}
          onTrigger={trigger}
          onInject={inject}
          voice={voice}
        />
      )}

      {!open && (
        <CollapsedWidget
          onOpen={() => {
            if (!session) return;
            setOpen(true);
            setTab("chat");
            setBubble(null);
          }}
          mode={session?.mode}
          bubble={bubble?.text ?? null}
          onCloseBubble={() => setBubble(null)}
        />
      )}

      <Confetti active={confetti > 0} />

      {galleryOpen && (
        <CharacterGallery onClose={() => setGalleryOpen(false)} />
      )}

      {error && (
        <div
          style={{
            position: "fixed",
            bottom: 12,
            right: 12,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#fca5a5",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            zIndex: 100,
          }}
        >
          backend offline: {error.message}
        </div>
      )}

      {voice.error && (
        <div
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#fca5a5",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            zIndex: 100,
            maxWidth: 320,
          }}
        >
          mic: {voice.error}
          {!voice.supported &&
            " · браузер не поддерживает Web Speech API (нужен Chrome/Edge на десктопе)"}
        </div>
      )}
    </div>
  );
}

function activeFreebet(bonuses: Bonus[] | undefined): Bonus | null {
  if (!bonuses) return null;
  return (
    bonuses.find(
      (b) => !b.used && b.type === "freebet" && new Date(b.expiresAt) > new Date()
    ) ?? null
  );
}

function hoursLeftLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "0h";
  const hours = Math.max(1, Math.round(ms / (1000 * 60 * 60)));
  return `${hours}h`;
}
