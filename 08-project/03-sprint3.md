# Sprint 3 — AI Integration

> **Sesi:** 23–24 | **Durasi:** 4 jam

## Tujuan

- Wiring Mastra agent ke aplikasi
- Bikin tools Mastra (weather, search, itinerary)
- Agent response ditampilkan di frontend
- Stream response dari agent
- Error handling + loading states
- Prompt templates terstruktur

## Mastra Tool — Weather

```typescript
// backend/src/agents/tools/weather.ts
import { Tool } from '@mastra/core';

interface WeatherInput {
  city: string;
  date: string;
}

export const weatherTool = new Tool<WeatherInput>({
  name: 'get-weather',
  description: 'Get weather forecast for a city on a specific date',
  inputSchema: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'Nama kota' },
      date: { type: 'string', description: 'Tanggal (YYYY-MM-DD)' },
    },
    required: ['city'],
  },
  execute: async ({ input }) => {
    // Panggil OpenWeatherMap API atau mock
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${input.city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
    };
  },
});
```

## Agent dengan Tools

```typescript
// backend/src/agents/travelAgent.ts
import { Agent } from '@mastra/core';
import { weatherTool } from './tools/weather';
import { searchPlaceTool } from './tools/searchPlace';
import { saveItineraryTool } from './tools/saveItinerary';

export const travelAgent = new Agent({
  name: 'travel-agent',
  instructions: `
    Kamu adalah asisten perjalanan yang membantu user merencanakan itinerary.

    Langkah-langkah:
    1. Tanya tujuan dan tanggal perjalanan
    2. Cek cuaca destinasi pake tool get-weather
    3. Cari tempat wisata populer pake tool search-place
    4. Simpan itinerary pake tool save-itinerary
    5. Tampilkan ringkasan rencana perjalanan

    Selalu gunakan tools yang tersedia — jangan cuma ngasih saran umum.
  `,
  tools: [weatherTool, searchPlaceTool, saveItineraryTool],
});
```

## Agent API Endpoint — Stream

```typescript
// backend/src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { travelAgent } from '../agents/travelAgent';

const router = Router();

// POST /api/ai/chat — chat dengan agent (streaming)
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const stream = await travelAgent.stream([
      { role: 'user', content: message },
    ]);

    for await (const chunk of stream) {
      res.write(chunk.delta?.text || '');
    }

    res.end();
  } catch (error) {
    res.status(500).json({ error: 'AI agent error' });
  }
});

export default router;
```

## Frontend — Chat Component

```tsx
// frontend/src/components/Chat.tsx
import { useState, useRef } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; content: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const handleSend = async () => {
    const userMsg = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/ai/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
          signal: controller.signal,
        }
      );

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      let aiContent = '';
      setMessages((prev) => [...prev, { role: 'ai', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        aiContent += text;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'ai',
            content: aiContent,
          };
          return updated;
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: 'Error: gagal mendapat response' },
        ]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    abortController?.abort();
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          placeholder="Tanya rencana perjalanan..."
        />
        {loading ? (
          <button onClick={handleStop}>Stop</button>
        ) : (
          <button onClick={handleSend}>Send</button>
        )}
      </div>
    </div>
  );
}
```

## Prompt Templates

```typescript
// backend/src/agents/prompts.ts
export const ITINERARY_PROMPT = `
Buatkan itinerary perjalanan ke {{destination}} dari {{startDate}} sampai {{endDate}}.

Pertimbangkan:
- Cuaca pada tanggal tersebut (gunakan tool get-weather)
- Tempat wisata populer (gunakan tool search-place)
- Budget dan durasi per hari

Output dalam format:
## Itinerary: {{destination}}
### Day 1 — {{date}}
- Pagi: ...
- Siang: ...
- Malam: ...
### Day 2 — {{date}}
...
`;

export const RECOMMENDATION_PROMPT = `
Berdasarkan preferensi user: {{preferences}}
Beri rekomendasi {{count}} tempat wisata di {{city}}.

Setiap rekomendasi harus punya:
- Nama tempat
- Alamat
- Rating
- Deskripsi singkat
- Kenapa cocok untuk user
`;
```

## Error Boundary

```tsx
// frontend/src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Latihan

1. **Connect Agent** — Wiring Mastra agent ke Express route, test panggil endpoint `/api/ai/chat` dengan Postman
2. **Stream Response** — Implement streaming agent response di frontend, tampilkan token by token seperti ChatGPT
3. **Tool Integration** — Bikin minimal 2 Mastra tools (misal: cari tempat + cek cuaca), pastikan agent pake tools itu
4. **Error Boundary** — Bungkus komponen AI dengan ErrorBoundary, test dengan matikan backend
|5. **Prompt Templates** — Bikin 2 template prompt dengan parameter dinamis, test hasil generate-nya

6. **API Contract Documentation** — Update API.md dengan endpoint baru dari Sprint 3. Include: method, path, request body (JSON schema), response (200/201/400/401/404/500), contoh curl. Tulis minimal 3 endpoint dengan dokumentasi lengkap.

7. **Architecture Decision Record** — Tulis ADR untuk 2 keputusan arsitektur yang diambil selama Sprint 3. Format: context, decision, consequences, alternatives. Contoh: "Why streaming instead of batch response?", "Why server-sent events instead of WebSocket?"

8. **Sprint Review Document** — Tulis sprint review untuk Sprint 3. Include: sprint goal, completed tasks vs planned, burndown, what went well, what to improve, action items untuk sprint berikutnya.
