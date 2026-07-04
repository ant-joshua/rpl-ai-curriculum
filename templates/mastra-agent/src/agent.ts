import { Agent } from '@mastra/core';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Simple tool: get current time
const timeTool = {
  name: 'getCurrentTime',
  description: 'Get current date and time',
  parameters: z.object({}),
  execute: async () => {
    return { timestamp: new Date().toISOString() };
  },
};

// Create agent
const agent = new Agent({
  name: 'BasicAgent',
  instructions: 'You are a helpful AI assistant. Answer user questions concisely.',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
  },
  tools: [timeTool],
});

export async function handleChat(message: string) {
  const response = await agent.generate(message);
  return { reply: response.text };
}

export default agent;
