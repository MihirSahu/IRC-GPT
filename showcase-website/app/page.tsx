const networks = [
  {
    name: "OpenRouter",
    route: "GPT-4o relay",
    channels: [
      { name: "#roadmap-sync", meta: "Sprint planning sync", active: true },
      { name: "#release-notes", meta: "Launch summary draft", active: false },
    ],
  },
  {
    name: "OpenAI",
    route: "GPT-5.4 relay",
    channels: [{ name: "#prompt-lab", meta: "Prompt iteration notes", active: false }],
  },
  {
    name: "Anthropic",
    route: "Sonnet 4.6 relay",
    channels: [{ name: "#ops-checklist", meta: "Daily workflow review", active: false }],
  },
];

const transcript = [
  { time: "[08:14]", nick: "you", role: "user", content: "Give me the cleanest summary of this week’s roadmap decisions." },
  { time: "[08:15]", nick: "routerbot", role: "openrouter", content: "You approved the IRC redesign, locked the provider routing model, and scoped the showcase site as a standalone product page." },
  { time: "[08:16]", nick: "you", role: "user", content: "What still needs attention before release?" },
  { time: "[08:17]", nick: "routerbot", role: "openrouter", content: "Landing-page polish, final copy review, and a last pass on responsive density. Everything else is already in a stable local workflow." },
];

export default function Page() {
  return (
    <main className="site-shell">
      <section className="section">
        <div className="section-intro">
          <h1>IRC GPT</h1>
          <p className="section-intro__lede">An IRC-shaped desktop chat client for local-first AI conversations.</p>
          <p>
            IRC GPT takes the density and rhythm of a classic desktop relay client and adapts it for modern multi-provider AI
            chat. OpenRouter, OpenAI, and Anthropic all run through one shell, with SQLite persistence keeping every thread
            local and durable.
          </p>
        </div>

        <a
          className="github-button"
          href="https://github.com/MihirSahu/IRC-GPT"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>

        <div className="showcase-window">
          <div className="showcase-window__menubar">
            <div className="menu-cluster">
              <span>Boringcore</span>
              <span>View</span>
              <span>Server</span>
              <span>Settings</span>
              <span>Window</span>
              <span>Help</span>
            </div>
            <div className="menu-cluster menu-cluster--right">
              <span>Connected</span>
            </div>
          </div>

          <div className="showcase-window__titlebar">
            <div>
              <div className="window-title">IRC GPT</div>
              <div className="window-meta">Hex relay shell for local AI channels</div>
            </div>
            <div className="window-status">
              <div className="window-status__chip">Local relay · SQLite</div>
              <div className="window-status__chip">3 routes available</div>
            </div>
          </div>

          <div className="showcase-window__body">
            <aside className="mock-pane mock-pane--sidebar">
              <div className="mock-pane__header">Networks</div>
              <div className="mock-create">
                <label className="mock-label">Route</label>
                <div className="mock-select">OpenRouter GPT-4o</div>
                <label className="mock-label">Join Channel</label>
                <div className="mock-input">Sprint retro synthesis</div>
                <div className="mock-button">Join</div>
              </div>

              <div className="network-list">
                {networks.map((network) => (
                  <section key={network.name} className="network-card">
                    <div className="network-card__title">{network.name}</div>
                    <div className="network-card__route">{network.route}</div>
                    {network.channels.map((channel) => (
                      <div key={channel.name} className={`channel-row ${channel.active ? "channel-row--active" : ""}`}>
                        <div className="channel-row__name">{channel.name}</div>
                        <div className="channel-row__meta">{channel.meta}</div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </aside>

            <section className="mock-pane mock-pane--buffer">
              <div className="mock-pane__header mock-pane__header--buffer">
                <div>
                  <div className="buffer-title">#roadmap-sync</div>
                  <div className="buffer-meta">Sprint planning sync · route openrouter · 4 lines</div>
                </div>
                <div className="mock-select mock-select--compact">OpenRouter GPT-4o</div>
              </div>

              <div className="transcript">
                {transcript.map((line) => (
                  <div key={`${line.time}-${line.nick}`} className="transcript__line">
                    <span className="transcript__time">{line.time}</span>
                    <span className={`transcript__nick transcript__nick--${line.role}`}>{line.nick}</span>
                    <span className="transcript__content">{line.content}</span>
                  </div>
                ))}
              </div>

              <div className="composer">
                <div className="composer__row">
                  <div className="composer__channel">#roadmap-sync</div>
                  <div className="mock-input mock-input--composer">What still needs attention before release?</div>
                  <div className="mock-button">Send</div>
                </div>
                <div className="composer__status">
                  <span>Connected to local relay</span>
                  <span>Messages stored in SQLite</span>
                </div>
              </div>
            </section>

            <aside className="mock-pane mock-pane--users">
              <div className="mock-pane__header">Users</div>
              <div className="users-count">2 listed</div>
              <div className="user-row user-row--you">@you</div>
              <div className="user-row user-row--router">routerbot</div>
            </aside>
          </div>
        </div>

        <footer className="section-footer">
          <span>IRC GPT</span>
          <span>Mihir Sahu</span>
        </footer>
      </section>
    </main>
  );
}
