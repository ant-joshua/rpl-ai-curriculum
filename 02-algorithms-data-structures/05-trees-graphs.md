# 2.5 Trees & Graphs (Pengantar)

## Tree (Pohon)

**Struktur data hierarkis: root → child → grandchild**

```
      1  ← root
     / \
    2   3
   / \   \
  4   5   6  ← leaves (daun)
```

### Binary Tree

```typescript
class TreeNode<T> {
  constructor(
    public value: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null
  ) {}
}

// Bikin tree:
//     10
//    /  \
//   5    15
//  / \
// 3   7
const root = new TreeNode(10);
root.left = new TreeNode(5);
root.right = new TreeNode(15);
root.left.left = new TreeNode(3);
root.left.right = new TreeNode(7);
```

### Binary Search Tree (BST)

**Aturan:** Left child < parent < right child

```typescript
function searchBST(root: TreeNode<number> | null, target: number): boolean {
  if (!root) return false;
  
  if (target === root.value) return true;
  if (target < root.value) return searchBST(root.left, target);
  return searchBST(root.right, target);
}
// O(log n) — setiap langkah buang setengah tree!
```

### Tree Traversal

```typescript
// DFS - In-order (kiri, root, kanan) → hasilnya sorted
function inOrder(node: TreeNode<number> | null): void {
  if (!node) return;
  inOrder(node.left);
  console.log(node.value);
  inOrder(node.right);
}

// BFS - Level order (pakai queue)
function bfs(root: TreeNode<number> | null): void {
  const queue: TreeNode<number>[] = [];
  if (root) queue.push(root);
  
  while (queue.length > 0) {
    const node = queue.shift()!;  // dequeue
    console.log(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}
```

## Graph (Graf)

**Node + connections (edges).** Bisa satu arah (directed) atau dua arah (undirected).

```typescript
// Adjacency List — representasi graph paling umum
type Graph = Map<string, string[]>;

const graph: Graph = new Map([
  ['A', ['B', 'C']],
  ['B', ['A', 'D', 'E']],
  ['C', ['A', 'F']],
  ['D', ['B']],
  ['E', ['B', 'F']],
  ['F', ['C', 'E']],
]);

// BFS traversal
function bfsGraph(graph: Graph, start: string): void {
  const visited = new Set<string>();
  const queue: string[] = [start];
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    
    visited.add(node);
    console.log(node);
    
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }
}
```

## Kapan Dipake?

| Struktur | Use Case |
|----------|----------|
| BST | Database index, dictionary |
| Heap | Priority queue (scheduling) |
| Trie | Autocomplete, spell checker |
| Graph | Social network, maps, routing |

## LeetCode

| Problem | Difficulty |
|---------|------------|
| [Max Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree) | Easy |
| [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree) | Easy |
| [Same Tree](https://leetcode.com/problems/same-tree) | Easy |

## Latihan

1. Implement search di BST (iterative, bukan recursive)
2. Implement maxDepth — dalem mana tree-nya?
3. Invert binary tree — pernah viral siapa sanggup?
