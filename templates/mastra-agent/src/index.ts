import express from 'express';
import dotenv from 'dotenv';
import { handleChat } from './agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message field required (string)' });
      return;
    }
    const result = await handleChat(message);
    res.json(result);
  } catch (err) {
    const error = err as Error;
    console.error('Chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Mastra agent server running on http://localhost:${PORT}`);
});

export default app;
