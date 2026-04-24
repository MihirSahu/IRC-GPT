import Anthropic from "@anthropic-ai/sdk";
import { getApiModel } from "@/lib/models";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  return new Anthropic({ apiKey });
}

export async function generateAnthropicResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  const apiModel = getApiModel("anthropic");
  const response = await getClient().messages.create({
    model: apiModel,
    max_tokens: 1200,
    system: "You are a concise, reliable assistant inside a professional internal chat tool. Keep answers practical and clear.",
    messages: messages.map((message) => ({ role: message.role, content: message.content })),
    thinking: { type: "adaptive" },
  });

  const text = response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
  return { provider: "anthropic" as const, model: apiModel, text };
}
