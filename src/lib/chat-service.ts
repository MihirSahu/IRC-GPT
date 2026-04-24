import { z } from "zod";
import { db } from "@/db/client";
import { ensureSchema } from "@/db/ensure";
import { appendMessage, createChat, getChat, getChatWithMessages, listChats, listMessages, updateChatProvider } from "@/db/repository";
import { generateProviderResponse } from "@/lib/ai";
import { getDefaultProvider, type ProviderId } from "@/lib/models";
import { deriveChatTitle } from "@/lib/title";

export const createChatSchema = z.object({ prompt: z.string().trim().min(1), provider: z.enum(["openai", "anthropic", "openrouter"]).default(getDefaultProvider()) });
export const updateChatSchema = z.object({ provider: z.enum(["openai", "anthropic", "openrouter"]) });
export const createMessageSchema = z.object({ content: z.string().trim().min(1) });

export async function fetchChats() {
  await ensureSchema();
  return listChats(db);
}

export async function makeChat(payload: unknown) {
  await ensureSchema();
  const input = createChatSchema.parse(payload);
  const chat = await createChat(db, { title: deriveChatTitle(input.prompt), provider: input.provider });
  await appendMessage(db, { chatId: chat!.id, role: "user", content: input.prompt });
  const reply = await generateProviderResponse(input.provider, [{ role: "user", content: input.prompt }]);
  await appendMessage(db, { chatId: chat!.id, role: "assistant", content: reply.text, provider: reply.provider, model: reply.model });
  return getChatWithMessages(db, chat!.id);
}

export async function fetchChat(chatId: string) {
  await ensureSchema();
  return getChatWithMessages(db, chatId);
}

export async function changeChatProvider(chatId: string, payload: unknown) {
  await ensureSchema();
  const input = updateChatSchema.parse(payload);
  return updateChatProvider(db, chatId, input.provider);
}

export async function addMessage(chatId: string, payload: unknown) {
  await ensureSchema();
  const chat = await getChat(db, chatId);
  if (!chat) return null;
  const input = createMessageSchema.parse(payload);
  await appendMessage(db, { chatId, role: "user", content: input.content });
  const history = await listMessages(db, chatId);
  const reply = await generateProviderResponse(chat.provider as ProviderId, history.map((message) => ({ role: message.role, content: message.content })));
  await appendMessage(db, { chatId, role: "assistant", content: reply.text, provider: reply.provider, model: reply.model });
  return getChatWithMessages(db, chatId);
}
