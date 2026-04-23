import type { ProviderId } from "./models";

export type ChatRecord = { id: string; title: string; provider: ProviderId; createdAt: string; updatedAt: string };
export type MessageRecord = { id: string; chatId: string; role: "user" | "assistant"; content: string; provider: ProviderId | null; model: string | null; createdAt: string };
export type ChatDetail = { chat: ChatRecord; messages: MessageRecord[] };

export async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

async function safeJson(response: Response) {
  try { return (await response.json()) as { error?: string }; } catch { return null; }
}

export async function postJSON<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) {
    const payload = await safeJson(response);
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function patchJSON<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) {
    const payload = await safeJson(response);
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}
