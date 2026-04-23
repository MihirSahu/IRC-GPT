import type { ProviderId } from "@/lib/models";
import { generateAnthropicResponse } from "./anthropic";
import { generateOpenAIResponse } from "./openai";

export async function generateProviderResponse(provider: ProviderId, messages: { role: "user" | "assistant"; content: string }[]) {
  switch (provider) {
    case "openai": return generateOpenAIResponse(messages);
    case "anthropic": return generateAnthropicResponse(messages);
  }
}
