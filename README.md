# Boringcore Chat

A simple chat app with a deliberately mid-2000s corporate/professional/boringcore look.

## Stack
- Next.js App Router
- TanStack Query
- SQLite using libSQL local file mode
- Drizzle ORM
- OpenRouter Responses API via the OpenAI SDK
- OpenAI Responses API for GPT-5.4
- Anthropic Messages API for Claude Sonnet 4.6
- Vitest + Testing Library

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

`OPENROUTER_API_KEY` is now supported as a first-class provider. The default local routing option is OpenRouter using `OPENROUTER_MODEL` (defaults to `openai/gpt-4o`).

## Test
```bash
npm run lint
npm test
npm run build
```
