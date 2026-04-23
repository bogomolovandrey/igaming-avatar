// Single source of URLs — must come from env (.env → docker-compose → build args).
// In the browser, if env is missing we fall back to the page's own origin —
// which is what you want behind a reverse proxy where backend is on the
// same host. Hardcoded ports here would be misleading.

function envBackendUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function envWsUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  const httpBase = envBackendUrl();
  return httpBase.replace(/^http/i, "ws");
}

export const BACKEND_URL = envBackendUrl();
export const WS_URL = envWsUrl();

export async function api<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const resp = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`${resp.status} ${resp.statusText}: ${body}`);
  }
  return resp.json() as Promise<T>;
}
