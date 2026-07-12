# Algoritma & Struktur Data — Exercise #5: Linked List

> **Level:** Intermediate
> **Topics:** linked list, node, traversal, reversal

## Instructions

Implementasikan **Singly Linked List** dengan method-method berikut:

1. `append(val)` — tambah node di akhir.
2. `prepend(val)` — tambah node di awal.
3. `delete(val)` — hapus node dengan nilai tertentu.
4. `find(val)` — cari node dengan nilai tertentu, return node atau null.
5. `toArray()` — konversi linked list ke array.
6. `reverse()` — balik linked list (in-place).

Gunakan class `ListNode` dan `LinkedList` yang sudah disediakan.

## Starter Code

```javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  append(val) {
    // TODO: tambah node di akhir
  }

  prepend(val) {
    // TODO: tambah node di awal
  }

  delete(val) {
    // TODO: hapus node dengan nilai tertentu
  }

  find(val) {
    // TODO: cari node, return null jika tidak ada
  }

  toArray() {
    // TODO: return array of values
  }

  reverse() {
    // TODO: balik linked list in-place
  }
}

const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.prepend(0);
console.log(list.toArray());    // [0, 1, 2, 3]
list.delete(2);
console.log(list.toArray());    // [0, 1, 3]
list.reverse();
console.log(list.toArray());    // [3, 1, 0]
console.log(list.find(1));      // ListNode { val: 1, next: ... }
console.log(list.find(99));     // null
```

## Expected Output

```
[ 0, 1, 2, 3 ]
[ 0, 1, 3 ]
[ 3, 1, 0 ]
ListNode { val: 1, next: ListNode { val: 0, next: null } }
null
```

## Test Cases

```javascript
const l = new LinkedList();
l.append(1); l.append(2); l.append(3);
console.log(JSON.stringify(l.toArray()) === "[1,2,3]");  // true

l.reverse();
console.log(JSON.stringify(l.toArray()) === "[3,2,1]");  // true

console.log(l.find(2).val === 2);                         // true
console.log(l.find(99) === null);                         // true

l.delete(2);
console.log(JSON.stringify(l.toArray()) === "[3,1]");     // true
```
