---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 02. Algorithms & Data Structures"
footer: "Sesi 03: Stacks Queues Linkedlists"
---

<!-- _class: title -->
# 2.3 Stacks, Queues & Linked Lists

## Stack (Tumpukan)

**Prinsip: LIFO — Last In, First Out**

Analogi: tumpukan piring. Yang paling atas (terakhir ditambah) adalah yang pertama diambil.

```typescript
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  isEmpty(): boolean { return this.items.length === 0; }
  size(): number { return this.items.length; }
}

// Contoh: Browser History
const history = new Stack<string>();
history.push("google.com");
history.push("github.com");
history.push("mastra.ai");

console.log(history.pop());  // mastra.ai (back button)
console.log(history.pop());  // github.com
```

| Operasi | Big O |
|---------|-------|
| Push | O(1) |
| Pop | O(1) |
| Peek | O(1) |

**LeetCode:** [Valid Parentheses](https://leetcode.com/problems/valid-parentheses)

```typescript
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };
  
  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) return false;
    }
  }
  
  return stack.length === 0;
}
// O(n)
```

## Queue (Antrian)

**Prinsip: FIFO — First In, First Out**

Analogi: antrian kasir. Yang pertama dateng, pertama dilayani.

```typescript
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void { this.items.push(item); }
  dequeue(): T | undefined { return this.items.shift(); }  // O(n)!
  front(): T | undefined { return this.items[0]; }
  isEmpty(): boolean { return this.items.length === 0; }
}

// Contoh: Print Queue
const printQueue = new Queue<string>();
printQueue.enqueue("Dokumen 1");
printQueue.enqueue("Dokumen 2");
printQueue.enqueue("Dokumen 3");

console.log(printQueue.dequeue());  // "Dokumen 1" (yang pertama dateng, pertama keluar)
console.log(printQueue.dequeue());  // "Dokumen 2"
```

> **Catatan:** `shift()` di array JS itu O(n) karena geser element. Untuk queue yang O(1), pake linked list atau `new Queue()` dari library.

## Linked List

**Node = data + pointer ke node berikutnya**

```
[1 | *] -> [2 | *] -> [3 | null]
```

```typescript
class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null
  ) {}
}

class LinkedList<T> {
  head: ListNode<T> | null = null;
  
  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = node;
  }
  
  prepend(value: T): void {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
  }
  
  print(): void {
    let current = this.head;
    const values: T[] = [];
    while (current) {
      values.push(current.value);
      current = current.next;
    }
    console.log(values.join(' -> '));
  }
}

const list = new LinkedList<number>();
list.append(10);
list.append(20);
list.prepend(5);
list.print();  // 5 -> 10 -> 20
```

| Operasi | Array | Linked List |
|---------|-------|-------------|
| Access by index | O(1) 🟢 | O(n) 🔴 |
| Insert/Delete di awal | O(n) 🔴 | O(1) 🟢 |
| Insert/Delete di akhir | O(1) 🟢 | O(n) 🔴 |
| Search | O(n) 🔴 | O(n) 🔴 |

**LeetCode:** [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list)

## Latihan

1. Stack: implement undo/redo system sederhana
2. Queue: implement task scheduler (proses satu-satu)
3. Linked List: implement reverse (pusing? wajar, ini soal tersulit di sesi ini)
4. Valid Parentheses — solve pake stack tanpa liat jawaban
