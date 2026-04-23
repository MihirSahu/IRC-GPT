import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { ChatApp } from "@/components/chat-app";

describe("ChatApp", () => {
  it("renders the corporate shell and empty state", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith("/api/chats")) {
        return new Response(JSON.stringify({ chats: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }));

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ChatApp />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Boringcore Chat Console")).toBeInTheDocument();
    expect(await screen.findByText(/No stored conversations yet/i)).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
