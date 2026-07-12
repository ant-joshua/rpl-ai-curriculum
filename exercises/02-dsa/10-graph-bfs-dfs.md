# Algoritma & Struktur Data — Exercise #10: Graph BFS & DFS

> **Level:** Intermediate
> **Topics:** graph, adjacency list, BFS, DFS, traversal

## Instructions

Implementasikan traversals pada Graph menggunakan adjacency list:

1. `bfs(graph, start)` — Breadth-First Search menggunakan queue. Kembalikan array node dalam urutan kunjungan.
2. `dfsRecursive(graph, start)` — Depth-First Search secara rekursif.
3. `dfsIterative(graph, start)` — Depth-First Search menggunakan stack (iteratif).
4. `hasPath(graph, start, end)` — cek apakah ada path antara dua node (DFS).
5. `shortestPath(graph, start, end)` — cari jalur terpendek antara dua node (BFS).

Graph direpresentasikan sebagai object dengan key berupa node dan value berupa array tetangga.

## Starter Code

```javascript
function bfs(graph, start) {
  // TODO: BFS pake queue
}

function dfsRecursive(graph, start, visited = new Set()) {
  // TODO: DFS rekursif
}

function dfsIterative(graph, start) {
  // TODO: DFS pake stack
}

function hasPath(graph, start, end) {
  // TODO: cek apakah ada path dari start ke end
}

function shortestPath(graph, start, end) {
  // TODO: cari jalur terpendek pake BFS
}

const graph = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B", "F"],
  F: ["C", "E"],
};

console.log("BFS:", bfs(graph, "A"));
console.log("DFS Recursive:", dfsRecursive(graph, "A"));
console.log("DFS Iterative:", dfsIterative(graph, "A"));
console.log("Has A->F:", hasPath(graph, "A", "F"));
console.log("Has A->Z:", hasPath(graph, "A", "Z"));
console.log("Shortest A->F:", shortestPath(graph, "A", "F"));
```

## Expected Output

```
BFS: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
DFS Recursive: [ 'A', 'B', 'D', 'E', 'F', 'C' ]
DFS Iterative: [ 'A', 'C', 'F', 'E', 'B', 'D' ]
Has A->F: true
Has A->Z: false
Shortest A->F: [ 'A', 'C', 'F' ]
```

## Test Cases

```javascript
const smallGraph = {
  X: ["Y"],
  Y: ["X", "Z"],
  Z: ["Y"],
};

console.log(JSON.stringify(bfs(smallGraph, "X")));           // '["X","Y","Z"]'
console.log(hasPath(smallGraph, "X", "Z") === true);          // true
console.log(hasPath(smallGraph, "X", "W") === false);         // true

const disconnected = { A: ["B"], B: ["A"], C: ["D"], D: ["C"] };
console.log(hasPath(disconnected, "A", "C") === false);       // true

console.log(JSON.stringify(shortestPath(graph, "A", "D")));   // '["A","B","D"]'
```
