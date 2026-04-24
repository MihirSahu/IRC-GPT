export type ProviderId = "openai" | "anthropic" | "openrouter";

export const DEFAULT_PROVIDER: ProviderId = "openrouter";

const PROVIDER_ENV_KEYS: Record<ProviderId, string> = {
  openrouter: "OPENROUTER_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

export const APP_MODELS = [
  {
    provider: "openrouter" as const,
    label: "OpenRouter GPT-4o",
    shortLabel: "GPT-4o",
  },
  {
    provider: "openai" as const,
    label: "OpenAI GPT-5.4",
    shortLabel: "GPT-5.4",
  },
  {
    provider: "anthropic" as const,
    label: "Anthropic Sonnet 4.6",
    shortLabel: "Sonnet 4.6",
  },
];

export function getModel(provider: ProviderId) {
  const match = APP_MODELS.find((item) => item.provider === provider);
  if (!match) throw new Error(`Unsupported provider: ${provider}`);
  return match;
}

export function getApiModel(provider: ProviderId): string {
  switch (provider) {
    case "openrouter": return process.env.OPENROUTER_MODEL ?? "openai/gpt-4o";
    case "openai": return process.env.OPENAI_MODEL ?? "gpt-5.4";
    case "anthropic": return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  }
}

export function getConfiguredProviders(env: NodeJS.ProcessEnv = process.env) {
  return (Object.entries(PROVIDER_ENV_KEYS) as [ProviderId, string][])
    .filter(([, envKey]) => Boolean(env[envKey]))
    .map(([provider]) => provider);
}

export function getDefaultProvider(env: NodeJS.ProcessEnv = process.env): ProviderId {
  return getConfiguredProviders(env)[0] ?? DEFAULT_PROVIDER;
}
