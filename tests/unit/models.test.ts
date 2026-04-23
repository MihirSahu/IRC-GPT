import { APP_MODELS, getModel } from "@/lib/models";

describe("model registry", () => {
  it("contains the two required providers", () => {
    expect(APP_MODELS.map((model) => model.provider)).toEqual(["openai", "anthropic"]);
  });

  it("returns the model config for a provider", () => {
    expect(getModel("openai").shortLabel).toBe("GPT-5.4");
    expect(getModel("anthropic").shortLabel).toBe("Sonnet 4.6");
  });
});
