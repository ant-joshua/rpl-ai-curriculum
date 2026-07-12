# Mastra AI — Exercise #8: Agent Communication (Multi-Agent)

> **Level:** Advanced
> **Topics:** multi-agent, orchestrator, specialist agents, delegation

## Instructions

Buat sistem multi-agent dengan orchestrator:

1. **Orchestrator Agent** — menerima pertanyaan user, menentukan agent mana yang harus menjawab.
2. **Coding Agent** — spesialis menjawab pertanyaan coding/pemrograman.
3. **Math Agent** — spesialis menjawab pertanyaan matematika.
4. **General Agent** — menjawab pertanyaan umum.

Orchestrator akan mendistribusikan tugas ke agent yang sesuai.

## Starter Code

```javascript
// === SIMULASI BROWSER ===

// Specialist agents
const codingAgent = {
  name: 'CodingAgent',
  canHandle(query) {
    const keywords = ['javascript', 'python', 'coding', 'programming', 'function', 'array', 'variable', 'code', 'bug', 'error', 'react', 'node', 'express'];
    return keywords.some(kw => query.toLowerCase().includes(kw));
  },
  answer(query) {
    return `[CodingAgent] Saya akan bantu dengan pertanyaan coding Anda: "${query}". 
    
Tips: Coba cek dokumentasi resmi atau gunakan console.log() untuk debugging.`;
  },
};

const mathAgent = {
  name: 'MathAgent',
  canHandle(query) {
    const keywords = ['hitung', 'math', 'matematika', 'angka', 'jumlah', 'kalkulasi', 'rumus', '+', '-', '×', '÷', 'persen', 'rata-rata'];
    return keywords.some(kw => query.toLowerCase().includes(kw));
  },
  answer(query) {
    return `[MathAgent] Saya ahli matematika! "${query}" — mari kita hitung bersama.`;
  },
};

const generalAgent = {
  name: 'GeneralAgent',
  canHandle() {
    return true; // default
  },
  answer(query) {
    return `[GeneralAgent] "${query}" — Saya akan menjawab pertanyaan umum ini sebaik mungkin.`;
  },
};

// Orchestrator
class Orchestrator {
  constructor(agents) {
    this.agents = agents;
  }
  
  processQuery(query) {
    console.log(`\n🤖 Orchestrator menerima: "${query}"`);
    
    // Cari agent yang bisa menangani
    for (const agent of this.agents) {
      if (agent.canHandle(query)) {
        console.log(`📋 Menugaskan ke: ${agent.name}`);
        return agent.answer(query);
      }
    }
    
    return 'Tidak ada agent yang bisa menangani pertanyaan ini.';
  }
}

// Setup
const orchestrator = new Orchestrator([codingAgent, mathAgent, generalAgent]);

// Test
const queries = [
  'Bagaimana cara bikin function JavaScript?',
  'Berapa 12345 dikali 6789?',
  'Apa ibukota Indonesia?',
  'Tolong debugging kode React saya',
];

for (const q of queries) {
  const answer = orchestrator.processQuery(q);
  console.log(`✅ ${answer}\n`);
}
```

## Expected Output

```
🤖 Orchestrator menerima: "Bagaimana cara bikin function JavaScript?"
📋 Menugaskan ke: CodingAgent
✅ [CodingAgent] Saya akan bantu dengan pertanyaan coding Anda...

🤖 Orchestrator menerima: "Berapa 12345 dikali 6789?"
📋 Menugaskan ke: MathAgent
✅ [MathAgent] Saya ahli matematika!...

🤖 Orchestrator menerima: "Apa ibukota Indonesia?"
📋 Menugaskan ke: GeneralAgent
✅ [GeneralAgent] "Apa ibukota Indonesia?" — Saya akan menjawab...

🤖 Orchestrator menerima: "Tolong debugging kode React saya"
📋 Menugaskan ke: CodingAgent
✅ [CodingAgent] Saya akan bantu dengan pertanyaan coding Anda...
```

## Test Cases

```javascript
const orch = new Orchestrator([codingAgent, mathAgent, generalAgent]);

console.log(orch.processQuery('coding JavaScript').includes('CodingAgent'));  // true
console.log(orch.processQuery('hitung 5 + 3').includes('MathAgent'));          // true
console.log(orch.processQuery('apa kabar').includes('GeneralAgent'));          // true
```
