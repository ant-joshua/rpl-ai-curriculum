# Mastra AI Agent Starter

Mastra agent with Express server exposing chat endpoint.

## Setup

```bash
cp .env.example .env
# Edit .env with your OPENAI_API_KEY
```

## Run

```bash
npm install
npm run dev
```

## Endpoints

- `POST /api/chat` — Send chat message `{ "message": "Hello!" }`
- `GET /api/health` — Health check

## Build

```bash
npm run build
npm start
```
