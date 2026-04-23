import { asc, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { ProviderId } from "@/lib/models";
import type { AppDatabase } from "./client";
import { chats, messages } from "./schema";

const now = () => new Date().toISOString();

export async function listChats(database: AppDatabase) {
  return database.select().from(chats).orderBy(desc(chats.updatedAt));
}

export async function createChat(database: AppDatabase, input: { title: string; provider: ProviderId }) {
  const id = randomUUID();
  const timestamp = now();
  await database.insert(chats).values({ id, title: input.title, provider: input.provider, createdAt: timestamp, updatedAt: timestamp });
  return getChat(database, id);
}

export async function getChat(database: AppDatabase, chatId: string) {
  return (await database.query.chats.findFirst({ where: eq(chats.id, chatId) })) ?? null;
}

export async function updateChatProvider(database: AppDatabase, chatId: string, provider: ProviderId) {
  await database.update(chats).set({ provider, updatedAt: now() }).where(eq(chats.id, chatId));
  return getChat(database, chatId);
}

export async function listMessages(database: AppDatabase, chatId: string) {
  return database.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(asc(messages.createdAt));
}

export async function appendMessage(database: AppDatabase, input: { chatId: string; role: "user" | "assistant"; content: string; provider?: ProviderId | null; model?: string | null }) {
  const timestamp = now();
  await database.insert(messages).values({ id: randomUUID(), chatId: input.chatId, role: input.role, content: input.content, provider: input.provider ?? null, model: input.model ?? null, createdAt: timestamp });
  await database.update(chats).set({ updatedAt: timestamp }).where(eq(chats.id, input.chatId));
}

export async function getChatWithMessages(database: AppDatabase, chatId: string) {
  const chat = await getChat(database, chatId);
  if (!chat) return null;
  return { chat, messages: await listMessages(database, chatId) };
}

export async function clearChat(database: AppDatabase, chatId: string) {
  await database.delete(messages).where(eq(messages.chatId, chatId));
  await database.delete(chats).where(eq(chats.id, chatId));
}
