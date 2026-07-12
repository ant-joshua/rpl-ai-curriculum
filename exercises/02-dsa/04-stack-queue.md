# Algoritma & Struktur Data — Exercise #4: Stack & Queue

> **Level:** Beginner
> **Topics:** stack, queue, LIFO, FIFO

## Instructions

Implementasikan struktur data Stack (LIFO) dan Queue (FIFO) menggunakan array.

**Stack:**
- `push(item)` — tambah item ke atas stack.
- `pop()` — hapus dan return item dari atas.
- `peek()` — lihat item paling atas tanpa menghapus.
- `isEmpty()` — cek apakah stack kosong.

**Queue:**
- `enqueue(item)` — tambah item ke belakang antrian.
- `dequeue()` — hapus dan return item dari depan.
- `front()` — lihat item paling depan tanpa menghapus.
- `isEmpty()` — cek apakah queue kosong.

**Bonus: Valid Parentheses** — gunakan stack untuk mengecek apakah string berisi tanda kurung yang valid.

## Starter Code

```javascript
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    // TODO
  }

  pop() {
    // TODO
  }

  peek() {
    // TODO
  }

  isEmpty() {
    // TODO
  }
}

class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    // TODO
  }

  dequeue() {
    // TODO
  }

  front() {
    // TODO
  }

  isEmpty() {
    // TODO
  }
}

function isValidParentheses(s) {
  // TODO: gunakan stack untuk cek valid parentheses
  // "()[]{}" -> true
  // "(]" -> false
  // "([{}])" -> true
}

// Test Stack
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop());    // 3
console.log(stack.peek());   // 2
console.log(stack.isEmpty());// false

// Test Queue
const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
console.log(queue.dequeue());// 1
console.log(queue.front());  // 2
console.log(queue.isEmpty());// false

// Test Valid Parentheses
console.log(isValidParentheses("()"));       // true
console.log(isValidParentheses("()[]{}"));   // true
console.log(isValidParentheses("(]"));       // false
console.log(isValidParentheses("([{}])"));   // true
```

## Expected Output

```
3
2
false
1
2
false
true
true
false
true
```

## Test Cases

```javascript
const s = new Stack();
s.push(10); s.push(20);
console.log(s.pop() === 20);           // true
console.log(s.peek() === 10);          // true
console.log(s.isEmpty() === false);    // true
s.pop();
console.log(s.isEmpty() === true);     // true

const q = new Queue();
q.enqueue("a"); q.enqueue("b");
console.log(q.dequeue() === "a");      // true
console.log(q.front() === "b");        // true

console.log(isValidParentheses("({[]})") === true);   // true
console.log(isValidParentheses("{[(])}") === false);  // true
```
