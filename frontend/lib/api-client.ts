// Single source of URLs — normally comes from env (.env → docker-compose →
// build args). Local `npm run dev` does not read the repo-root .env, so we
// keep a tiny fallback for the two port pairs used by this demo.

function localDevBackendUrl(): string | null {
  if (typeof window === "undefined") return null;
  const { protocol, hostname, port } = window.location;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") return null;
  if (port === "3000") return `${protocol}//${hostname}:8000`;
  if (port === "3100") return `${protocol}//${hostname}:8100`;
  return null;
}

function envBackendUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  const local = localDevBackendUrl();
  if (local) return local;
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
