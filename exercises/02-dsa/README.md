# 🏋️ Latihan Algoritma & Struktur Data

> 15+ latihan DSA dari dasar sampai lanjutan. Setiap soal ada starter code, test cases, dan expected output.
> Kerjakan dengan TypeScript.

---

## 📋 Daftar Isi

| # | Topik | Struktur Data | Level |
|---|-------|---------------|-------|
| 1 | Big O Identification | Analysis | 🌱 Beginner |
| 2 | Two Sum | Array / Map | 🌱 Beginner |
| 3 | Valid Parentheses | Stack | 🌱 Beginner |
| 4 | Reverse Linked List | Linked List | 🌱 Beginner |
| 5 | Merge Sort | Sorting | 🌱 Beginner |
| 6 | Max Depth of Binary Tree | Tree / Recursion | 🌱 Beginner |
| 7 | Queue with Two Stacks | Queue / Stack | 🌱 Beginner |
| 8 | Binary Search | Array | 🌱 Beginner |
| 9 | FizzBuzz | Loops | 🌱 Beginner |
| 10 | Palindrome Number | Math / String | 🌱 Beginner |
| 11 | Anagram Check | Hash Map | 📐 Intermediate |
| 12 | Graph BFS & DFS | Graph | 📐 Intermediate |
| 13 | Invert Binary Tree | Tree / Recursion | 📐 Intermediate |
| 14 | LRU Cache | Linked List / Map | 📐 Intermediate |
| 15 | Dynamic Programming — Fibonacci | DP | 📐 Intermediate |
| 16 | Longest Substring Without Repeating | Sliding Window | 📐 Intermediate |
| 17 | Dijkstra Algorithm | Graph / Heap | 🚀 Advanced |
| 18 | Edit Distance (Levenshtein) | DP | 🚀 Advanced |
| 19 | Trie — Autocomplete | Trie | 🚀 Advanced |
| 20 | Quick Select (kth Smallest) | Quickselect | 🚀 Advanced |

---

## 🌱 Beginner

### 1. Big O Identification

```typescript
// Identifikasi Big O dari setiap function

function soal1(arr: number[]) {
  for (let i = 0; i < arr.length; i++) console.log(arr[i]);
}
// Big O: ?

function soal2(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}
// Big O: ?

function soal3(n: number) {
  let count = 0;
  while (n > 1) { n = Math.floor(n / 2); count++; }
  return count;
}
// Big O: ?

function soal4(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
// Big O: ?

function soal5(arr: number[]) {
  const map = new Map<number, boolean>();
  for (const num of arr) {
    if (map.has(num)) return true;
    map.set(num, true);
  }
  return false;
}
// Big O: ?
```

**Jawaban:** O(n), O(n²), O(log n), O(n²), O(n)

---

### 2. Two Sum

```typescript
function twoSum(nums: number[], target: number): number[] {
  // Input: [2, 7, 11, 15], target 9
  // Output: [0, 1] (karena 2 + 7 = 9)
  // Optimalkan dari O(n²) ke O(n) pake Map
  // === KODE LO DISINI ===
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9));    // [0, 1]
console.log(twoSum([3, 2, 4], 6));          // [1, 2]
console.log(twoSum([3, 3], 6));             // [0, 1]
console.log(twoSum([1, 2, 3, 4, 5], 8));   // [2, 4]
```

**Expected Output:**
```
[0, 1]
[1, 2]
[0, 1]
[2, 4]
```

---

### 3. Valid Parentheses

```typescript
function isValid(s: string): boolean {
  // "()[]{}" -> true
  // "(]" -> false
  // "([{}])" -> true
  // "{[(])}" -> false
  // Hint: Stack
  // === KODE LO DISINI ===
}

// Test cases
console.log(isValid("()"));       // true
console.log(isValid("()[]{}"));   // true
console.log(isValid("(]"));       // false
console.log(isValid("([{}])"));   // true
console.log(isValid("{[(])}"));   // false
console.log(isValid(""));         // true (empty string)
console.log(isValid("((("));      // false
```

**Expected Output:**
```
true
true
false
true
false
true
false
```

---

### 4. Reverse Linked List

```typescript
class ListNode {
  constructor(
    public val: number,
    public next: ListNode | null = null
  ) {}
}

function reverseList(head: ListNode | null): ListNode | null {
  // Balik linked list
  // Input: 1 -> 2 -> 3 -> 4 -> 5 -> null
  // Output: 5 -> 4 -> 3 -> 2 -> 1 -> null
  // === KODE LO DISINI ===
}

function arrayToList(arr: number[]): ListNode | null {
  if (arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }
  return head;
}

function listToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  let current = head;
  while (current) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

const list = arrayToList([1, 2, 3, 4, 5]);
console.log(listToArray(reverseList(list))); // [5, 4, 3, 2, 1]
console.log(listToArray(reverseList(null))); // []
console.log(listToArray(reverseList(new ListNode(1)))); // [1]
```

**Expected Output:**
```
[5, 4, 3, 2, 1]
[]
[1]
```

---

### 5. Merge Sort

```typescript
function mergeSort(arr: number[]): number[] {
  // Implementasi merge sort
  // 1. Base case: arr.length <= 1 -> return arr
  // 2. Split array jadi dua bagian
  // 3. Rekursif sort kedua bagian
  // 4. Merge hasilnya
  // === KODE LO DISINI ===
}

// Test cases
console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
console.log(mergeSort([5, 4, 3, 2, 1]));
// [1, 2, 3, 4, 5]
console.log(mergeSort([1]));
// [1]
console.log(mergeSort([]));
// []
```

**Expected Output:**
```
[3, 9, 10, 27, 38, 43, 82]
[1, 2, 3, 4, 5]
[1]
[]
```

---

### 6. Max Depth of Binary Tree

```typescript
class TreeNode {
  constructor(
    public val: number,
    public left?: TreeNode | null,
    public right?: TreeNode | null
  ) {
    this.left = left ?? null;
    this.right = right ?? null;
  }
}

function maxDepth(root: TreeNode | null): number {
  // Hitung depth maksimum binary tree
  // Kalau null: depth 0
  // Hint: rekursif, ambil max(left, right) + 1
  // === KODE LO DISINI ===
}

// Test case 1: tree with 3 levels
const tree1 = new TreeNode(3);
tree1.left = new TreeNode(9);
tree1.right = new TreeNode(20, new TreeNode(15), new TreeNode(7));
console.log(maxDepth(tree1)); // 3

// Test case 2: single node
console.log(maxDepth(new TreeNode(1))); // 1

// Test case 3: null
console.log(maxDepth(null)); // 0

// Test case 4: unbalanced tree
const tree4 = new TreeNode(1);
tree4.left = new TreeNode(2);
tree4.left.left = new TreeNode(3);
tree4.left.left.left = new TreeNode(4);
console.log(maxDepth(tree4)); // 4
```

**Expected Output:**
```
3
1
0
4
```

---

### 7. Queue with Two Stacks

```typescript
class QueueWithStacks<T> {
  private stackIn: T[] = [];
  private stackOut: T[] = [];

  // enqueue: push ke stackIn
  enqueue(item: T): void {
    // === KODE LO DISINI ===
  }

  // dequeue: kalau stackOut kosong, pindahin semua dari stackIn ke stackOut
  dequeue(): T | undefined {
    // === KODE LO DISINI ===
  }

  peek(): T | undefined {
    // === KODE LO DISINI ===
  }

  isEmpty(): boolean {
    // === KODE LO DISINI ===
  }
}

const queue = new QueueWithStacks<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
console.log(queue.dequeue()); // 1
console.log(queue.peek());    // 2
console.log(queue.dequeue()); // 2
console.log(queue.isEmpty()); // false
console.log(queue.dequeue()); // 3
console.log(queue.isEmpty()); // true
console.log(queue.dequeue()); // undefined
```

**Expected Output:**
```
1
2
2
false
3
true
undefined
```

---

### 8. Binary Search

```typescript
function binarySearch(arr: number[], target: number): number {
  // Cari index target di array TERURUT
  // Return -1 kalau tidak ditemukan
  // === KODE LO DISINI ===
}

// Test cases
const sortedArr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log(binarySearch(sortedArr, 7));  // 3
console.log(binarySearch(sortedArr, 1));  // 0
console.log(binarySearch(sortedArr, 19)); // 9
console.log(binarySearch(sortedArr, 2));  // -1
console.log(binarySearch([], 5));         // -1
console.log(binarySearch([5], 5));        // 0
```

**Expected Output:**
```
3
0
9
-1
-1
0
```

---

### 9. FizzBuzz

```typescript
function fizzBuzz(n: number): string[] {
  // Return array string dari 1 sampai n dengan aturan:
  // - Kelipatan 3: "Fizz"
  // - Kelipatan 5: "Buzz"
  // - Kelipatan 3 dan 5: "FizzBuzz"
  // - Lainnya: angka sebagai string
  // === KODE LO DISINI ===
}

console.log(fizzBuzz(15));
```

**Expected Output:**
```
["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
```

---

### 10. Palindrome Number

```typescript
function isPalindromeNumber(x: number): boolean {
  // Cek apakah integer adalah palindrome
  // 121 -> true (baca kiri kanan sama)
  // -121 -> false (karena -121 != 121-)
  // 10 -> false
  // TANPA konversi ke string
  // === KODE LO DISINI ===
}

// Test cases
console.log(isPalindromeNumber(121));   // true
console.log(isPalindromeNumber(-121));  // false
console.log(isPalindromeNumber(10));    // false
console.log(isPalindromeNumber(0));     // true
console.log(isPalindromeNumber(12321)); // true
console.log(isPalindromeNumber(1221));  // true
```

**Expected Output:**
```
true
false
false
true
true
true
```

---

## 📐 Intermediate

### 11. Anagram Check

```typescript
function isAnagram(s: string, t: string): boolean {
  // Cek apakah t adalah anagram dari s
  // "anagram", "nagaram" -> true
  // "rat", "car" -> false
  // Hint: Map atau sort
  // === KODE LO DISINI ===
}

// Test cases
console.log(isAnagram("anagram", "nagaram"));    // true
console.log(isAnagram("rat", "car"));             // false
console.log(isAnagram("", ""));                   // true
console.log(isAnagram("listen", "silent"));       // true
console.log(isAnagram("hello", "world"));         // false
console.log(isAnagram("aacc", "ccac"));           // false
```

**Expected Output:**
```
true
false
true
true
false
false
```

---

### 12. Graph BFS & DFS

```typescript
interface Graph {
  [key: string]: string[];
}

const graph: Graph = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B", "F"],
  F: ["C", "E"],
};

function bfs(graph: Graph, start: string): string[] {
  // Breadth-First Search
  // Return array node dalam urutan kunjungan
  // === KODE LO DISINI ===
}

function dfs(graph: Graph, start: string): string[] {
  // Depth-First Search (rekursif)
  // Return array node dalam urutan kunjungan
  // === KODE LO DISINI ===
}

console.log("BFS:", bfs(graph, "A"));
console.log("DFS:", dfs(graph, "A"));
```

**Expected Output (salah satu kemungkinan):**
```
BFS: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
DFS: [ 'A', 'B', 'D', 'E', 'F', 'C' ]
```

---

### 13. Invert Binary Tree

```typescript
function invertTree(root: TreeNode | null): TreeNode | null {
  // Tukar left child dan right child di setiap node
  // Mirip soal di LeetCode 226 — yang bikin Homebrew founder
  // ditolak Google gara-gara gak bisa ini 😂
  // === KODE LO DISINI ===
}

// Helper: print tree level-order
function treeToArray(root: TreeNode | null): (number | null)[] {
  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left ?? null);
      queue.push(node.right ?? null);
    } else {
      result.push(null);
    }
  }
  // Trim trailing nulls
  while (result[result.length - 1] === null) result.pop();
  return result;
}

// Test
const tree = new TreeNode(4);
tree.left = new TreeNode(2, new TreeNode(1), new TreeNode(3));
tree.right = new TreeNode(7, new TreeNode(6), new TreeNode(9));

console.log("Original:", treeToArray(tree));
// [4, 2, 7, 1, 3, 6, 9]

const inverted = invertTree(tree);
console.log("Inverted:", treeToArray(inverted));
// [4, 7, 2, 9, 6, 3, 1]
```

**Expected Output:**
```
Original: [4, 2, 7, 1, 3, 6, 9]
Inverted: [4, 7, 2, 9, 6, 3, 1]
```

---

### 14. LRU Cache

```typescript
class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    // === KODE LO DISINI ===
  }

  get(key: number): number {
    // Ambil value, kalau ada pindahkan key ke paling baru
    // Return -1 kalau tidak ada
    // === KODE LO DISINI ===
  }

  put(key: number, value: number): void {
    // Simpan key-value. Kalau melebihi capacity,
    // hapus yang paling lama (LRU)
    // === KODE LO DISINI ===
  }
}

const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1));    // 1
lru.put(3, 3);              // Evict key 2
console.log(lru.get(2));    // -1 (already evicted)
lru.put(4, 4);              // Evict key 1
console.log(lru.get(1));    // -1
console.log(lru.get(3));    // 3
console.log(lru.get(4));    // 4
```

**Expected Output:**
```
1
-1
-1
3
4
```

---

### 15. Dynamic Programming — Fibonacci

```typescript
// Versi rekursif biasa (O(2^n) — lambat!)
function fibRecursive(n: number): number {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// Versi DP — memoization (top-down)
function fibMemo(n: number, memo: Record<number, number> = {}): number {
  // === KODE LO DISINI ===
}

// Versi DP — tabulation (bottom-up)
function fibTab(n: number): number {
  // === KODE LO DISINI ===
}

// Versi optimal O(1) space
function fibOptimized(n: number): number {
  // === KODE LO DISINI ===
}

console.log("fibMemo(10):", fibMemo(10));      // 55
console.log("fibTab(10):", fibTab(10));         // 55
console.log("fibOptimized(10):", fibOptimized(10)); // 55
console.log("fibMemo(50):", fibMemo(50));       // 12586269025
```

**Expected Output:**
```
fibMemo(10): 55
fibTab(10): 55
fibOptimized(10): 55
fibMemo(50): 12586269025
```

---

### 16. Longest Substring Without Repeating Characters

```typescript
function lengthOfLongestSubstring(s: string): number {
  // Cari panjang substring terpanjang TANPA karakter berulang
  // "abcabcbb" -> 3 ("abc")
  // "bbbbb" -> 1 ("b")
  // "pwwkew" -> 3 ("wke")
  // Hint: sliding window + Map
  // === KODE LO DISINI ===
}

// Test cases
console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));     // 1
console.log(lengthOfLongestSubstring("pwwkew"));    // 3
console.log(lengthOfLongestSubstring(""));          // 0
console.log(lengthOfLongestSubstring(" "));         // 1
console.log(lengthOfLongestSubstring("dvdf"));      // 3
```

**Expected Output:**
```
3
1
3
0
1
3
```

---

## 🚀 Advanced

### 17. Dijkstra — Shortest Path

```typescript
interface WeightedGraph {
  [node: string]: { node: string; weight: number }[];
}

function dijkstra(
  graph: WeightedGraph,
  start: string,
  end: string
): { distance: number; path: string[] } {
  // Implementasi Dijkstra pake priority queue sederhana
  // Return jarak terpendek + path
  // === KODE LO DISINI ===
}

const weightedGraph: WeightedGraph = {
  A: [{ node: "B", weight: 4 }, { node: "C", weight: 2 }],
  B: [{ node: "A", weight: 4 }, { node: "C", weight: 1 }, { node: "D", weight: 5 }],
  C: [{ node: "A", weight: 2 }, { node: "B", weight: 1 }, { node: "D", weight: 8 }, { node: "E", weight: 10 }],
  D: [{ node: "B", weight: 5 }, { node: "C", weight: 8 }, { node: "E", weight: 2 }],
  E: [{ node: "C", weight: 10 }, { node: "D", weight: 2 }],
};

console.log(dijkstra(weightedGraph, "A", "E"));
// { distance: 8, path: ['A', 'B', 'D', 'E'] }
// (A->B = 4, B->D = 5, D->E = 2 = total 11)
// TAPI lebih pendek: A->C->B->D->E? A->C=2, C->B=1, B->D=5, D->E=2 = 10
// Atau A->C->D->E? A->C=2, C->D=8, D->E=2 = 12
// Atau: A->B->D->E = 4+5+2 = 11
// Atau: A->B->C->D->E = 4+1+8+2 = 15
// Yang benar: A->C->B->D->E = 2+1+5+2 = 10
```

---

### 18. Edit Distance (Levenshtein)

```typescript
function minDistance(word1: string, word2: string): number {
  // Hitung minimum operasi untuk mengubah word1 jadi word2
  // Operasi: insert, delete, replace
  // Contoh: "kitten" -> "sitting" = 3
  // Hint: DP 2D matrix
  // === KODE LO DISINI ===
}

// Test cases
console.log(minDistance("", ""));            // 0
console.log(minDistance("a", ""));           // 1
console.log(minDistance("", "a"));           // 1
console.log(minDistance("horse", "ros"));    // 3
console.log(minDistance("intention", "execution")); // 5
console.log(minDistance("kitten", "sitting")); // 3
```

**Expected Output:**
```
0
1
1
3
5
3
```

---

### 19. Trie — Autocomplete

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

class Trie {
  private root: TrieNode = new TrieNode();

  insert(word: string): void {
    // Masukkan kata ke Trie
    // === KODE LO DISINI ===
  }

  search(word: string): boolean {
    // Cek apakah kata ada di Trie
    // === KODE LO DISINI ===
  }

  startsWith(prefix: string): boolean {
    // Cek apakah ada kata yang dimulai dengan prefix
    // === KODE LO DISINI ===
  }

  autocomplete(prefix: string): string[] {
    // Return semua kata yang dimulai dengan prefix
    // === KODE LO DISINI ===
  }
}

const trie = new Trie();
trie.insert("apple");
trie.insert("app");
trie.insert("apartment");
trie.insert("application");
trie.insert("banana");

console.log(trie.search("apple"));        // true
console.log(trie.search("app"));          // true
console.log(trie.search("appl"));         // false
console.log(trie.startsWith("app"));      // true
console.log(trie.startsWith("ban"));      // true
console.log(trie.startsWith("xyz"));      // false
console.log(trie.autocomplete("app"));
// ["app", "apple", "application", "apartment"] atau ["app", "apartment", "apple", "application"]
```

**Expected Output:**
```
true
true
false
true
true
false
[ 'app', 'apple', 'application', 'apartment' ]
```

---

### 20. Quickselect — Kth Smallest

```typescript
function quickselect(arr: number[], k: number): number {
  // Cari elemen ke-k terkecil (0-indexed)
  // Contoh: [3, 2, 1, 5, 6, 4], k=2 -> 3 (karena [1, 2, 3, 4, 5, 6], index 2 = 3)
  // Hint: pilih pivot, partisi, rekursif ke sisi yang mengandung k
  // === KODE LO DISINI ===
}

// Test cases
console.log(quickselect([3, 2, 1, 5, 6, 4], 2));   // 3
console.log(quickselect([3, 2, 1, 5, 6, 4], 0));   // 1
console.log(quickselect([3, 2, 1, 5, 6, 4], 5));   // 6
console.log(quickselect([1], 0));                    // 1
console.log(quickselect([7, 10, 4, 3, 20, 15], 3)); // 10
```

**Expected Output:**
```
3
1
6
1
10
```

---

## 📊 Matrix Test Cases

Untuk nge-verify solusi lo, copy array berikut:

```typescript
// Test runner sederhana
function runTests() {
  const tests = [
    { fn: () => twoSum([2, 7, 11, 15], 9), expected: [0, 1] },
    { fn: () => isValid("()[]{}"), expected: true },
    { fn: () => isPalindromeNumber(121), expected: true },
    { fn: () => mergeSort([38, 27, 43, 3, 9, 82, 10]), expected: [3, 9, 10, 27, 38, 43, 82] },
  ];

  tests.forEach((test, i) => {
    const result = test.fn();
    const pass = JSON.stringify(result) === JSON.stringify(test.expected);
    console.log(`Test ${i + 1}: ${pass ? "✅ PASS" : "❌ FAIL"} | Got: ${JSON.stringify(result)} | Expected: ${JSON.stringify(test.expected)}`);
  });
}
// runTests();
```

---

## 💡 Tips Mengerjakan

1. **Pahami problem dulu** — coba contoh input/output manual
2. **Brute force dulu** — bikin yang jalan, baru optimalkan
3. **Gambar dulu** — untuk tree, graph, linked list
4. **Edge cases**: input kosong, 1 elemen, null, negative
5. **Complexity**: setelah selesai, hitung time & space complexity
6. **Practice**: kerjakan ulang tanpa liat jawaban seminggu kemudian

## 🔍 Hint

| # | Hint |
|---|------|
| 1 | Hitung jumlah iterasi relatif terhadap input size |
| 2 | Map key: `target - current`, value: index |
| 3 | Map buka: `{ '(': ')', '{': '}', '[': ']' }` |
| 4 | Tiga pointer: prev, current, next |
| 5 | `merge(left, right)` — dua pointer |
| 6 | Base case: `if (!root) return 0` |
| 7 | Pindahin dari stackIn ke stackOut pas stackOut kosong |
| 8 | `while (left <= right)` — mid = Math.floor((left+right)/2) |
| 9 | `i % 15 === 0` dulu, baru `% 3`, `% 5` |
| 10 | Balik setengah angka: `reversed = reversed * 10 + x % 10` |
| 11 | `s.split('').sort().join('') === t.split('').sort().join('')` |
| 12 | BFS: queue, visited Set; DFS: stack / rekursif |
| 13 | `const temp = root.left; root.left = root.right; root.right = temp` |
| 14 | Map maintain order — hapus + set ulang |
| 15 | `memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo)` |
| 16 | Dua pointer: left = 0, right = 0; Map<char, index+1> |
| 17 | Priority queue + distance map |
| 18 | DP[i][j] = min(DP[i-1][j], DP[i][j-1], DP[i-1][j-1]) + (cost) |
| 19 | Setiap node punya Map<Character, TrieNode> |
| 20 | Pilih pivot random, partisi, rekursif |

---

Selamat ngoding! 🚀
