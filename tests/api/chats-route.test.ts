vi.mock("@/lib/chat-service", () => ({
  fetchChats: vi.fn(async () => [{ id: "chat-1", title: "Test chat", provider: "openai", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" }]),
  makeChat: vi.fn(async () => ({ chat: { id: "chat-2", title: "Created chat", provider: "anthropic", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" }, messages: [] })),
}));
import { GET, POST } from "@/app/api/chats/route";

describe("/api/chats route", () => {
  it("returns the chat list", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).chats).toHaveLength(1);
  });

  it("creates a new chat", async () => {
    const response = await POST(new Request("http://localhost/api/chats", { method: "POST", body: JSON.stringify({ prompt: "Build a dashboard", provider: "anthropic" }) }));
    expect(response.status).toBe(201);
    expect((await response.json()).chat.title).toBe("Created chat");
  });
});
