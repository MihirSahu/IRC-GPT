vi.mock("@/lib/chat-service", () => ({
  fetchChat: vi.fn(async (chatId: string) => chatId === "missing" ? null : { chat: { id: chatId, title: "Existing chat", provider: "openai", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" }, messages: [] }),
  changeChatProvider: vi.fn(async (chatId: string) => chatId === "missing" ? null : { id: chatId, title: "Existing chat", provider: "anthropic", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" }),
}));
import { GET, PATCH } from "@/app/api/chats/[chatId]/route";

describe("/api/chats/[chatId] route", () => {
  it("returns 404 when chat does not exist", async () => {
    expect((await GET(new Request("http://localhost"), { params: Promise.resolve({ chatId: "missing" }) })).status).toBe(404);
  });

  it("updates provider", async () => {
    const response = await PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ provider: "anthropic" }) }), { params: Promise.resolve({ chatId: "chat-1" }) });
    expect(response.status).toBe(200);
    expect((await response.json()).chat.provider).toBe("anthropic");
  });
});
