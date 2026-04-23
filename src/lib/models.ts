export type ProviderId = "openai" | "anthropic";

export const APP_MODELS = [
  {
    provider: "openai" as const,
    label: "OpenAI GPT-5.4",
    shortLabel: "GPT-5.4",
    apiModel: process.env.OPENAI_MODEL ?? "gpt-5.4",
  },
  {
    provider: "anthropic" as const,
    label: "Anthropic Sonnet 4.6",
    shortLabel: "Sonnet 4.6",
    apiModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  },
];

export function getModel(provider: ProviderId) {
  const match = APP_MODELS.find((item) => item.provider === provider);
  if (!match) throw new Error(`Unsupported provider: ${provider}`);
  return match;
}
