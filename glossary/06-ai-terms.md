# 🤖 AI Terms

> Istilah-istilah AI/ML yang sering dipake di kurikulum ini.

---

### LLM (Large Language Model)
Model AI yang ngerti dan ngenerate teks kayak manusia. Dilatih pake data internet raksasa. Contoh: GPT-4, Llama, Claude, Gemini.

```ts
// Panggil LLM via API (OpenAI)
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chat() {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Kamu asisten yang helpful.' },
      { role: 'user', content: 'Jelaskan AI dalam 1 kalimat.' }
    ]
  });
  console.log(response.choices[0].message.content);
  // Output: AI adalah teknologi yang memungkinkan komputer meniru kecerdasan manusia.
}
```

### Prompt
Instruksi / input yang dikasih ke LLM buat dapetin output tertentu.

```ts
// Prompt engineering — makin jelas instruksinya, makin bagus hasilnya
const prompt = `
Buatkan kode TypeScript untuk:
1. Function yang nge-filter array angka > 10
2. Pake arrow function
3. Tambahin type annotation

Hanya kode, tanpa penjelasan.
`;

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }]
});
```

### Token
Unit terkecil yang dipahamin LLM. Bisa berupa kata, sebagian kata, atau karakter. 1 token ≈ 0.75 kata Inggris.

```ts
// Token counting — penting buat ngontrol biaya
// GPT-4o: ~$2.50/1M input tokens, $10/1M output tokens

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Estimasi kasar
}

const userMessage = "Jelaskan konsep REST API";
console.log(`Estimasi token: ${estimateTokens(userMessage)}`);
// Output: Estimasi token: 7

// Beda model punya max token beda:
// GPT-4o: 128K tokens
// Claude 3.5 Sonnet: 200K tokens
// Gemini 1.5 Pro: 1M tokens
```

### RAG (Retrieval Augmented Generation)
Teknik biar AI bisa jawab berdasarkan dokumen yang dikasih, bukan cuma dari training data.

```ts
// RAG sederhana — cari dokumen relevan, terus prompt LLM
import { OpenAI } from 'openai';

const documents = [
  { id: 1, text: "Kebijakan refund: 30 hari, uang kembali penuh" },
  { id: 2, text: "Jam operasional: Senin-Jumat 08:00-17:00" },
];

// 1. Cari dokumen relevan (pake keyword simple)
function search(query: string) {
  return documents.filter(doc =>
    doc.text.toLowerCase().includes(query.toLowerCase())
  );
}

// 2. Prompt LLM dengan konteks dari dokumen
async function askWithRAG(query: string) {
  const relevantDocs = search(query);
  const context = relevantDocs.map(d => d.text).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `Jawab berdasarkan konteks ini:\n\n${context}\n\nPertanyaan: ${query}`
    }]
  });
  return response.choices[0].message.content;
}

// Output (untuk "Kapan refund?"): Kami punya kebijakan refund 30 hari, uang kembali penuh.
```

### Embedding
Representasi vektor (angka) dari teks. Buat nyari teks yang mirip secara makna (semantic search).

```ts
import { OpenAI } from 'openai';

const openai = new OpenAI();

// 1. Bikin embedding dari teks
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding; // Array 1536 angka
}

// 2. Hitung similarity pake cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB); // 1 = sangat mirip, 0 = gak mirip
}

// Contoh: cari dokumen yang mirip dengan query
const queryEmb = await getEmbedding("Cara refund produk");
const docEmb = await getEmbedding("Kebijakan refund 30 hari");
console.log(`Similarity: ${cosineSimilarity(queryEmb, docEmb)}`);
// Output: Similarity: 0.89 (mirip banget)
```

### Fine-tuning
Proses latih ulang LLM pake data spesifik biar lebih jago di domain tertentu.

```ts
// Fine-tuning OpenAI API
// Format data training:
// {"messages": [{"role": "user", "content": "Halo"}, {"role": "assistant", "content": "Halo juga!"}]}
// {"messages": [{"role": "user", "content": "Siapa kamu?"}, {"role": "assistant", "content": "Saya asisten RPL."}]}

// Upload training file
import OpenAI from 'openai';
const openai = new OpenAI();

async function fineTune() {
  const file = await openai.files.create({
    file: fs.createReadStream('training.jsonl'),
    purpose: 'fine-tune'
  });

  const job = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: 'gpt-4o-mini' // Base model
  });

  console.log(`Fine-tuning job: ${job.id}`);
  // Nunggu selesai (bisa berjam-jam)
}

// Pake model hasil fine-tuning
const response = await openai.chat.completions.create({
  model: 'ft:gpt-4o-mini:org-name:model-name:abc123',
  messages: [{ role: 'user', content: 'Halo' }]
});
```

### Agent
AI yang bisa pake tools, ngambil keputusan, dan jalanin tugas multi-langkah.

```ts
// Agent sederhana pake Mastra
import { Agent } from '@mastra/core';

const supportAgent = new Agent({
  name: 'support-agent',
  instructions: 'Kamu asisten support. Pake tools yang ada buat bantu user.',
  tools: {
    getOrderStatus: {
      description: 'Cek status pesanan',
      execute: async ({ orderId }: { orderId: string }) => {
        return { status: 'shipped', estimated: '2024-01-15' };
      }
    },
    refundOrder: {
      description: 'Refund pesanan',
      execute: async ({ orderId }: { orderId: string }) => {
        // Proses refund...
        return { success: true, refundId: 'REF-123' };
      }
    }
  }
});

// Agent otomatis milih tool yang tepat berdasarkan input user
const result = await supportAgent.generate('Mana pesanan ORDER-456?');
// Agent bakal panggil getOrderStatus({ orderId: 'ORDER-456' })
```

### Tool Calling
Kemampuan LLM buat manggil function/API yang udah didefinisikan. Kayak plugin buat AI.

```ts
// OpenAI function calling / tool calling
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Cuaca di Jakarta gimana?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'Dapetin cuaca kota',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'Nama kota' }
        },
        required: ['city']
      }
    }
  }],
  tool_choice: 'auto'
});

// Output: LLM milih manggil getWeather({ city: 'Jakarta' })
const toolCall = response.choices[0].message.tool_calls?.[0];
console.log(toolCall?.function.name);       // Output: getWeather
console.log(toolCall?.function.arguments);  // Output: {"city":"Jakarta"}
```

### Hallucination
Saat AI ngehasilin informasi yang keliatan bener tapi sebenernya salah. Bahaya kalo gak dicek.

```ts
// ❌ AI hallucination
// User: "Siapa presiden Indonesia tahun 2023?"
// AI: "Presiden Indonesia tahun 2023 adalah Bambang Suprapto" (SALAH!)
// Jawaban bener: Joko Widodo

// Cara mitigasi: RAG + fact-checking
async function safeAnswer(question: string) {
  // Pake RAG — konteks dari dokumen terpercaya
  const context = await searchDocuments(question);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jawab berdasarkan konteks. Kalau ragu, bilang "Saya gak yakin".' },
      { role: 'user', content: `Konteks: ${context}\n\nPertanyaan: ${question}` }
    ],
    temperature: 0.1 // Temperature rendah = lebih faktual
  });
  return response.choices[0].message.content;
}
```

### Temperature
Parameter yang ngontrol seberapa "kreatif" output AI. 0 = konsisten/faktual, 1 = kreatif/random.

```ts
// Temperature rendah — jawaban konsisten, cocok buat faktual
const factual = await openai.chat.completions.create({
  model: 'gpt-4o',
  temperature: 0.1,
  messages: [{ role: 'user', content: 'Apa ibu kota Indonesia?' }]
});
// Output: Jakarta ✅

// Temperature tinggi — jawaban kreatif, cocok buat brainstorming
const creative = await openai.chat.completions.create({
  model: 'gpt-4o',
  temperature: 0.9,
  messages: [{ role: 'user', content: 'Bikin slogan startup edutech' }]
});
// Output: "Belajar itu petualangan, bukan beban!" ✨
```

### System Prompt
Instruksi tetap yang dikasih ke AI di awal sesi. Nentuin personality, aturan, format.

```ts
const systemPrompt = `
Kamu adalah asisten coding untuk kurikulum RPL.
- Jawab pake bahasa Indonesia
- Prioritaskan TypeScript
- Fokus ke web development
- Kalau ada error, jelaskan penyebabnya
- Jangan ngasih code yang gak aman
`;

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Buat API endpoint login' }
  ]
});
```

### Ollama
Tools buat jalanin AI model lokal (Llama, Mistral, Gemma) di laptop sendiri — gratis dan privasi terjaga.

```bash
# Install & run Ollama
# curl -fsSL https://ollama.com/install.sh | sh

# Download & jalanin model
ollama run llama3.2

# Output:
# >>> Halo, siapa kamu?
# Halo! Saya asisten AI yang siap membantu...

# Pake dari API (mirip OpenAI)
curl http://localhost:11434/api/generate \
  -d '{"model": "llama3.2", "prompt": "Jelaskan REST API", "stream": false}'
```

### Token Limit / Context Window
Batas maksimal token yang bisa diproses LLM dalam sekali panggilan. Input + output.

```ts
// Context window sizes
const models = {
  'gpt-4o': 128_000,      // 128K tokens
  'gpt-4o-mini': 128_000, // 128K tokens
  'llama3.2': 128_000,    // 128K tokens
  'gemini-1.5-pro': 1_000_000, // 1M tokens!
};

// Penting: prompt + response gak boleh > limit
function checkTokenBudget(prompt: string, maxOutput: number, modelLimit: number) {
  const promptTokens = Math.ceil(prompt.length / 4);
  const totalNeeded = promptTokens + maxOutput;
  
  if (totalNeeded > modelLimit) {
    console.warn(`⚠️ Over limit! ${totalNeeded} > ${modelLimit}`);
  } else {
    console.log(`✅ OK: ${totalNeeded}/${modelLimit} tokens`);
  }
}
```

---

*Next: [07-framework-terms.md](07-framework-terms.md) — Istilah Framework*
