import { APP_MODELS, DEFAULT_PROVIDER, getConfiguredProviders, getDefaultProvider, getModel } from "@/lib/models";

describe("model registry", () => {
  it("contains the supported providers", () => {
    expect(APP_MODELS.map((model) => model.provider)).toEqual(["openrouter", "openai", "anthropic"]);
  });

  it("uses OpenRouter as the documented product default", () => {
    expect(DEFAULT_PROVIDER).toBe("openrouter");
  });

  it("returns the model config for a provider", () => {
    expect(getModel("openrouter").shortLabel).toBe("GPT-4o");
    expect(getModel("openai").shortLabel).toBe("GPT-5.4");
    expect(getModel("anthropic").shortLabel).toBe("Sonnet 4.6");
  });

  it("discovers configured providers from the environment", () => {
    expect(getConfiguredProviders({ OPENROUTER_API_KEY: "or-key", OPENAI_API_KEY: "oa-key" } as NodeJS.ProcessEnv)).toEqual(["openrouter", "openai"]);
  });

  it("prefers OpenRouter when configured and falls back to another configured route", () => {
    expect(getDefaultProvider({ OPENROUTER_API_KEY: "or-key", OPENAI_API_KEY: "oa-key" } as NodeJS.ProcessEnv)).toBe("openrouter");
    expect(getDefaultProvider({ OPENAI_API_KEY: "oa-key" } as NodeJS.ProcessEnv)).toBe("openai");
    expect(getDefaultProvider({ ANTHROPIC_API_KEY: "an-key" } as NodeJS.ProcessEnv)).toBe("anthropic");
  });
});
