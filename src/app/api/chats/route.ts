import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fetchChats, makeChat } from "@/lib/chat-service";

export async function GET() {
  return NextResponse.json({ chats: await fetchChats() });
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await makeChat(await request.json()), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid chat payload.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create conversation." }, { status: 500 });
  }
}
