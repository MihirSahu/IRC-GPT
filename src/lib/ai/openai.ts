import OpenAI from "openai";
import { getApiModel } from "@/lib/models";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

export async function generateOpenAIResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  const apiModel = getApiModel("openai");
  const response = await getClient().responses.create({
    model: apiModel,
    input: [
      { role: "system", content: "You are a concise, reliable assistant inside a professional internal chat tool. Keep answers practical and clear." },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
    reasoning: { effort: "medium" },
    store: false,
  });

  return { provider: "openai" as const, model: apiModel, text: response.output_text.trim() };
}
