vi.mock("@/lib/chat-service", () => ({
  addMessage: vi.fn(async (chatId: string) => chatId === "missing" ? null : { chat: { id: chatId, title: "Existing chat", provider: "openai", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" }, messages: [{ id: "m-1", chatId, role: "user", content: "hello", provider: null, model: null, createdAt: "2026-04-22T00:00:00.000Z" }, { id: "m-2", chatId, role: "assistant", content: "world", provider: "openai", model: "gpt-5.4", createdAt: "2026-04-22T00:00:01.000Z" }] }),
}));
import { POST } from "@/app/api/chats/[chatId]/messages/route";

describe("/api/chats/[chatId]/messages route", () => {
  it("returns not found for missing chat", async () => {
    expect((await POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({ content: "test" }) }), { params: Promise.resolve({ chatId: "missing" }) })).status).toBe(404);
  });

  it("adds a message and returns the updated detail", async () => {
    const response = await POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({ content: "test" }) }), { params: Promise.resolve({ chatId: "chat-1" }) });
    expect(response.status).toBe(201);
    expect((await response.json()).messages).toHaveLength(2);
  });
});
