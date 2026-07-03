# 🏋️ Latihan DSA

## 1. Big O Identification

```typescript
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
```
**Jawaban:** O(n), O(n²), O(log n)

## 2. Two Sum

```typescript
function twoSum(nums: number[], target: number): number[] {
  // Input: [2,7,11,15], 9
  // Output: [0,1] (2+7=9)
  // Optimalkan dari O(n²) ke O(n) pake Map
  // === KODE LO DISINI ===
}
```

## 3. Valid Parentheses

```typescript
function isValid(s: string): boolean {
  // "()[]{}" -> true
  // "(]" -> false
  // Hint: Stack
  // === KODE LO DISINI ===
}
```

## 4. Merge Sort

```typescript
function mergeSort(arr: number[]): number[] {
  // === KODE LO DISINI ===
}
console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
```

## 5. Max Depth of Binary Tree

```typescript
class TreeNode {
  constructor(public val: number, public left?: TreeNode, public right?: TreeNode) {}
}

function maxDepth(root: TreeNode | null): number {
  // === KODE LO DISINI ===
}

const tree = new TreeNode(3);
tree.left = new TreeNode(9);
tree.right = new TreeNode(20, new TreeNode(15), new TreeNode(7));
console.log(maxDepth(tree)); // 3
```
