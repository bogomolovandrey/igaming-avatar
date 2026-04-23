// Splits a streaming LLM response into speakable chunks. We flush a chunk
// either at sentence boundary (.?!) or once it grows past `softLimit`
// characters — the latter prevents one giant chunk on Markdown-heavy
// replies that have few hard punctuation marks.

const SENTENCE_BOUNDARY = /[.!?…\n](?=\s|$)/;
const SOFT_LIMIT = 140;
const HARD_LIMIT = 240;

export type SentenceStreamer = {
  push: (delta: string) => string[];
  flush: () => string[];
  reset: () => void;
};

function cleanForTTS(s: string): string {
  // Strip basic markdown that would otherwise be read aloud literally
  // (`звёздочка звёздочка` etc.).
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "") // emojis
    .replace(/\s+/g, " ")
    .trim();
}

export function createSentenceStreamer(): SentenceStreamer {
  let buffer = "";

  const findBoundary = (s: string): number => {
    const m = s.match(SENTENCE_BOUNDARY);
    if (!m || m.index === undefined) return -1;
    return m.index + m[0].length;
  };

  const drain = (): string[] => {
    const out: string[] = [];

    while (true) {
      if (buffer.length >= SOFT_LIMIT) {
        const idx = findBoundary(buffer);
        if (idx > 0 && idx <= HARD_LIMIT) {
          const chunk = cleanForTTS(buffer.slice(0, idx));
          buffer = buffer.slice(idx).trimStart();
          if (chunk) out.push(chunk);
          continue;
        }
        if (buffer.length >= HARD_LIMIT) {
          // No boundary found but buffer is huge — split at nearest space.
          const cut = buffer.lastIndexOf(" ", HARD_LIMIT);
          const at = cut > SOFT_LIMIT ? cut : HARD_LIMIT;
          const chunk = cleanForTTS(buffer.slice(0, at));
          buffer = buffer.slice(at).trimStart();
          if (chunk) out.push(chunk);
          continue;
        }
      }
      const idx = findBoundary(buffer);
      if (idx > 0) {
        const chunk = cleanForTTS(buffer.slice(0, idx));
        buffer = buffer.slice(idx).trimStart();
        if (chunk) out.push(chunk);
        continue;
      }
      break;
    }
    return out;
  };

  return {
    push(delta: string) {
      buffer += delta;
      return drain();
    },
    flush() {
      const tail = cleanForTTS(buffer);
      buffer = "";
      return tail ? [tail] : [];
    },
    reset() {
      buffer = "";
    },
  };
}
