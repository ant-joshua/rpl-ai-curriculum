# Mastra AI — Exercise #3: Agent Memory

> **Level:** Intermediate
> **Topics:** Memory, conversational context, working memory, session history

## Instructions

Buat agent yang bisa mengingat percakapan sebelumnya menggunakan Memory.

1. Agent punya Memory dengan `maxTokens: 2000`.
2. Di sesi 1, user memperkenalkan diri: "Halo! Nama saya Budi".
3. Di sesi 2, agent harus ingat nama user.
4. Di sesi 3, user bilang hobi.
5. Di sesi 4, agent harus ingat nama dan hobi.

## Starter Code

```javascript
// Conceptual example — requires @mastra/core + @mastra/memory
import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';

// TODO: buat agent dengan memory

// === SIMULASI BROWSER ===
// Simulasi memory dengan object sederhana
class SimpleMemory {
  constructor() {
    this.data = {};
  }
  
  remember(key, value) {
    this.data[key] = value;
  }
  
  recall(key) {
    return this.data[key] || null;
  }
  
  getAll() {
    return { ...this.data };
  }
}

function chatSimulation(messages, memory) {
  const responses = [];
  
  for (const msg of messages) {
    // Simulasi pemrosesan pesan
    if (msg.toLowerCase().includes('halo') && msg.includes('nama')) {
      const nameMatch = msg.match(/nama saya (\w+)/i);
      if (nameMatch) {
        memory.remember('nama', nameMatch[1]);
        responses.push(`Halo ${nameMatch[1]}! Senang bertemu denganmu.`);
        continue;
      }
    }
    
    if (msg.toLowerCase().includes('siapa nama saya')) {
      const name = memory.recall('nama');
      if (name) {
        responses.push(`Nama kamu ${name}, kan?`);
      } else {
        responses.push('Maaf, saya belum tahu nama kamu.');
      }
      continue;
    }
    
    if (msg.toLowerCase().includes('suka') || msg.toLowerCase().includes('hobi')) {
      const hobbyMatch = msg.match(/(?:suka|hobi) (.+)/i);
      if (hobbyMatch) {
        memory.remember('hobi', hobbyMatch[1].trim());
        responses.push(`Wah, ${hobbyMatch[1].trim()}! Keren!`);
        continue;
      }
    }
    
    if (msg.toLowerCase().includes('tentang saya')) {
      const info = memory.getAll();
      const parts = [];
      if (info.nama) parts.push(`nama kamu ${info.nama}`);
      if (info.hobi) parts.push(`hobi kamu ${info.hobi}`);
      if (parts.length > 0) {
        responses.push(`Yang saya tahu: ${parts.join(' dan ')}. Ada yang bisa saya bantu?`);
      } else {
        responses.push('Saya belum tahu banyak tentang kamu. Ceritakan dulu!');
      }
      continue;
    }
    
    responses.push('Baik. Ada lagi yang bisa dibantu?');
  }
  
  return responses;
}

// Test
const memory = new SimpleMemory();
const messages = [
  'Halo! Nama saya Budi',
  'Siapa nama saya?',
  'Saya suka main game',
  'Apa yang kamu tau tentang saya?',
];

const responses = chatSimulation(messages, memory);
responses.forEach(r => console.log(r));
```

## Expected Output

```
Halo Budi! Senang bertemu denganmu.
Nama kamu Budi, kan?
Wah, main game! Keren!
Yang saya tahu: nama kamu Budi dan hobi kamu main game. Ada yang bisa saya bantu?
```

## Test Cases

```javascript
const mem = new SimpleMemory();
mem.remember('nama', 'Ani');
console.log(mem.recall('nama') === 'Ani');  // true
console.log(mem.recall('umur') === null);    // true
```
