# Mastra AI — Exercise #5: Workflow Chain (Sequential)

> **Level:** Intermediate
> **Topics:** Workflow, sequential steps, chain, pipeline, step dependencies

## Instructions

Buat workflow berantai (sequential pipeline) dengan Mastra:

1. **Step 1: Writer** — menulis draft artikel tentang AI untuk anak SMK.
2. **Step 2: Editor** — mereview dan memperbaiki artikel dari Writer.
3. **Step 3: Formatter** — memformat artikel final dengan markdown.

Setiap step bergantung pada output step sebelumnya.

## Starter Code

```javascript
// Conceptual example — requires @mastra/core
import { Workflow } from '@mastra/core';

// === SIMULASI BROWSER ===
// Workflow chain simulation

class WorkflowStep {
  constructor(name, processor) {
    this.name = name;
    this.processor = processor;
  }
  
  async execute(input) {
    console.log(`\n[${this.name}] Memproses...`);
    const result = await this.processor(input);
    console.log(`[${this.name}] Selesai`);
    return result;
  }
}

class WorkflowChain {
  constructor(name) {
    this.name = name;
    this.steps = [];
  }
  
  addStep(step) {
    this.steps.push(step);
    return this;
  }
  
  async execute(initialInput) {
    console.log(`\n===== ${this.name} =====`);
    let currentInput = initialInput;
    
    for (const step of this.steps) {
      currentInput = await step.execute(currentInput);
    }
    
    console.log(`\n===== SELESAI =====`);
    return currentInput;
  }
}

// Buat workflow
const writingWorkflow = new WorkflowChain('WritingPipeline');

// Step 1: Writer Agent
writingWorkflow.addStep(new WorkflowStep('Writer', async (input) => {
  return `# Artikel: ${input.topic}\n\n${input.topic} adalah teknologi yang mengubah cara kita hidup. Di era digital ini, pemahaman tentang ${input.topic} sangat penting untuk siswa SMK agar siap menghadapi dunia kerja.\n\n## Manfaat ${input.topic}\n1. Meningkatkan efisiensi\n2. Membuka peluang karir baru\n3. Mempermudah pekerjaan sehari-hari`;
}));

// Step 2: Editor Agent
writingWorkflow.addStep(new WorkflowStep('Editor', async (draft) => {
  // Review dan perbaiki
  let reviewed = draft.replace('Meningkatkan efisiensi', 'Meningkatkan efisiensi kerja');
  reviewed += '\n\n*Diedit oleh Editor AI*';
  return reviewed;
}));

// Step 3: Formatter Agent
writingWorkflow.addStep(new WorkflowStep('Formatter', async (edited) => {
  return `${edited}\n\n---\n\n> Artikel ini ditulis secara otomatis untuk tujuan pembelajaran.`;
}));

// Execute
const result = await writingWorkflow.execute({ topic: 'Kecerdasan Buatan (AI)' });
console.log('\nHasil Final:');
console.log(result);
```

## Expected Output

```
===== WritingPipeline =====

[Writer] Memproses...
[Writer] Selesai

[Editor] Memproses...
[Editor] Selesai

[Formatter] Memproses...
[Formatter] Selesai

===== SELESAI =====

Hasil Final:
# Artikel: Kecerdasan Buatan (AI)
...
```

## Test Cases

```javascript
const wf = new WorkflowChain('Test');
wf.addStep(new WorkflowStep('Double', async (x) => x * 2));
wf.addStep(new WorkflowStep('AddOne', async (x) => x + 1));

wf.execute(5).then(r => {
  console.log(r === 11);  // true: 5 * 2 = 10, 10 + 1 = 11
});
```
