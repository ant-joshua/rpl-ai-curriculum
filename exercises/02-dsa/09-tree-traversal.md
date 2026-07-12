# Algoritma & Struktur Data — Exercise #9: Tree Traversal

> **Level:** Intermediate
> **Topics:** binary tree, BFS, DFS, in-order, pre-order, post-order

## Instructions

Implementasikan traversals pada Binary Tree:

1. `inorder(root)` — kunjungi left → root → right.
2. `preorder(root)` — kunjungi root → left → right.
3. `postorder(root)` — kunjungi left → right → root.
4. `levelOrder(root)` — BFS, kunjungi level per level.
5. `maxDepth(root)` — hitung kedalaman maksimum tree.
6. `invertTree(root)` — balik tree (tukar left dan right di setiap node).

Gunakan class `TreeNode` yang sudah disediakan.

## Starter Code

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorder(root) {
  // TODO: left -> root -> right (rekursif)
}

function preorder(root) {
  // TODO: root -> left -> right
}

function postorder(root) {
  // TODO: left -> right -> root
}

function levelOrder(root) {
  // TODO: BFS pake queue
}

function maxDepth(root) {
  // TODO: kedalaman maksimum (rekursif)
}

function invertTree(root) {
  // TODO: tukar left dan right di setiap node
}

// Build tree:
//       1
//      / \
//     2   3
//    / \   \
//   4   5   6
const root = new TreeNode(1);
root.left = new TreeNode(2, new TreeNode(4), new TreeNode(5));
root.right = new TreeNode(3, null, new TreeNode(6));

console.log("Inorder:", inorder(root));
console.log("Preorder:", preorder(root));
console.log("Postorder:", postorder(root));
console.log("Level Order:", levelOrder(root));
console.log("Max Depth:", maxDepth(root));

const inverted = invertTree(root);
console.log("Inverted Level Order:", levelOrder(inverted));
```

## Expected Output

```
Inorder: [ 4, 2, 5, 1, 3, 6 ]
Preorder: [ 1, 2, 4, 5, 3, 6 ]
Postorder: [ 4, 5, 2, 6, 3, 1 ]
Level Order: [ 1, 2, 3, 4, 5, 6 ]
Max Depth: 3
Inverted Level Order: [ 1, 3, 2, 6, 5, 4 ]
```

## Test Cases

```javascript
// Single node
const single = new TreeNode(1);
console.log(JSON.stringify(inorder(single)) === "[1]");       // true
console.log(maxDepth(single) === 1);                           // true

// Empty tree
console.log(JSON.stringify(inorder(null)) === "[]");          // true
console.log(maxDepth(null) === 0);                             // true

// Unbalanced
const unbalanced = new TreeNode(1);
unbalanced.left = new TreeNode(2);
unbalanced.left.left = new TreeNode(3);
console.log(maxDepth(unbalanced) === 3);                       // true

// Invert
const inv = invertTree({ val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } });
console.log(inv.left.val === 3 && inv.right.val === 2);       // true
```
