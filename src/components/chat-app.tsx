"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APP_MODELS, DEFAULT_PROVIDER, type ProviderId } from "@/lib/models";
import { type ChatDetail, type ChatRecord, type MessageRecord, getJSON, patchJSON, postJSON } from "@/lib/api";
import { formatIrcTimestamp, formatTimestamp } from "@/lib/time";

function slugifyChannel(title: string) {
  const channel = title
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}\p{Mark}\p{Extended_Pictographic}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return channel || "untitled";
}

function groupChatsByProvider(chats: ChatRecord[]) {
  return APP_MODELS.reduce<Record<ProviderId, ChatRecord[]>>((groups, model) => {
    groups[model.provider] = chats.filter((chat) => chat.provider === model.provider);
    return groups;
  }, { openrouter: [], openai: [], anthropic: [] });
}

function getProviderNetworkLabel(provider: ProviderId) {
  switch (provider) {
    case "openrouter": return "OpenRouter";
    case "openai": return "OpenAI";
    case "anthropic": return "Anthropic";
  }
}

function getProviderNick(provider: ProviderId) {
  switch (provider) {
    case "openrouter": return "routerbot";
    case "openai": return "gptsrv";
    case "anthropic": return "sonnet";
  }
}

function getMessageProvider(message: MessageRecord, fallbackProvider: ProviderId) {
  return message.role === "assistant" && message.provider ? message.provider : fallbackProvider;
}

function isImeComposing(event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  return event.keyCode === 229 || (event.nativeEvent as KeyboardEvent).isComposing;
}

function isSubmitShortcut(event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  return event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.shiftKey && !isImeComposing(event);
}

export function ChatApp({ initialProvider = DEFAULT_PROVIDER }: { initialProvider?: ProviderId }) {
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState("");
  const [newProvider, setNewProvider] = useState<ProviderId>(initialProvider);
  const [draft, setDraft] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: async () => (await getJSON<{ chats: ChatRecord[] }>("/api/chats")).chats,
  });

  const effectiveChatId = selectedChatId ?? chatsQuery.data?.[0]?.id ?? null;

  const detailQuery = useQuery({
    queryKey: ["chat", effectiveChatId],
    queryFn: async () => getJSON<ChatDetail>(`/api/chats/${effectiveChatId}`),
    enabled: Boolean(effectiveChatId),
  });

  const createChat = useMutation({
    mutationFn: async (payload: { prompt: string; provider: ProviderId }) => postJSON<ChatDetail>("/api/chats", payload),
    onSuccess: async (detail) => {
      setNewPrompt("");
      setSelectedChatId(detail.chat.id);
      setBanner(null);
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.setQueryData(["chat", detail.chat.id], detail);
    },
    onError: (error) => setBanner(error instanceof Error ? error.message : "Unable to create conversation."),
  });

  const sendMessage = useMutation({
    mutationFn: async (payload: { chatId: string; content: string }) => postJSON<ChatDetail>(`/api/chats/${payload.chatId}/messages`, { content: payload.content }),
    onSuccess: async (detail) => {
      setDraft("");
      setBanner(null);
      queryClient.setQueryData(["chat", detail.chat.id], detail);
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => setBanner(error instanceof Error ? error.message : "Unable to send message."),
  });

  const updateProvider = useMutation({
    mutationFn: async (payload: { chatId: string; provider: ProviderId }) => patchJSON<{ chat: ChatRecord }>(`/api/chats/${payload.chatId}`, { provider: payload.provider }),
    onSuccess: async (_, variables) => {
      setBanner(null);
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      await queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
    },
    onError: (error) => setBanner(error instanceof Error ? error.message : "Unable to update provider."),
  });

  const selectedChat = detailQuery.data?.chat ?? null;
  const selectedMessages = detailQuery.data?.messages ?? [];
  const activeProvider = selectedChat?.provider ?? newProvider;
  const groupedChats = groupChatsByProvider(chatsQuery.data ?? []);
  const activeChannel = selectedChat ? `#${slugifyChannel(selectedChat.title)}` : "status";
  const assistantProviders = Array.from(
    new Set(selectedMessages.filter((message) => message.role === "assistant").map((message) => getMessageProvider(message, activeProvider))),
  );
  if (selectedChat && !assistantProviders.includes(activeProvider)) {
    assistantProviders.push(activeProvider);
  }
  const activeUsers = selectedChat
    ? [
        { id: "you", label: "@you", className: "irc-user-row--you" },
        ...assistantProviders.map((provider) => ({
          id: provider,
          label: getProviderNick(provider),
          className: `irc-user-row--${provider}`,
        })),
      ]
    : [];

  function submitNewChat() {
    const prompt = newPrompt.trim();
    if (!prompt || createChat.isPending) return;
    createChat.mutate({ prompt, provider: newProvider });
  }

  function submitMessage() {
    const content = draft.trim();
    if (!effectiveChatId || !content || sendMessage.isPending) return;
    sendMessage.mutate({ chatId: effectiveChatId, content });
  }

  return (
    <div className="page-shell">
      <div className="window">
        <div className="window__menubar" role="menubar" aria-label="Application menu">
          <div className="window__menu">
            <span className="menubar-item">Boringcore</span>
            <span className="menubar-item">View</span>
            <span className="menubar-item">Server</span>
            <span className="menubar-item">Settings</span>
            <span className="menubar-item">Window</span>
            <span className="menubar-item">Help</span>
          </div>
          <div className="window__menu-right">
            <span className="menubar-item">Connected</span>
          </div>
        </div>

        <div className="window__topbar">
          <div>
            <div className="window__title">IRC GPT</div>
            <div className="window__meta">Hex relay shell for local AI channels</div>
          </div>
          <div className="window__status">
            <div className="window__clock">Local relay · SQLite</div>
            <div className="window__status-line">{APP_MODELS.length} routes available</div>
          </div>
        </div>

        <div className="window__body irc-layout">
          <aside className="irc-sidebar" aria-label="Networks">
            <div className="section-header">Networks</div>
            <div className="irc-create">
              <label className="label" htmlFor="new-provider">Route</label>
              <select id="new-provider" className="select" value={newProvider} onChange={(event) => setNewProvider(event.target.value as ProviderId)}>
                {APP_MODELS.map((model) => <option key={model.provider} value={model.provider}>{model.label}</option>)}
              </select>
              <label className="label" htmlFor="new-prompt">Join Channel</label>
              <textarea
                id="new-prompt"
                className="irc-input irc-input--multiline"
                value={newPrompt}
                onChange={(event) => setNewPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (isSubmitShortcut(event)) {
                    event.preventDefault();
                    submitNewChat();
                  }
                }}
                placeholder="Describe the new channel"
                rows={3}
              />
              <button className="button button--primary" disabled={createChat.isPending || !newPrompt.trim()} onClick={submitNewChat}>
                {createChat.isPending ? "Joining..." : "Join"}
              </button>
            </div>

            <div className="irc-sidebar__groups">
              {chatsQuery.isLoading ? <div className="irc-notice">*** Loading networks...</div> : null}
              {!chatsQuery.isLoading && !(chatsQuery.data?.length ?? 0) ? <div className="irc-notice">*** No channels yet.</div> : null}
              {APP_MODELS.map((model) => (
                <section key={model.provider} className="irc-network-group">
                  <div className="irc-network-group__header">{getProviderNetworkLabel(model.provider)}</div>
                  <div className="irc-network-group__subhead">{model.shortLabel} relay</div>
                  {groupedChats[model.provider].length === 0 ? <div className="irc-network-group__empty">No joined channels</div> : null}
                  {groupedChats[model.provider].map((chat) => (
                    <button
                      key={chat.id}
                      className={`irc-channel-row ${effectiveChatId === chat.id ? "irc-channel-row--active" : ""}`}
                      onClick={() => setSelectedChatId(chat.id)}
                    >
                      <div className="irc-channel-row__name">#{slugifyChannel(chat.title)}</div>
                      <div className="irc-channel-row__meta">{chat.title}</div>
                      <div className="irc-channel-row__meta">{formatTimestamp(chat.updatedAt)}</div>
                    </button>
                  ))}
                </section>
              ))}
            </div>
          </aside>

          <section className="irc-buffer">
            <div className="irc-buffer-header">
              <div className="irc-buffer-header__copy">
                <div className="irc-buffer-header__channel">{selectedChat ? `#${slugifyChannel(selectedChat.title)}` : "No active buffer"}</div>
                <div className="irc-buffer-header__topic">
                  {selectedChat ? `${selectedChat.title} · route ${activeProvider} · ${selectedMessages.length} lines` : "Join a channel from the left pane to begin."}
                </div>
              </div>
              <div className="irc-buffer-header__controls">
                <label className="label" htmlFor="chat-provider">Route</label>
                <select
                  id="chat-provider"
                  className="select"
                  value={activeProvider}
                  disabled={!selectedChat}
                  onChange={(event) => selectedChat && updateProvider.mutate({ chatId: selectedChat.id, provider: event.target.value as ProviderId })}
                >
                  {APP_MODELS.map((model) => <option key={model.provider} value={model.provider}>{model.label}</option>)}
                </select>
              </div>
            </div>

            <div className="irc-log" data-testid="message-region">
              {detailQuery.isLoading && effectiveChatId ? <div className="irc-notice">*** Loading buffer...</div> : null}
              {!effectiveChatId ? <div className="irc-notice">*** No channel selected. Start one from the left pane.</div> : null}
              {effectiveChatId && !detailQuery.isLoading && selectedMessages.length === 0 ? <div className="irc-notice">*** Buffer is empty.</div> : null}
              {selectedMessages.map((message) => {
                const messageProvider = getMessageProvider(message, activeProvider);
                return (
                  <article key={message.id} className="irc-log-line">
                    <span className="irc-log-line__timestamp">{formatIrcTimestamp(message.createdAt)}</span>
                    <span className={`irc-log-line__nick ${message.role === "user" ? "irc-log-line__nick--user" : `irc-log-line__nick--${messageProvider}`}`}>
                      {message.role === "user" ? "you" : getProviderNick(messageProvider)}
                    </span>
                    <span className="irc-log-line__content">{message.content}</span>
                  </article>
                );
              })}
            </div>

            <div className="irc-composer">
              {banner ? <div className="irc-notice irc-notice--error">{banner}</div> : null}
              <div className="irc-composer__row">
                <label className="irc-composer__label" htmlFor="draft">{activeChannel}</label>
                <textarea
                  id="draft"
                  className="irc-input irc-input--compose irc-input--multiline"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (isSubmitShortcut(event)) {
                      event.preventDefault();
                      submitMessage();
                    }
                  }}
                  placeholder="Type a message"
                  disabled={!effectiveChatId || sendMessage.isPending}
                  rows={3}
                />
                <button className="button button--primary" disabled={!effectiveChatId || !draft.trim() || sendMessage.isPending} onClick={submitMessage}>
                  {sendMessage.isPending ? "Sending..." : "Send"}
                </button>
              </div>
              <div className="irc-statusbar">
                <span>Connected to local relay</span>
                <span>Messages stored in SQLite</span>
              </div>
            </div>
          </section>

          <aside className="irc-nicklist" aria-label="Users">
            <div className="section-header">Users</div>
            <div className="irc-nicklist__count">{selectedChat ? `${activeUsers.length} listed` : "0 listed"}</div>
            {selectedChat ? (
              <div className="irc-nicklist__users">
                {activeUsers.map((user) => (
                  <div key={user.id} className={`irc-user-row ${user.className}`}>{user.label}</div>
                ))}
              </div>
            ) : (
              <div className="irc-network-group__empty">No occupants</div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
