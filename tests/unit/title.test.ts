import { deriveChatTitle } from "@/lib/title";

describe("deriveChatTitle", () => {
  it("falls back when prompt is empty", () => {
    expect(deriveChatTitle("   ")).toBe("Untitled conversation");
  });

  it("normalizes whitespace", () => {
    expect(deriveChatTitle("hello    there     team")).toBe("hello there team");
  });

  it("clips long titles", () => {
    expect(deriveChatTitle("This is a very long prompt that should be clipped into a shorter title for the chat list")).toBe("This is a very long prompt that should be clipped in…");
  });
});
