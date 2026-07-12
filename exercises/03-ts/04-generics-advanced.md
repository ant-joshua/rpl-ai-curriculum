# TypeScript — Exercise #4: Generics Advanced

> **Level:** Intermediate
> **Topics:** generic constraints, generic interfaces, keyof, conditional

## Instructions

Buat implementasi generic dengan constraint:

1. `logLength(item)` — generic dengan constraint `{ length: number }`. Log panjang item.
2. `getProperty(obj, key)` — generic dengan constraint `keyof`. Akses properti object secara type-safe.
3. `ApiResponse` — generic interface untuk wrapped response: `{ success, data, message?, timestamp }`.
4. `Stack<T>` — generic class Stack (LIFO) dengan method `push`, `pop`, `peek`, `isEmpty`.

## Starter Code

```javascript
// TODO: generic constraint
function logLength(item) {
  console.log(`Panjang: ${item.length}`);
}

// TODO: keyof generic
function getProperty(obj, key) {
  return obj[key];
}

// TODO: implementasi ApiResponse
const response = {
  success: true,
  data: { id: 1, name: "Budi" },
  timestamp: Date.now()
};

// TODO: generic Stack class
class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

// Test logLength
logLength("Hello");
logLength([1, 2, 3]);
logLength({ length: 10 });

// Test getProperty
const user = { name: "Budi", age: 17, email: "budi@test.com" };
console.log(getProperty(user, "name"));
console.log(getProperty(user, "age"));

// Test Stack
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop());
console.log(stack.peek());
console.log(stack.isEmpty());
```

## Expected Output

```
Panjang: 5
Panjang: 3
Panjang: 10
Budi
17
3
2
false
```

## Test Cases

```javascript
const t = { a: 1, b: 2 };
console.log(getProperty(t, "a") === 1);              // true
console.log(getProperty(t, "b") === 2);              // true

const s = new Stack();
console.log(s.isEmpty() === true);                    // true
s.push(10);
console.log(s.isEmpty() === false);                   // true
console.log(s.pop() === 10);                          // true
console.log(s.isEmpty() === true);                    // true
```
