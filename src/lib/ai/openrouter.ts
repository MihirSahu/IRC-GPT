import OpenAI from "openai";
import { getApiModel } from "@/lib/models";

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "Boringcore Chat",
    },
  });
}

export async function generateOpenRouterResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  const apiModel = getApiModel("openrouter");
  const response = await getClient().responses.create({
    model: apiModel,
    input: [
      { role: "system", content: "You are a concise, reliable assistant inside a professional internal chat tool. Keep answers practical and clear." },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
    store: false,
  });

  return { provider: "openrouter" as const, model: apiModel, text: response.output_text.trim() };
}
