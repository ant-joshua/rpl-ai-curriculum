# Mastra AI — Exercise #2: Agent Tools (Calculator Tool)

> **Level:** Beginner
> **Topics:** createTool, Zod schema, tool executor, tool calling

## Instructions

Buat agent yang bisa menggunakan tool kalkulator untuk operasi matematika.

1. Buat tool `kalkulator` dengan schema input: `operasi` (enum: tambah/kurang/kali/bagi), `a` (number), `b` (number).
2. Tool harus menangani bagi dengan 0.
3. Agent menggunakan tool untuk menghitung.

## Starter Code

```javascript
// Conceptual example — requires @mastra/core + zod
import { createTool, Agent } from '@mastra/core';
import { z } from 'zod';

// TODO: buat calculator tool
const calculatorTool = createTool({
  name: 'kalkulator',
  description: 'Kalkulator untuk operasi matematika dasar',
  schema: z.object({
    operasi: z.enum(['tambah', 'kurang', 'kali', 'bagi']),
    a: z.number(),
    b: z.number(),
  }),
  executor: async ({ operasi, a, b }) => {
    // TODO: handle operasi
    // handle bagi dengan 0 -> throw error
  },
});

// TODO: buat agent dengan tool

// === SIMULASI BROWSER ===
function calculator(operasi, a, b) {
  switch (operasi) {
    case 'tambah': return a + b;
    case 'kurang': return a - b;
    case 'kali': return a * b;
    case 'bagi':
      if (b === 0) throw new Error('Tidak bisa membagi dengan 0');
      return a / b;
    default:
      throw new Error('Operasi tidak dikenal');
  }
}

function formatNumber(n) {
  return n.toLocaleString('id-ID');
}

function hitungDanFormat(operasi, a, b) {
  try {
    const hasil = calculator(operasi, a, b);
    return `${formatNumber(a)} ${operasi} ${formatNumber(b)} = ${formatNumber(hasil)}`;
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

console.log(hitungDanFormat('tambah', 12345, 6789));
console.log(hitungDanFormat('kali', 12345, 6789));
console.log(hitungDanFormat('bagi', 10, 0));
console.log(hitungDanFormat('bagi', 100, 3));
```

## Expected Output

```
12.345 tambah 6.789 = 19.134
12.345 kali 6.789 = 83.828.205
Error: Tidak bisa membagi dengan 0
100 bagi 3 = 33,333
```

## Test Cases

```javascript
console.log(calculator('tambah', 5, 3) === 8);       // true
console.log(calculator('kali', 4, 5) === 20);        // true
console.log(calculator('bagi', 10, 2) === 5);        // true
console.log(calculator('kurang', 10, 3) === 7);      // true

try { calculator('bagi', 1, 0); } catch(e) {
  console.log(e.message.includes('0'));               // true
}
```
