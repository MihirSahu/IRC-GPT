import { appendMessage, clearChat, createChat, getChatWithMessages, listChats } from "@/db/repository";
import { createTestDatabase } from "../helpers/test-db";

describe("repository", () => {
  it("creates a chat and stores messages", async () => {
    const { db, cleanup } = await createTestDatabase();
    try {
      const chat = await createChat(db, { title: "Quarterly planning", provider: "openai" });
      await appendMessage(db, { chatId: chat!.id, role: "user", content: "Give me a summary." });
      await appendMessage(db, { chatId: chat!.id, role: "assistant", content: "Here is a summary.", provider: "openai", model: "gpt-5.4" });
      const detail = await getChatWithMessages(db, chat!.id);
      expect(detail?.messages).toHaveLength(2);
      expect(detail?.messages[1]?.provider).toBe("openai");
    } finally { cleanup(); }
  });

  it("orders chats by most recent update", async () => {
    const { db, cleanup } = await createTestDatabase();
    try {
      const older = await createChat(db, { title: "Older chat", provider: "openai" });
      const newer = await createChat(db, { title: "Newer chat", provider: "anthropic" });
      await appendMessage(db, { chatId: older!.id, role: "user", content: "bump older" });
      const chats = await listChats(db);
      expect(chats[0]?.id).toBe(older?.id);
      expect(chats[1]?.id).toBe(newer?.id);
    } finally { cleanup(); }
  });

  it("clears a chat and its messages", async () => {
    const { db, cleanup } = await createTestDatabase();
    try {
      const chat = await createChat(db, { title: "Temp chat", provider: "anthropic" });
      await appendMessage(db, { chatId: chat!.id, role: "user", content: "hello" });
      await clearChat(db, chat!.id);
      expect(await getChatWithMessages(db, chat!.id)).toBeNull();
    } finally { cleanup(); }
  });
});
