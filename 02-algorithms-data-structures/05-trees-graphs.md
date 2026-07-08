# 2.5 Tree & Graph

Tree & Graph = struktur data **non-linear**. Data bisa punya banyak cabang & koneksi.

## Tree — Pohon Hierarki

Tree = struktur data **bercabang**. Satu root, bercabang jadi child, tiap child bisa punya child lagi.

```
        🏠 Root (CEO)
      /    |    \
    📁    📁    📁
  Dept   Dept   Dept
   / \    / \    / \
 👤 👤  👤 👤  👤 👤
```

```typescript
class TreeNode<T> {
  constructor(
    public value: T,
    public children: TreeNode<T>[] = []
  ) {}
  
  addChild(value: T): TreeNode<T> {
    const child = new TreeNode(value);
    this.children.push(child);
    return child;
  }
}

// Bikin organisasi
const ceo = new TreeNode("Budi (CEO)");
const tech = ceo.addChild("Ani (CTO)");
const marketing = ceo.addChild("Candra (CMO)");

tech.addChild("Dewi (Lead Engineer)");
tech.addChild("Eko (DevOps)");
marketing.addChild("Fani (Content Lead)");
```

### Binary Tree — Setiap Node Max 2 Child

```typescript
class BinaryTreeNode<T> {
  constructor(
    public value: T,
    public left: BinaryTreeNode<T> | null = null,
    public right: BinaryTreeNode<T> | null = null
  ) {}
}

// Bikin binary tree sederhana
const root = new BinaryTreeNode(10);
root.left = new BinaryTreeNode(5);
root.right = new BinaryTreeNode(15);
root.left.left = new BinaryTreeNode(2);
root.left.right = new BinaryTreeNode(7);
```

### Tree Traversal — Cara Jalanin Tree

```typescript
// In-order (Left → Root → Right) — untuk BST: hasilnya TERURUT!
function inOrder<T>(node: BinaryTreeNode<T> | null): void {
  if (!node) return;
  inOrder(node.left);
  console.log(node.value);
  inOrder(node.right);
}
// Output: 2, 5, 7, 10, 15

// Pre-order (Root → Left → Right) — untuk copy/clone tree
function preOrder<T>(node: BinaryTreeNode<T> | null): void {
  if (!node) return;
  console.log(node.value);
  preOrder(node.left);
  preOrder(node.right);
}
// Output: 10, 5, 2, 7, 15

// Post-order (Left → Right → Root) — untuk delete tree
function postOrder<T>(node: BinaryTreeNode<T> | null): void {
  if (!node) return;
  postOrder(node.left);
  postOrder(node.right);
  console.log(node.value);
}
// Output: 2, 7, 5, 15, 10

// Level-order (BFS) — level by level
function levelOrder<T>(root: BinaryTreeNode<T>): void {
  const queue: BinaryTreeNode<T>[] = [root];
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    console.log(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}
// Output: 10, 5, 15, 2, 7
```

### Binary Search Tree (BST) — Cari Cepet!

BST = binary tree dengan aturan: **kiri < root < kanan**. Cari data jadi O(log n).

```typescript
class BST<T> {
  constructor(public root: BinaryTreeNode<T> | null = null) {}
  
  insert(value: T): void {
    const newNode = new BinaryTreeNode(value);
    if (!this.root) { this.root = newNode; return; }
    
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = newNode; return; }
        current = current.left;
      } else {
        if (!current.right) { current.right = newNode; return; }
        current = current.right;
      }
    }
  }
  
  search(value: T): boolean {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      if (value < current.value) current = current.left;
      else current = current.right;
    }
    return false;
  }
  
  findMin(): T | null {
    if (!this.root) return null;
    let current = this.root;
    while (current.left) current = current.left;
    return current.value;
  }
  
  findMax(): T | null {
    if (!this.root) return null;
    let current = this.root;
    while (current.right) current = current.right;
    return current.value;
  }
}

const bst = new BST<number>();
[10, 5, 15, 2, 7, 12, 20].forEach(n => bst.insert(n));
console.log(bst.search(7));  // true
console.log(bst.search(99)); // false
console.log(bst.findMin());  // 2
console.log(bst.findMax());  // 20
```

### Tree di Real Life

```typescript
// DOM Tree — setiap halaman web adalah tree
// HTML <html>
//   ├── <head> → <title>, <meta>, <link>
//   └── <body> → <div>, <p>, <img>

// File System
// /home/user/
//   ├── Documents/ → notes.md, tugas.pdf
//   ├── Projects/ → app/ → index.ts, package.json
//   └── Photos/ → liburan.jpg, selfie.png

// JSON/XML — semua data terstruktur
interface TreeNode {
  value: string;
  children: TreeNode[];
}

function findNodeValue(root: TreeNode, target: string): string | null {
  if (root.value === target) return root.value;
  for (const child of root.children) {
    const result = findNodeValue(child, target);
    if (result) return result;
  }
  return null;
}
```

## Graph — Jaringan Kompleks

Graph = tree tanpa aturan. Node bisa nyambung ke **node mana aja**, termasuk ke diri sendiri (cycle).

```typescript
class Graph {
  private adjacencyList: Map<string, string[]> = new Map();
  
  addVertex(vertex: string): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }
  
  addEdge(vertex1: string, vertex2: string): void {
    this.adjacencyList.get(vertex1)?.push(vertex2);
    this.adjacencyList.get(vertex2)?.push(vertex1); // Undirected
  }
  
  print(): void {
    for (const [vertex, edges] of this.adjacencyList) {
      console.log(`${vertex} → ${edges.join(", ")}`);
    }
  }
  
  // Depth-First Search
  dfs(start: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    
    const traverse = (vertex: string) => {
      if (!vertex || visited.has(vertex)) return;
      visited.add(vertex);
      result.push(vertex);
      for (const neighbor of this.adjacencyList.get(vertex) || []) {
        traverse(neighbor);
      }
    };
    
    traverse(start);
    return result;
  }
  
  // Breadth-First Search — cari jalur terpendek
  bfs(start: string): string[] {
    const visited = new Set<string>();
    const queue = [start];
    const result: string[] = [];
    
    visited.add(start);
    while (queue.length > 0) {
      const vertex = queue.shift()!;
      result.push(vertex);
      
      for (const neighbor of this.adjacencyList.get(vertex) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }
  
  // Shortest Path (BFS)
  shortestPath(start: string, end: string): string[] {
    const visited = new Set<string>();
    const queue: [string, string[]][] = [[start, [start]]];
    
    visited.add(start);
    while (queue.length > 0) {
      const [vertex, path] = queue.shift()!;
      
      for (const neighbor of this.adjacencyList.get(vertex) || []) {
        if (neighbor === end) return [...path, neighbor];
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([neighbor, [...path, neighbor]]);
        }
      }
    }
    return []; // No path found
  }
}

// Bikin graph — jaringan temen
const network = new Graph();
["Budi", "Ani", "Candra", "Dewi", "Eko"].forEach(n => network.addVertex(n));

network.addEdge("Budi", "Ani");
network.addEdge("Budi", "Candra");
network.addEdge("Ani", "Dewi");
network.addEdge("Candra", "Dewi");
network.addEdge("Candra", "Eko");

network.print();
// Budi → Ani, Candra
// Ani → Budi, Dewi
// Candra → Budi, Dewi, Eko
// ...

console.log(network.bfs("Budi")); // ["Budi", "Ani", "Candra", "Dewi", "Eko"]
console.log(network.shortestPath("Budi", "Eko")); // ["Budi", "Candra", "Eko"]
```

## Tree vs Graph

| Aspek | Tree | Graph |
|-------|------|-------|
| Cycle | ❌ Gak boleh ada cycle | ✅ Bisa ada cycle |
| Arah | Root → leaf (berarah) | Bisa directed/undirected |
| Koneksi | Satu parent | Banyak koneksi |
| Contoh | File system, DOM, JSON | Social network, Maps, Router |

## Latihan

1. **Max Depth Tree** — hitung kedalaman maksimum binary tree
2. **Valid BST** — cek apakah binary tree adalah BST yang valid
3. **Level Order** — print binary tree level by level
4. **Graph Route** — cek apakah ada path antara 2 node di graph
5. **Binary Tree Diameter** — jarak terpanjang antara 2 node
6. **Friend Recommendation** — di social network graph, rekomendasi temen yang bukan temen langsung tapi punya mutual
7. **Word Ladder** — ubah "kata" ke "kutu" dengan ganti 1 huruf tiap langkah. Cari langkah minimal pake BFS
