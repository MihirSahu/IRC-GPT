"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APP_MODELS, type ProviderId } from "@/lib/models";
import { type ChatDetail, type ChatRecord, getJSON, patchJSON, postJSON } from "@/lib/api";
import { formatTimestamp } from "@/lib/time";
import { StatusPill } from "./status-pill";

export function ChatApp() {
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState("");
  const [newProvider, setNewProvider] = useState<ProviderId>("openai");
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
  const activeProvider = selectedChat?.provider ?? "openai";

  return (
    <div className="page-shell">
      <div className="window">
        <div className="window__topbar">
          <div className="window__brand">
            <div className="window__logo" aria-hidden="true" />
            <div>
              <div className="window__eyebrow">Enterprise Knowledge Systems · Messaging Suite</div>
              <div className="window__title">Boringcore Chat Console</div>
              <div className="window__meta">Internal Messaging Workspace · Revision 5.4/4.6 · Enterprise Collaboration</div>
            </div>
          </div>

          <div className="window__status">
            <div className="window__clock">Build Channel: Stable · Sync: Local SQLite</div>
            <div className="status-row status-row--right">
              <StatusPill provider="openai" label="GPT-5.4 online" />
              <StatusPill provider="anthropic" label="Sonnet 4.6 online" />
            </div>
          </div>
        </div>

        <div className="window__menubar" role="menubar" aria-label="Application menu">
          <div className="window__menu">
            <span className="menubar-item">File</span>
            <span className="menubar-item">Edit</span>
            <span className="menubar-item">View</span>
            <span className="menubar-item">Tools</span>
            <span className="menubar-item">Routing</span>
            <span className="menubar-item">Window</span>
            <span className="menubar-item">Help</span>
          </div>
          <div className="window__menu-right">
            <span className="menubar-item">Operator: Local Session</span>
            <span className="menubar-item">Queue: Nominal</span>
          </div>
        </div>

        <div className="window__body">
          <aside className="sidebar">
            <div className="section-header">New Conversation</div>
            <div className="panel-block">
              {banner ? <div className="banner banner--error">{banner}</div> : null}
              <div className="field-grid">
                <div>
                  <label className="label" htmlFor="new-provider">Provider</label>
                  <select id="new-provider" className="select" value={newProvider} onChange={(event) => setNewProvider(event.target.value as ProviderId)}>
                    {APP_MODELS.map((model) => <option key={model.provider} value={model.provider}>{model.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="new-prompt">First Prompt</label>
                  <textarea id="new-prompt" className="textarea" value={newPrompt} onChange={(event) => setNewPrompt(event.target.value)} placeholder="Enter opening prompt for new conversation" />
                </div>
                <button className="button button--primary" disabled={createChat.isPending || !newPrompt.trim()} onClick={() => createChat.mutate({ prompt: newPrompt, provider: newProvider })}>
                  {createChat.isPending ? "Creating..." : "Create New Chat"}
                </button>
              </div>
            </div>

            <div className="section-header">Session Metrics</div>
            <div className="kpi-grid">
              <div className="kpi"><div className="kpi__label">Conversations</div><div className="kpi__value">{chatsQuery.data?.length ?? 0}</div></div>
              <div className="kpi"><div className="kpi__label">Loaded Thread</div><div className="kpi__value">{selectedMessages.length}</div></div>
              <div className="kpi"><div className="kpi__label">Active Route</div><div className="kpi__value">{activeProvider === "openai" ? 54 : 46}</div></div>
            </div>

            <div className="section-header">Conversation Directory</div>
            <div className="chat-list">
              {chatsQuery.isLoading ? <div className="empty-state">Loading directory...</div> : null}
              {!chatsQuery.isLoading && chatsQuery.data?.length === 0 ? <div className="empty-state">No stored conversations yet. Start one in the panel above.</div> : null}
              {chatsQuery.data?.map((chat) => (
                <button key={chat.id} className={`chat-card ${effectiveChatId === chat.id ? "chat-card--active" : ""}`} onClick={() => setSelectedChatId(chat.id)}>
                  <div className="chat-card__title">{chat.title}</div>
                  <div className="chat-card__meta"><StatusPill provider={chat.provider} label={chat.provider.toUpperCase()} compact /><span>{formatTimestamp(chat.updatedAt)}</span></div>
                </button>
              ))}
            </div>
          </aside>

          <section className="main-panel">
            <div className="tabstrip" aria-hidden="true">
              <div className="tab tab--active">Messaging Workspace</div>
              <div className="tab">Provider Switchboard</div>
              <div className="tab">Thread Archive</div>
            </div>
            <div className="section-header">Conversation Workspace</div>
            {selectedChat ? (
              <div className="panel-block">
                <div className="workspace-summary">
                  <div className="workspace-badge">
                    <div className="workspace-badge__eyebrow">Active Conversation</div>
                    <h2 className="workspace-badge__title">{selectedChat.title}</h2>
                    <div className="workspace-badge__note">Last updated {formatTimestamp(selectedChat.updatedAt)} · Message persistence enabled</div>
                  </div>
                  <div>
                    <label className="label" htmlFor="chat-provider">Model Provider</label>
                    <select id="chat-provider" className="select" value={activeProvider} onChange={(event) => updateProvider.mutate({ chatId: selectedChat.id, provider: event.target.value as ProviderId })}>
                      {APP_MODELS.map((model) => <option key={model.provider} value={model.provider}>{model.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : <div className="panel-block"><div className="banner banner--info">Select a conversation from the directory or create a new one.</div></div>}

            <div className="message-region" data-testid="message-region">
              {detailQuery.isLoading && effectiveChatId ? <div className="empty-state">Loading conversation contents...</div> : null}
              {!effectiveChatId ? <div className="empty-state">No conversation selected. This portal is standing by.</div> : null}
              {selectedMessages.map((message) => (
                <article key={message.id} className={`message ${message.role === "user" ? "message--user" : "message--assistant"}`}>
                  <div className="message__header"><span>{message.role === "user" ? "User Entry" : "Assistant Reply"}</span><span>{message.provider ? `${message.provider} · ` : ""}{formatTimestamp(message.createdAt)}</span></div>
                  <div className="message__body">{message.content}</div>
                </article>
              ))}
            </div>

            <div className="composer">
              <label className="label" htmlFor="draft">Compose Message</label>
              <textarea id="draft" className="textarea" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type message for selected conversation" />
              <div className="composer__actions">
                <div className="status-row"><StatusPill provider={activeProvider} label={`Route: ${activeProvider}`} compact /><span>Messages are stored locally in SQLite.</span></div>
                <button className="button button--primary" disabled={!effectiveChatId || !draft.trim() || sendMessage.isPending} onClick={() => effectiveChatId && sendMessage.mutate({ chatId: effectiveChatId, content: draft })}>{sendMessage.isPending ? "Transmitting..." : "Send Message"}</button>
              </div>
            </div>
          </section>
        </div>

        <div className="footer-rail">
          <span>Console Theme: Millennium Corporate</span>
          <span>Transport: HTTPS / JSON</span>
          <span>Persistence: SQLite + Drizzle</span>
          <span>Client Cache: TanStack Query</span>
        </div>
      </div>
    </div>
  );
}
