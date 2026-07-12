# Mastra AI — Exercise #1: Agent Basic (Hello Agent)

> **Level:** Beginner
> **Topics:** Agent class, generate, LLM call, response

## Instructions

Buat agent Mastra paling sederhana. Agent adalah unit dasar di Mastra yang bisa diajak ngobrol dan menjawab pertanyaan menggunakan LLM.

Tugas:
1. Buat agent dengan nama "HelloAgent".
2. Beri instruksi: "Kamu adalah asisten yang ramah. Jawab dengan singkat dan jelas."
3. Panggil agent dengan pertanyaan "Siapa presiden Indonesia?".
4. Tampilkan response.

## Starter Code

```javascript
// Conceptual example — requires @mastra/core
import { Agent } from '@mastra/core';

// TODO: buat agent
const helloAgent = new Agent({
  name: 'HelloAgent',
  instructions: 'Kamu adalah asisten yang ramah. Jawab dengan singkat dan jelas.',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
  },
});

async function main() {
  // TODO: panggil agent.generate() dengan pertanyaan
  // const response = await helloAgent.generate("Siapa presiden Indonesia?");
  // console.log(response.text);
}

// main();

// === SIMULASI BROWSER ===
// Karena Mastra butuh Node.js + API key, berikut simulasi browser-friendly:
async function simulateAgentResponse(question) {
  const knowledge = {
    'siapa presiden indonesia': 'Presiden Indonesia saat ini adalah Prabowo Subianto.',
    'siapa presiden pertama indonesia': 'Presiden pertama Indonesia adalah Ir. Soekarno.',
  };
  
  const lower = question.toLowerCase();
  for (const [key, answer] of Object.entries(knowledge)) {
    if (lower.includes(key)) return answer;
  }
  return `Maaf, saya tidak tahu jawaban untuk "${question}".`;
}

// Test simulasi
simulateAgentResponse('Siapa presiden Indonesia?').then(console.log);
simulateAgentResponse('Siapa presiden pertama Indonesia?').then(console.log);
simulateAgentResponse('Apa itu AI?').then(console.log);
```

## Expected Output

```
Presiden Indonesia saat ini adalah Prabowo Subianto.
Presiden pertama Indonesia adalah Ir. Soekarno.
Maaf, saya tidak tahu jawaban untuk "Apa itu AI?".
```

## Test Cases

```javascript
simulateAgentResponse('Siapa presiden Indonesia?').then(r => {
  console.log(r.includes('Prabowo'));  // true
});
```
