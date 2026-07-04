<img src="https://images.pexels.com/photos/8386437/pexels-photo-8386437.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="AI Agents" style="width:100%;border-radius:12px;margin:12px 0;">

# 06. Mastra AI Framework

> **Level:** 📐 Intermediate -> 🚀 Advanced  
> **Jam:** 12 (5 minggu x 2 sesi)  
> **Prasyarat:** JavaScript Fundamentals, TypeScript Basics, Node.js Basics  
> **Output:** AI agents with tools, memory, RAG, workflows

## Tujuan

- Paham konsep AI agents vs raw API calls
- Bikin agent pake Mastra framework
- Bikin tools (custom function buat agent)
- Memory: agent ingat percakapan
- RAG: agent jawab dari dokumen
- Multi-step workflows

## Materi

| Sesi | Topik | Prasyarat |
|------|-------|-----------|
| 1 | Mastra intro, project setup, agent pertama | - |
| 2 | Tools: createTool + Zod schema | Sesi 1 |
| 3 | Memory: agent ingat context | Sesi 2 |
| 4 | RAG: vector search + knowledge base | Sesi 3 |
| 5 | Workflows: multi-step agent pipeline | Sesi 4 |

## Contoh Agent

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a city',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    return { output: `${location}: 28°C, cerah` };
  },
});

const agent = new Agent({
  id: 'weather-agent',
  name: 'Cuaca Assistant',
  instructions: 'Kamu asisten cuaca. Pake weatherTool.',
  model: 'openai/gpt-4.1-nano',
  tools: { weatherTool },
});

const response = await agent.generate('Cuaca di Jakarta?');
console.log(response.text);
```
