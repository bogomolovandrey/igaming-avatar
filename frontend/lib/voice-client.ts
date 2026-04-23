// Bridge to Pipecat client-js + websocket transport.

import { PipecatClient } from "@pipecat-ai/client-js";
import {
  ProtobufFrameSerializer,
  WebSocketTransport,
} from "@pipecat-ai/websocket-transport";

import { WS_URL } from "./api-client";

export type VoiceCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onUserStartedSpeaking?: () => void;
  onUserStoppedSpeaking?: () => void;
  onBotStartedSpeaking?: () => void;
  onBotStoppedSpeaking?: () => void;
  onUserTranscript?: (text: string, final: boolean) => void;
  onBotTranscript?: (text: string) => void;
  onError?: (err: string) => void;
};

export function createVoiceClient(
  sessionId: string,
  callbacks: VoiceCallbacks
): PipecatClient {
  const transport = new WebSocketTransport({
    serializer: new ProtobufFrameSerializer(),
  });

  const client = new PipecatClient({
    transport,
    enableCam: false,
    enableMic: false,
    callbacks: {
      onConnected: () => callbacks.onConnected?.(),
      onDisconnected: () => callbacks.onDisconnected?.(),
      onUserStartedSpeaking: () => callbacks.onUserStartedSpeaking?.(),
      onUserStoppedSpeaking: () => callbacks.onUserStoppedSpeaking?.(),
      onBotStartedSpeaking: () => callbacks.onBotStartedSpeaking?.(),
      onBotStoppedSpeaking: () => callbacks.onBotStoppedSpeaking?.(),
      onUserTranscript: (data: { text: string; final: boolean }) => {
        callbacks.onUserTranscript?.(data.text, data.final);
      },
      onBotTranscript: (data: { text: string }) => {
        callbacks.onBotTranscript?.(data.text);
      },
      onMessageError: (err: unknown) => {
        callbacks.onError?.(String(err));
      },
      onError: (err: unknown) => {
        callbacks.onError?.(String(err));
      },
    },
  });

  return client;
}

export function buildVoiceUrl(sessionId: string): string {
  return `${WS_URL}/ws/voice?sessionId=${encodeURIComponent(sessionId)}`;
}
