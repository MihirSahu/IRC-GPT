import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function normalizeSqliteUrl(url: string) {
  if (!url.startsWith("file:")) return url;
  const rawPath = url.slice(5);
  const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), "data", path.basename(rawPath));
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  return `file:${absolutePath}`;
}

export function createDatabase(url = process.env.DATABASE_URL ?? "file:./data/chat.db") {
  const client = createClient({ url: normalizeSqliteUrl(url) });
  return drizzle(client, { schema });
}

export type AppDatabase = ReturnType<typeof createDatabase>;
export const db = createDatabase();
