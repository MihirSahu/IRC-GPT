import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { changeChatProvider, fetchChat } from "@/lib/chat-service";

type RouteContext = { params: Promise<{ chatId: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { chatId } = await context.params;
  const chat = await fetchChat(chatId);
  if (!chat) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  return NextResponse.json(chat);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const chat = await changeChatProvider(chatId, await request.json());
    if (!chat) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    return NextResponse.json({ chat });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid chat update payload.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update chat." }, { status: 500 });
  }
}
