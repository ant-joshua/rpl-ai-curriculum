# 2.3 Stack, Queue & Linked List

Tiga struktur data linear yang sering muncul di tech interview & real life.

## Stack — Tumpukan (LIFO)

Stack = **Last In, First Out**. Kayak tumpukan piring — yang terakhir ditumpuk, pertama diambil.

```typescript
// Stack pake Array
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item); // O(1)
  }
  
  pop(): T | undefined {
    return this.items.pop(); // O(1)
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1]; // O(1) — liat item paling atas
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
}

const stack = new Stack<number>();
stack.push(10);
stack.push(20);
stack.push(30);
console.log(stack.pop());  // 30
console.log(stack.peek()); // 20
console.log(stack.size()); // 2
```

**Stack di real life:**

```typescript
// 1. Undo/Redo di Editor
class EditorHistory {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  
  saveState(state: string): void {
    this.undoStack.push(state);
    this.redoStack = []; // Redo baru
  }
  
  undo(): string | undefined {
    const state = this.undoStack.pop();
    if (state) this.redoStack.push(state);
    return state;
  }
  
  redo(): string | undefined {
    const state = this.redoStack.pop();
    if (state) this.undoStack.push(state);
    return state;
  }
}

// 2. Browser History
class BrowserHistory {
  private backStack: string[] = [];
  private forwardStack: string[] = [];
  
  visit(url: string): void {
    this.backStack.push(url);
    this.forwardStack = []; // forward baru
  }
  
  back(): string | undefined {
    const current = this.backStack.pop();
    if (current) this.forwardStack.push(current);
    return this.backStack[this.backStack.length - 1];
  }
  
  forward(): string | undefined {
    const next = this.forwardStack.pop();
    if (next) this.backStack.push(next);
    return next;
  }
}

// 3. Parentheses Matching (soal interview!)
function isValidBrackets(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  
  for (const char of s) {
    if (['(', '[', '{'].includes(char)) {
      stack.push(char);
    } else if ([')', ']', '}'].includes(char)) {
      if (stack.pop() !== pairs[char]) return false;
    }
  }
  
  return stack.length === 0; // Pastikan ga ada yang nyisa
}
console.log(isValidBrackets("({[]})")); // true
console.log(isValidBrackets("({[})"));  // false
```

## Queue — Antrian (FIFO)

Queue = **First In, First Out**. Kayak antrian kasir — yang pertama datang, pertama dilayani.

```typescript
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item); // Masuk antrian (O(1))
  }
  
  dequeue(): T | undefined {
    return this.items.shift(); // Keluar antrian (O(n) — shift lambat!)
  }
  
  peek(): T | undefined {
    return this.items[0];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
}

// Queue LEBIH CEPET pake linked list approach
class QueueFast<T> {
  private items: Record<number, T> = {};
  private head = 0;
  private tail = 0;
  
  enqueue(item: T): void {
    this.items[this.tail] = item;
    this.tail++;
  }
  
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }
  
  peek(): T | undefined {
    return this.items[this.head];
  }
  
  isEmpty(): boolean {
    return this.head === this.tail;
  }
  
  size(): number {
    return this.tail - this.head;
  }
}
```

**Queue di real life:**

```typescript
// 1. Print Queue
const printQueue = new Queue<string>();
printQueue.enqueue("Dokumen1.pdf");
printQueue.enqueue("Foto-Liburan.jpg");
printQueue.enqueue("Tugas-RPL.docx");

while (!printQueue.isEmpty()) {
  console.log(`Mencetak: ${printQueue.dequeue()}`);
}

// 2. Task Scheduler
class TaskScheduler {
  private queue: Queue<() => Promise<void>> = new Queue();
  private running = false;
  
  addTask(task: () => Promise<void>): void {
    this.queue.enqueue(task);
    if (!this.running) this.processNext();
  }
  
  private async processNext(): Promise<void> {
    this.running = true;
    while (!this.queue.isEmpty()) {
      const task = this.queue.dequeue()!;
      await task();
    }
    this.running = false;
  }
}
```

## Linked List — Node Berantai

Linked List = data yang nyambung satu sama lain pake pointer. **Ga pake index** — cuma tau node selanjutnya.

```typescript
class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null
  ) {}
}

class LinkedList<T> {
  constructor(public head: ListNode<T> | null = null) {}
  
  // Tambah di awal (O(1))
  prepend(value: T): void {
    const newNode = new ListNode(value, this.head);
    this.head = newNode;
  }
  
  // Tambah di akhir (O(n))
  append(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }
  
  // Hapus value (O(n))
  delete(value: T): void {
    if (!this.head) return;
    if (this.head.value === value) {
      this.head = this.head.next;
      return;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }
  
  // Cari value (O(n))
  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }
  
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

const list = new LinkedList<number>();
list.prepend(10);
list.prepend(20);
list.append(30);
console.log(list.toArray()); // [20, 10, 30]
list.delete(10);
console.log(list.toArray()); // [20, 30]
```

### Array vs Linked List

| Operasi | Array | Linked List |
|---------|-------|-------------|
| Akses index | O(1) 🏆 | O(n) ❌ |
| Insert/Delete awal | O(n) ❌ | O(1) 🏆 |
| Insert/Delete akhir | O(1) | O(n) (O(1) kalo pake tail) |
| Memory | Bersebelahan, cache-friendly | Tersebar, pointer overhead |
| Search | O(n) | O(n) |

> **Kapan pake Linked List:** Kalo banyak insert/delete di tengah, atau ukuran data dinamis banget. Kalo kebanyakan read/akses random — pake Array.

### Soal Interview Sering

```typescript
// 1. Reverse Linked List
function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let current = head;
  
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}

// 2. Detect Cycle (Floyd's Algorithm)
function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head;
  let fast = head;
  
  while (fast?.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true; // ketemu lagi — ada cycle!
  }
  return false;
}

// 3. Find Middle Node
function findMiddle<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow = head;
  let fast = head;
  
  while (fast?.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow; // pas di tengah
}
```

## Latihan

1. **Valid Parentheses** — cek apakah string `"({[]})"` valid
2. **Min Stack** — stack yang bisa return nilai minimal dalam O(1)
3. **Queue pake Stack** — implement queue cuma pake 2 stack
4. **Reverse Linked List** — balikin urutan linked list
5. **Merge Two Sorted Lists** — gabung 2 linked list yang udah terurut
6. **Remove Nth Node From End** — hapus node ke-N dari belakang
7. **Palindrome Linked List** — cek apakah linked list palindrom
