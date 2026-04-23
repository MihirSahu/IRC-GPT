# Boringcore Chat

A simple chat app with a deliberately mid-2000s corporate/professional/boringcore look.

## Stack
- Next.js App Router
- TanStack Query
- SQLite using libSQL local file mode
- Drizzle ORM
- OpenAI Responses API for GPT-5.4
- Anthropic Messages API for Claude Sonnet 4.6
- Vitest + Testing Library

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Test
```bash
npm run lint
npm test
npm run build
```
