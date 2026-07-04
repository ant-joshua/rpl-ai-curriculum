# 🧠 Cheatsheet: Mastra AI Framework

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Mastra AI**: Framework TypeScript buat bikin AI agents
- **Agent**: AI model + instructions + tools
- **Tools**: Custom function dengan Zod schema — agent bisa panggil
- **Memory**: Agent ingat context percakapan (conversation history)
- **RAG**: Retrieval Augmented Generation — agent jawab dari dokumen
- **Workflows**: Multi-step agent pipeline (sequential/parallel)

## Sintaks Penting

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a city',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    return { output: `${location}: 28°C, cerah` };
  },
});

// Agent
const agent = new Agent({
  id: 'my-agent',
  name: 'Assistant',
  instructions: 'Kamu asisten yang helpful.',
  model: 'openai/gpt-4.1-nano',
  tools: { weatherTool },
  memory: { type: 'conversation' },
});

// Generate
const response = await agent.generate('Cuaca di Jakarta?');
console.log(response.text);
```

```bash
npm create mastra@latest
npx mastra dev
```

## Tips & Trik
- Zod schema: define input schema biar agent kirim param yang bener
- Instructions penting — makin detail, makin bagus output agent
- RAG: butuh vector embedding + knowledge base (dokumen)
- Workflows: cocok buat multi-step tasks (research → summarize → format)

## Common Mistakes
- ❌ Lupa install dependencies: `@mastra/core`, `zod`, provider package
- ❌ Tool description kurang jelas → agent salah milih tool
- ❌ API key ga di-set di `.env`
- ❌ Memory ga di-enable → agent gak ingat obrolan sebelumnya

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
