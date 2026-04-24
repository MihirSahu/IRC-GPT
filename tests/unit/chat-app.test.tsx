import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatApp } from "@/components/chat-app";

function createFetchMock() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/api/chats")) {
      return new Response(JSON.stringify({
        chats: [
          { id: "chat-1", title: "OpenRouter Lounge", provider: "openrouter", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
          { id: "chat-2", title: "GPT Standup", provider: "openai", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
          { id: "chat-3", title: "Sonnet Notes", provider: "anthropic", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
          { id: "chat-4", title: "こんにちは 世界", provider: "openrouter", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url.endsWith("/api/chats/chat-1")) {
      return new Response(JSON.stringify({
        chat: { id: "chat-1", title: "OpenRouter Lounge", provider: "openrouter", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
        messages: [
          { id: "m-1", chatId: "chat-1", role: "user", content: "hello relay", provider: null, model: null, createdAt: "2026-04-22T08:14:00.000Z" },
          { id: "m-2", chatId: "chat-1", role: "assistant", content: "openrouter online", provider: "openrouter", model: "openai/gpt-4o", createdAt: "2026-04-22T08:15:00.000Z" },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  });
}

function createMixedProviderFetchMock() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/api/chats")) {
      return new Response(JSON.stringify({
        chats: [
          { id: "chat-9", title: "Relay History", provider: "anthropic", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url.endsWith("/api/chats/chat-9")) {
      return new Response(JSON.stringify({
        chat: { id: "chat-9", title: "Relay History", provider: "anthropic", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
        messages: [
          { id: "m-1", chatId: "chat-9", role: "assistant", content: "openai answer", provider: "openai", model: "gpt-5.4", createdAt: "2026-04-22T08:14:00.000Z" },
          { id: "m-2", chatId: "chat-9", role: "assistant", content: "anthropic answer", provider: "anthropic", model: "claude-sonnet-4-6", createdAt: "2026-04-22T08:15:00.000Z" },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  });
}

function createMutationFetchMock() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith("/api/chats") && init?.method === "POST") {
      return new Response(JSON.stringify({
        chat: { id: "chat-99", title: "Created chat", provider: "openrouter", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
        messages: [],
      }), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (url.endsWith("/api/chats/chat-1/messages") && init?.method === "POST") {
      return new Response(JSON.stringify({
        chat: { id: "chat-1", title: "OpenRouter Lounge", provider: "openrouter", createdAt: "2026-04-22T00:00:00.000Z", updatedAt: "2026-04-22T00:00:00.000Z" },
        messages: [
          { id: "m-1", chatId: "chat-1", role: "user", content: "hello relay", provider: null, model: null, createdAt: "2026-04-22T08:14:00.000Z" },
          { id: "m-2", chatId: "chat-1", role: "assistant", content: "openrouter online", provider: "openrouter", model: "openai/gpt-4o", createdAt: "2026-04-22T08:15:00.000Z" },
          { id: "m-3", chatId: "chat-1", role: "user", content: "line one\nline two", provider: null, model: null, createdAt: "2026-04-22T08:16:00.000Z" },
        ],
      }), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    return createFetchMock()(input);
  });
}

describe("ChatApp", () => {
  it("renders the IRC shell", async () => {
    vi.stubGlobal("fetch", createFetchMock());

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ChatApp />
      </QueryClientProvider>,
    );

    expect(screen.getByText("IRC GPT")).toBeInTheDocument();
    expect(await screen.findByText("Networks")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("OpenRouter")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(await screen.findByText("#openrouter-lounge")).toBeInTheDocument();
    expect(screen.getByText("#gpt-standup")).toBeInTheDocument();
    expect(screen.getByText("#sonnet-notes")).toBeInTheDocument();
    expect(screen.getByText("#こんにちは-世界")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("renders the active buffer and nick list", async () => {
    vi.stubGlobal("fetch", createFetchMock());

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ChatApp />
      </QueryClientProvider>,
    );

    expect(await screen.findAllByText(/\[\d{2}:\d{2}\]/)).toHaveLength(2);
    expect(screen.getAllByText("routerbot")).toHaveLength(2);
    expect(screen.getByText("@you")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("OpenRouter GPT-4o")).toHaveLength(2);
    expect(screen.getByLabelText("#openrouter-lounge")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();

    vi.unstubAllGlobals();
  });

  it("shows the IRC empty state without an active chat", async () => {
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

    expect(screen.getByText("IRC GPT")).toBeInTheDocument();
    expect(await screen.findByText("*** No channel selected. Start one from the left pane.")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("No occupants")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Route")[0]).toHaveDisplayValue("OpenRouter GPT-4o");
    expect(screen.getByLabelText("status")).toBeDisabled();

    vi.unstubAllGlobals();
  });

  it("renders assistant history using each message provider", async () => {
    vi.stubGlobal("fetch", createMixedProviderFetchMock());

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ChatApp />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("openai answer")).toBeInTheDocument();
    expect(screen.getByText("anthropic answer")).toBeInTheDocument();
    expect(screen.getAllByText("gptsrv")).toHaveLength(2);
    expect(screen.getAllByText("sonnet")).toHaveLength(2);
    expect(screen.getByText("3 listed")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("keeps multiline composer input and only submits on ctrl-enter outside IME", async () => {
    const fetchMock = createMutationFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ChatApp />
      </QueryClientProvider>,
    );

    const draft = await screen.findByLabelText("#openrouter-lounge");
    fireEvent.change(draft, { target: { value: "line one\nline two" } });
    fireEvent.keyDown(draft, { key: "Enter" });
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/messages") && init?.method === "POST")).toBe(false);

    fireEvent.keyDown(draft, { key: "Enter", keyCode: 229 });
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/messages") && init?.method === "POST")).toBe(false);

    fireEvent.keyDown(draft, { key: "Enter", ctrlKey: true });
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/messages") && init?.method === "POST")).toBe(true));

    vi.unstubAllGlobals();
  });

  it("keeps multiline new-chat input and only submits on ctrl-enter outside IME", async () => {
    const fetchMock = createMutationFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ChatApp />
      </QueryClientProvider>,
    );

    const prompt = await screen.findByLabelText("Join Channel");
    fireEvent.change(prompt, { target: { value: "step 1\nstep 2" } });
    fireEvent.keyDown(prompt, { key: "Enter" });
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/api/chats") && init?.method === "POST")).toBe(false);

    fireEvent.keyDown(prompt, { key: "Enter", keyCode: 229 });
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/api/chats") && init?.method === "POST")).toBe(false);

    fireEvent.keyDown(prompt, { key: "Enter", metaKey: true });
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/api/chats") && init?.method === "POST")).toBe(true));

    vi.unstubAllGlobals();
  });
});
