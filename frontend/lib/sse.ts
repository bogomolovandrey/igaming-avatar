// Minimal SSE parser over fetch's ReadableStream — needed because the
// browser EventSource API doesn't support POST.

export type SSEEvent = { event: string; data: string };

export async function* parseSSE(
  response: Response,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  if (!response.body) {
    throw new Error("response has no body");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Normalize CRLF → LF so sse-starlette (which emits \r\n) and our
      // hand-rolled streams parse the same.
      buffer = buffer.replace(/\r\n/g, "\n");

      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        if (!block.trim()) continue;
        let evtName = "message";
        let data = "";
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) {
            evtName = line.slice("event:".length).trim();
          } else if (line.startsWith("data:")) {
            const chunk = line.slice("data:".length).trimStart();
            data = data ? `${data}\n${chunk}` : chunk;
          }
        }
        yield { event: evtName, data };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
