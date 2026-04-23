import { db } from "./client";

let didEnsure = false;

export async function ensureSchema() {
  if (didEnsure) return;

  await db.run(`CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, provider TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
  await db.run(`CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY NOT NULL, chat_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, provider TEXT, model TEXT, created_at TEXT NOT NULL, FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE);`);
  await db.run(`CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages(chat_id, created_at);`);
  await db.run(`CREATE INDEX IF NOT EXISTS chats_updated_at_idx ON chats(updated_at DESC);`);

  didEnsure = true;
}
