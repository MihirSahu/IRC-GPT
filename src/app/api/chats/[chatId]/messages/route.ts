import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { addMessage } from "@/lib/chat-service";

type RouteContext = { params: Promise<{ chatId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const detail = await addMessage(chatId, await request.json());
    if (!detail) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    return NextResponse.json(detail, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid message payload.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send message." }, { status: 500 });
  }
}
