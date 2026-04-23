import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createDatabase } from "@/db/client";

export async function createTestDatabase() {
  const file = path.join("/tmp", `boringcore-chat-${randomUUID()}.db`);
  const db = createDatabase(`file:${file}`);
  await db.run(`CREATE TABLE chats (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, provider TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
  await db.run(`CREATE TABLE messages (id TEXT PRIMARY KEY NOT NULL, chat_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, provider TEXT, model TEXT, created_at TEXT NOT NULL);`);
  return { db, cleanup() { fs.rmSync(file, { force: true }); } };
}
